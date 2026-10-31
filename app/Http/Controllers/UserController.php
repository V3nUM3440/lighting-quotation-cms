<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Show the list of users.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'roles']);
        $actor = $request->user();
        $roles = Role::query()->with('permissions')->orderBy('name')->get();

        return Inertia::render('users/index', [
            'users' => User::query()
                ->with('role.permissions')
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->whereAny(['name', 'email'], 'like', "%{$search}%"))
                ->when($filters['roles'] ?? null, fn ($query, $roles) => $query->whereIn('role_id', (array) $roles))
                ->orderBy('name')
                ->paginate(25)
                ->withQueryString()
                ->through(fn (User $user) => $user->setAttribute('can_manage', (bool) $actor?->canManageUser($user))),
            'roles' => $roles->map(fn (Role $role) => ['id' => $role->id, 'name' => $role->name]),
            'assignableRoleIds' => $roles->filter(fn (Role $role) => (bool) $actor?->canManageRole($role))->pluck('id')->values(),
            'defaultPassword' => $actor?->can('users.create') ? config('auth.default_password') : null,
            'filters' => $filters,
        ]);
    }

    /**
     * Create a user with the default password.
     */
    public function store(UserRequest $request): RedirectResponse
    {
        User::create([
            ...$request->validated(),
            'password' => config('auth.default_password'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User created. Their password is ":password" until they change it.', ['password' => config('auth.default_password')])]);

        return to_route('users.index');
    }

    /**
     * Update the given user.
     */
    public function update(UserRequest $request, User $user): RedirectResponse
    {
        abort_unless($request->user()?->canManageUser($user), 403);

        $user->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('users.index');
    }

    /**
     * Delete the given user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_unless($request->user()?->canManageUser($user), 403);
        abort_if($user->is($request->user()), 403);

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted.')]);

        return to_route('users.index');
    }
}
