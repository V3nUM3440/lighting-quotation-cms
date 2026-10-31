<?php

namespace App\Http\Requests;

use App\Models\Brand;
use App\Models\BrandContact;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BrandRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Brand|null $brand */
        $brand = $this->route('brand');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique(Brand::class)->ignore($brand?->id)],
            'tags' => ['array'],
            'tags.*' => ['string', 'max:50', 'distinct'],
            'website' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'is_partner' => ['boolean'],
            'contacts' => ['array'],
            'contacts.*.id' => ['nullable', 'integer', Rule::exists(BrandContact::class, 'id')->where('brand_id', $brand?->id)],
            'contacts.*.name' => ['required', 'string', 'max:255'],
            'contacts.*.phone' => ['nullable', 'string', 'max:50'],
            'contacts.*.email' => ['nullable', 'email', 'max:255'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'contacts.*.name' => 'contact name',
            'contacts.*.phone' => 'contact phone',
            'contacts.*.email' => 'contact email',
        ];
    }
}
