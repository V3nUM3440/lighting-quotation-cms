<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use LogicException;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $action
 * @property string|null $subject_type
 * @property string|null $subject_id
 * @property string $description
 * @property array<string, mixed>|null $properties
 * @property string|null $ip_address
 * @property Carbon $created_at
 */
#[Fillable(['user_id', 'action', 'subject_type', 'subject_id', 'description', 'properties', 'ip_address'])]
class ActivityLog extends Model
{
    public const UPDATED_AT = null;

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Activity logs cannot be changed.'));
        static::deleting(fn () => throw new LogicException('Activity logs cannot be deleted.'));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'properties' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log an action, by the given user or the signed-in one.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function record(string $action, string $description, ?Model $subject = null, array $properties = [], ?User $user = null): self
    {
        return self::create([
            'user_id' => $user->id ?? auth()->id(),
            'action' => $action,
            'subject_type' => $subject ? Str::snake(class_basename($subject)) : null,
            'subject_id' => $subject?->getKey(),
            'description' => $description,
            'properties' => $properties ?: null,
            'ip_address' => request()->ip(),
        ]);
    }
}
