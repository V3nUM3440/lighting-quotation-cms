<?php

namespace App\Http\Requests;

use App\Models\Brand;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Product|null $product */
        $product = $this->route('product');

        /** @var Brand|null $brand */
        $brand = $this->route('brand');

        return [
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique(Product::class)
                    ->where('brand_id', $brand->id ?? $product?->brand_id)
                    ->ignore($product?->id),
            ],
            ...self::productRules(),
            'image' => ['nullable', 'image', 'max:2048'],
        ];
    }

    /**
     * The rules shared by the form and the spreadsheet import, excluding the code.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function productRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'uom' => ['required', 'string', 'max:20'],
            'currency' => ['required', Rule::in(array_keys(Setting::get('exchange_rates')))],
            'manufacturer_price' => ['required', 'numeric', 'min:0', 'max:9999999999'],
            'wattage' => ['nullable', 'string', 'max:255'],
            'lumens' => ['nullable', 'string', 'max:255'],
            'color_temperature' => ['nullable', 'string', 'max:255'],
            'cri' => ['nullable', 'string', 'max:255'],
            'beam_angle' => ['nullable', 'string', 'max:255'],
            'ip_rating' => ['nullable', 'string', 'max:255'],
            'finish' => ['nullable', 'string', 'max:255'],
        ];
    }
}
