<?php

namespace App\Http\Requests;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Role|null $role */
        $role = $this->route('role');

        $grantable = $this->user()?->isAdmin()
            ? Rule::exists(Permission::class, 'name')
            : Rule::in($this->user()?->permissions() ?? []);

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique(Role::class)->ignore($role?->id)],
            'permissions' => ['array'],
            'permissions.*' => ['string', $grantable],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'permissions.*.in' => 'You cannot grant a permission you do not have.',
        ];
    }
}
