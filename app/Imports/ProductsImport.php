<?php

namespace App\Imports;

use App\Http\Requests\ProductRequest;
use App\Models\Brand;
use App\Models\Product;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithUpsertColumns;
use Maatwebsite\Excel\Concerns\WithUpserts;
use Maatwebsite\Excel\Concerns\WithValidation;

class ProductsImport implements SkipsEmptyRows, ToModel, WithBatchInserts, WithHeadingRow, WithMultipleSheets, WithUpsertColumns, WithUpserts, WithValidation
{
    use Importable;

    public function __construct(private Brand $brand) {}

    /**
     * @return array<int, self>
     */
    public function sheets(): array
    {
        return [0 => $this];
    }

    /**
     * @param  array<string, mixed>  $row
     */
    public function model(array $row): Product
    {
        return new Product([
            'brand_id' => $this->brand->id,
            ...$this->normalize($row),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function prepareForValidation(array $data, int $index): array
    {
        return $this->normalize($data);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:255'],
            ...ProductRequest::productRules(),
        ];
    }

    public function uniqueBy(): string|array
    {
        return ['brand_id', 'code'];
    }

    /**
     * @return array<int, string>
     */
    public function upsertColumns(): array
    {
        return [...Product::SPREADSHEET_COLUMNS, 'updated_at'];
    }

    public function batchSize(): int
    {
        return 500;
    }

    /**
     * Keep only the product columns, trimming text and turning blank cells into null.
     *
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function normalize(array $row): array
    {
        $data = [];

        foreach (Product::SPREADSHEET_COLUMNS as $column) {
            $value = $row[$column] ?? null;

            if (is_string($value) || (is_numeric($value) && $column !== 'manufacturer_price')) {
                $value = trim((string) $value);
            }

            $data[$column] = $value === '' ? null : $value;
        }

        $data['uom'] ??= 'NOS.';
        $data['currency'] = is_string($data['currency']) ? strtoupper($data['currency']) : $data['currency'];

        return $data;
    }
}
