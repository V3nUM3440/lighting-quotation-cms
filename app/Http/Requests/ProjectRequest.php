<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjectRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Project|null $project */
        $project = $this->route('project');

        $rules = [
            'reference' => ['required', 'string', 'max:100', Rule::unique(Project::class)->ignore($project?->id)],
            'name' => ['required', 'string', 'max:255'],
            'inquiry_received_at' => ['required', 'date'],
            'salesperson_id' => ['required', Rule::exists(User::class, 'id')],
            'client_name' => ['required', 'string', 'max:255'],
            'client_address' => ['nullable', 'string', 'max:255'],
            'client_phone' => ['nullable', 'string', 'max:50'],
            'client_mobile' => ['nullable', 'string', 'max:50'],
            'client_email' => ['nullable', 'email', 'max:255'],
            'attention' => ['nullable', 'string', 'max:255'],
            'client_reference' => ['nullable', 'string', 'max:255'],
        ];

        if ($this->isMethod('post')) {
            $rules += [
                'revisions' => ['required', 'array', 'min:1'],
                ...RevisionRequest::revisionRules('revisions.*.'),
            ];
        }

        return $rules;
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'reference' => 'quote number',
            'salesperson_id' => 'salesperson',
            'client_name' => 'client',
            'client_address' => 'client address',
            'client_phone' => 'client tel',
            'client_mobile' => 'client mobile',
            'client_email' => 'client email',
            'attention' => 'attn & CC',
            'client_reference' => 'ref no.',
            ...RevisionRequest::revisionAttributes('revisions.*.'),
        ];
    }
}
