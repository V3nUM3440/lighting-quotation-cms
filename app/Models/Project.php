<?php

namespace App\Models;

use App\Enums\ApprovalStatus;
use App\Enums\SupplierValidation;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $reference
 * @property string $name
 * @property Carbon $inquiry_received_at
 * @property int|null $salesperson_id
 * @property string $client_name
 * @property string|null $client_address
 * @property string|null $client_phone
 * @property string|null $client_mobile
 * @property string|null $client_email
 * @property string|null $attention
 * @property string|null $client_reference
 * @property-read User|null $salesperson
 */
#[Fillable([
    'reference',
    'name',
    'inquiry_received_at',
    'salesperson_id',
    'client_name',
    'client_address',
    'client_phone',
    'client_mobile',
    'client_email',
    'attention',
    'client_reference',
])]
class Project extends Model
{
    use LogsActivity;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'inquiry_received_at' => 'date:Y-m-d',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function salesperson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'salesperson_id');
    }

    /**
     * @return HasMany<ProjectRevision, $this>
     */
    public function revisions(): HasMany
    {
        return $this->hasMany(ProjectRevision::class);
    }

    /**
     * @return HasOne<ProjectRevision, $this>
     */
    public function latestRevision(): HasOne
    {
        return $this->hasOne(ProjectRevision::class)->ofMany('number', 'max');
    }

    /**
     * Create the next revision from the validated revision data. Revisions below the
     * margin floor start as pending approval, and supplier validation starts as pending.
     *
     * @param  array<string, mixed>  $data
     */
    public function addRevision(array $data, User $preparedBy): ProjectRevision
    {
        /** @var array<int, array<string, mixed>> $items */
        $items = $data['items'];

        $products = Product::query()->with('brand')->findMany(array_column($items, 'product_id'))->keyBy('id');

        $lines = array_map(
            fn (array $item) => ProjectRevisionItem::fromProduct($products[$item['product_id']], $item),
            $items,
        );

        $totalPrice = array_sum(array_map(fn (ProjectRevisionItem $line) => (float) $line->total_price, $lines));
        $totalCost = array_sum(array_map(fn (ProjectRevisionItem $line) => (float) $line->total_cost, $lines));
        $margin = $totalPrice > 0 ? ($totalPrice - $totalCost) / $totalPrice * 100 : 0;
        $marginFloor = (float) Setting::get('margin_floor');

        $revision = $this->revisions()->create([
            'number' => (int) $this->revisions()->max('number') + 1,
            'prepared_by_id' => $preparedBy->id,
            'vat_rate' => (float) Setting::get('vat_rate'),
            'validity_days' => $data['validity_days'],
            'payment_terms' => $data['payment_terms'] ?? null,
            'terms' => $data['terms'] ?? null,
            'margin_floor' => $marginFloor,
            'approval_status' => $margin < $marginFloor ? ApprovalStatus::Pending : ApprovalStatus::NotRequired,
            'supplier_validation' => SupplierValidation::Pending,
        ]);

        $revision->items()->saveMany($lines);
        $revision->record($preparedBy, 'Revision created');

        return $revision;
    }
}
