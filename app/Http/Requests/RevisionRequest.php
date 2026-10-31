<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RevisionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return self::revisionRules();
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return self::revisionAttributes();
    }

    /**
     * The rules for a revision's details and line items, prefixed with the revision's key.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function revisionRules(string $prefix = ''): array
    {
        $percent = ['required', 'numeric', 'min:0', 'max:100'];

        return [
            "{$prefix}validity_days" => ['required', 'integer', 'min:1', 'max:365'],
            "{$prefix}payment_terms" => ['nullable', 'string', 'max:2000'],
            "{$prefix}terms" => ['nullable', 'string', 'max:50000'],
            "{$prefix}items" => ['required', 'array', 'min:1'],
            "{$prefix}items.*.product_id" => ['required', 'integer', Rule::exists(Product::class, 'id')],
            "{$prefix}items.*.type" => ['nullable', 'string', 'max:100'],
            "{$prefix}items.*.quantity" => ['required', 'numeric', 'gt:0', 'max:9999999'],
            "{$prefix}items.*.manufacturer_price" => ['required', 'numeric', 'min:0', 'max:9999999999'],
            "{$prefix}items.*.discount" => ['required', 'numeric', 'min:0', 'lt:100'],
            "{$prefix}items.*.freight" => $percent,
            "{$prefix}items.*.customs" => $percent,
            "{$prefix}items.*.exchange_rate" => ['required', 'numeric', 'gt:0', 'max:999999'],
            "{$prefix}items.*.accessories" => ['required', 'numeric', 'min:0', 'max:9999999999'],
            "{$prefix}items.*.margin" => ['required', 'numeric', 'min:0', 'lt:100'],
            "{$prefix}items.*.target_price" => ['nullable', 'numeric', 'gt:0', 'max:9999999999'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function revisionAttributes(string $prefix = ''): array
    {
        return [
            "{$prefix}validity_days" => 'validity',
            "{$prefix}payment_terms" => 'payment terms',
            "{$prefix}terms" => 'terms and conditions',
            "{$prefix}items" => 'products',
            "{$prefix}items.*.product_id" => 'product',
            "{$prefix}items.*.type" => 'type',
            "{$prefix}items.*.quantity" => 'quantity',
            "{$prefix}items.*.manufacturer_price" => 'manufacturer price',
            "{$prefix}items.*.discount" => 'discount',
            "{$prefix}items.*.freight" => 'freight',
            "{$prefix}items.*.customs" => 'customs',
            "{$prefix}items.*.exchange_rate" => 'exchange rate',
            "{$prefix}items.*.accessories" => 'accessories',
            "{$prefix}items.*.margin" => 'margin',
            "{$prefix}items.*.target_price" => 'target price',
        ];
    }
}
