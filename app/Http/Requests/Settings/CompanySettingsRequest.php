<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompanySettingsRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $image = ['nullable', 'image', 'max:2048'];
        $percent = ['required', 'numeric', 'min:0', 'max:100'];

        /** @var array<int, array<string, mixed>> $rates */
        $rates = (array) $this->input('exchange_rates', []);

        return [
            'company.name' => ['required', 'string', 'max:255'],
            'company.address' => ['nullable', 'string', 'max:255'],
            'company.phone' => ['nullable', 'string', 'max:50'],
            'company.email' => ['nullable', 'email', 'max:255'],
            'company.website' => ['nullable', 'string', 'max:255'],
            'logo' => $image,
            'stamp' => $image,
            'signature' => $image,
            'currency' => ['required', Rule::in(array_column($rates, 'code'))],
            'vat_rate' => $percent,
            'margin_floor' => ['required', 'numeric', 'min:0', 'lt:100'],
            'exchange_rates' => ['required', 'array', 'min:1'],
            'exchange_rates.*.code' => ['required', 'string', 'regex:/^[A-Z]{3}$/', 'distinct'],
            'exchange_rates.*.rate' => ['required', 'numeric', 'gt:0', 'max:999999'],
            'defaults.freight' => $percent,
            'defaults.customs' => $percent,
            'defaults.validity_days' => ['required', 'integer', 'min:1', 'max:365'],
            'defaults.payment_terms' => ['nullable', 'string', 'max:2000'],
            'defaults.terms' => ['nullable', 'string', 'max:50000'],
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
            'company.name' => 'company name',
            'company.address' => 'address',
            'company.phone' => 'phone',
            'company.email' => 'email',
            'company.website' => 'website',
            'vat_rate' => 'VAT rate',
            'margin_floor' => 'margin floor',
            'exchange_rates.*.code' => 'currency code',
            'exchange_rates.*.rate' => 'exchange rate',
            'defaults.freight' => 'default freight',
            'defaults.customs' => 'default customs',
            'defaults.validity_days' => 'default validity',
            'defaults.payment_terms' => 'default payment terms',
            'defaults.terms' => 'default terms and conditions',
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
            'currency.in' => 'The company currency must be one of the exchange rate currencies.',
            'exchange_rates.*.code.regex' => 'Use a three-letter currency code in capitals, e.g. USD.',
        ];
    }
}
