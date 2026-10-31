<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Show the list of roles.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'permissions']);
        $actor = $request->user();

        return Inertia::render('roles/index', [
            'roles' => Role::query()
                ->with('permissions')
                ->withCount('users')
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
                ->when($filters['permissions'] ?? null, fn ($query, $permissions) => $query->where(
                    fn ($query) => $query
                        ->where('name', Role::ADMIN)
                        ->orWhereHas('permissions', fn ($query) => $query->whereIn('name', (array) $permissions)),
                ))
                ->orderBy('name')
                ->paginate(25)
                ->withQueryString()
                ->through(fn (Role $role) => $role->setAttribute('can_manage', $role->isEditableBy($actor))),
            'permissions' => Permission::query()->orderBy('id')->pluck('name'),
            'grantable' => $actor?->isAdmin() ? Permission::query()->pluck('name') : $actor?->permissions(),
            'filters' => $filters,
        ]);
    }

    /**
     * Create a role.
     */
    public function store(RoleRequest $request): RedirectResponse
    {
        $role = Role::create($request->safe()->only('name'));

        $this->syncPermissions($role, $request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role created.')]);

        return to_route('roles.index');
    }

    /**
     * Update the given role.
     */
    public function update(RoleRequest $request, Role $role): RedirectResponse
    {
        abort_unless($role->isEditableBy($request->user()), 403);

        $role->update($request->safe()->only('name'));

        $this->syncPermissions($role, $request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role updated.')]);

        return to_route('roles.index');
    }

    /**
     * Delete the given role.
     */
    public function destroy(Request $request, Role $role): RedirectResponse
    {
        abort_unless($role->isEditableBy($request->user()), 403);

        if ($role->users()->exists()) {
            Inertia::flash('toast', ['type' => 'danger', 'message' => __('This role is assigned to users and cannot be deleted.')]);

            return to_route('roles.index');
        }

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role deleted.')]);

        return to_route('roles.index');
    }

    /**
     * Sync the role's permissions with the requested permission names.
     */
    private function syncPermissions(Role $role, RoleRequest $request): void
    {
        $old = $role->permissions()->pluck('name')->sort()->values()->all();

        $role->permissions()->sync(
            Permission::query()->whereIn('name', $request->validated('permissions', []))->pluck('id'),
        );

        $new = $role->permissions()->pluck('name')->sort()->values()->all();

        if ($old !== $new) {
            ActivityLog::record('updated', "Updated permissions of role {$role->name}", $role, [
                'old' => ['permissions' => implode(', ', $old)],
                'new' => ['permissions' => implode(', ', $new)],
            ]);
        }
    }
}
