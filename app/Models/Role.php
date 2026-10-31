<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property-read bool $is_admin
 */
#[Fillable(['name'])]
#[Appends(['is_admin'])]
class Role extends Model
{
    use LogsActivity;

    public const ADMIN = 'Admin';

    /**
     * @return BelongsToMany<Permission, $this>
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class);
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * The Admin role is a system role and can never be edited or deleted; other roles
     * can be by users who are allowed to manage them.
     */
    public function isEditableBy(?User $user): bool
    {
        return ! $this->is_admin && (bool) $user?->canManageRole($this);
    }

    /**
     * Determine if this is the system admin role.
     *
     * @return Attribute<bool, never>
     */
    protected function isAdmin(): Attribute
    {
        return Attribute::get(fn (): bool => $this->name === self::ADMIN);
    }
}
