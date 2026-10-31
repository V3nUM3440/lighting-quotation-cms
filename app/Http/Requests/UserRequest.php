<?php

namespace App\Http\Requests;

use App\Concerns\ProfileValidationRules;
use App\Models\Role;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var User|null $user */
        $user = $this->route('user');

        return [
            ...$this->profileRules($user?->id),
            'role_id' => [
                'required',
                Rule::exists(Role::class, 'id'),
                function (string $attribute, mixed $value, Closure $fail) {
                    $role = Role::query()->whereKey($value)->first();

                    if ($role && ! $this->user()?->canManageRole($role)) {
                        $fail('You cannot assign a role with permissions you do not have.');
                    }
                },
            ],
        ];
    }
}
