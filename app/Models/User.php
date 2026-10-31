<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string $password
 * @property int|null $role_id
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Role|null $role
 */
#[Fillable(['name', 'email', 'phone', 'password', 'role_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, LogsActivity, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * @return BelongsTo<Role, $this>
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Determine if the user has the system admin role.
     */
    public function isAdmin(): bool
    {
        return $this->role->is_admin ?? false;
    }

    /**
     * Get the names of the permissions granted to the user.
     *
     * @return array<int, string>
     */
    public function permissions(): array
    {
        $permissions = $this->isAdmin() ? Permission::all() : $this->role?->permissions;

        return $permissions?->map(fn (Permission $permission) => $permission->name)->all() ?? [];
    }

    /**
     * Whether the user may assign, edit or delete the given role. Non-admins can never
     * manage the Admin role, or a role with permissions they don't have themselves.
     */
    public function canManageRole(?Role $role): bool
    {
        if ($this->isAdmin() || $role === null) {
            return true;
        }

        if ($role->is_admin) {
            return false;
        }

        $permissions = $role->permissions->map(fn (Permission $permission) => $permission->name)->all();

        return array_diff($permissions, $this->permissions()) === [];
    }

    /**
     * Whether the user may edit or delete the given user, based on that user's role.
     */
    public function canManageUser(User $user): bool
    {
        return $this->canManageRole($user->role);
    }

    /**
     * Determine if the user is granted the given permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->isAdmin() || in_array($permission, $this->permissions(), true);
    }
}
