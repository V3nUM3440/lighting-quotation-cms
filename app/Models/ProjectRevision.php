<?php

namespace App\Models;

use App\Enums\ApprovalStatus;
use App\Enums\RevisionStage;
use App\Enums\SupplierValidation;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use LogicException;

/**
 * @property int $id
 * @property int $project_id
 * @property int $number
 * @property int|null $prepared_by_id
 * @property string $vat_rate
 * @property int $validity_days
 * @property string|null $payment_terms
 * @property string|null $terms
 * @property string $margin_floor
 * @property ApprovalStatus $approval_status
 * @property string|null $approval_note
 * @property int|null $approved_by_id
 * @property Carbon|null $approved_at
 * @property SupplierValidation $supplier_validation
 * @property Carbon|null $issued_at
 * @property int|null $issued_by_id
 * @property string|null $issue_note
 * @property Carbon $created_at
 * @property-read Project $project
 * @property-read User|null $preparedBy
 */
#[Fillable([
    'number',
    'prepared_by_id',
    'vat_rate',
    'validity_days',
    'payment_terms',
    'terms',
    'margin_floor',
    'approval_status',
    'approval_note',
    'approved_by_id',
    'approved_at',
    'supplier_validation',
    'issued_at',
    'issued_by_id',
    'issue_note',
])]
#[Appends(['stage', 'stage_label', 'approval_label', 'supplier_validation_label'])]
class ProjectRevision extends Model
{
    use LogsActivity;

    /**
     * The only attributes that may change once a revision is saved.
     */
    public const STATUS_FIELDS = [
        'approval_status',
        'approval_note',
        'approved_by_id',
        'approved_at',
        'supplier_validation',
        'issued_at',
        'issued_by_id',
        'issue_note',
        'updated_at',
    ];

    /**
     * A revision's content is read-only once saved; only its statuses change.
     */
    protected static function booted(): void
    {
        static::updating(function (self $revision) {
            if (array_diff(array_keys($revision->getDirty()), self::STATUS_FIELDS)) {
                throw new LogicException('Project revisions cannot be changed.');
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'vat_rate' => 'decimal:2',
            'validity_days' => 'integer',
            'margin_floor' => 'decimal:2',
            'approval_status' => ApprovalStatus::class,
            'approved_at' => 'datetime',
            'supplier_validation' => SupplierValidation::class,
            'issued_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function preparedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prepared_by_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by_id');
    }

    /**
     * @return HasMany<ProjectRevisionItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(ProjectRevisionItem::class);
    }

    /**
     * @return HasMany<ProjectRevisionEvent, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(ProjectRevisionEvent::class);
    }

    public function activityLabel(): string
    {
        return $this->quoteNumber();
    }

    /**
     * The quotation number for this revision, e.g. "RA QTS 10-E16086 R1".
     */
    public function quoteNumber(): string
    {
        return "{$this->project->reference} R{$this->number}";
    }

    /**
     * Whether this is the project's newest revision; older revisions are superseded.
     */
    public function isLatest(): bool
    {
        return $this->number === (int) $this->project->revisions()->max('number');
    }

    /**
     * Add an entry to the revision's activity log.
     */
    public function record(?User $user, string $action, ?string $note = null): void
    {
        $this->events()->create(['user_id' => $user?->id, 'action' => $action, 'note' => $note]);
    }

    /**
     * Where the revision is in the approval, validation and issue process.
     */
    public function currentStage(): RevisionStage
    {
        return match (true) {
            $this->issued_at !== null => RevisionStage::Issued,
            $this->approval_status === ApprovalStatus::Pending => RevisionStage::PendingApproval,
            $this->approval_status === ApprovalStatus::Rejected => RevisionStage::Rejected,
            $this->supplier_validation === SupplierValidation::PriceChanged => RevisionStage::PriceChanged,
            $this->supplier_validation === SupplierValidation::Pending => RevisionStage::AwaitingValidation,
            default => RevisionStage::ReadyToIssue,
        };
    }

    /**
     * @return Attribute<RevisionStage, never>
     */
    protected function stage(): Attribute
    {
        return Attribute::get(fn () => $this->currentStage());
    }

    /**
     * @return Attribute<string, never>
     */
    protected function stageLabel(): Attribute
    {
        return Attribute::get(fn (): string => $this->currentStage()->label());
    }

    /**
     * @return Attribute<string, never>
     */
    protected function approvalLabel(): Attribute
    {
        return Attribute::get(fn (): string => $this->approval_status->label());
    }

    /**
     * @return Attribute<string, never>
     */
    protected function supplierValidationLabel(): Attribute
    {
        return Attribute::get(fn (): string => $this->supplier_validation->label());
    }
}
