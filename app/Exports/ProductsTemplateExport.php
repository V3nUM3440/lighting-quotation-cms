<?php

namespace App\Exports;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithExportTemplate;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * @implements WithMapping<Product>
 */
class ProductsTemplateExport implements FromQuery, WithCustomStartCell, WithExportTemplate, WithMapping
{
    use Exportable;

    public function __construct(private Brand $brand) {}

    /**
     * @return Builder<Product>
     */
    public function query(): Builder
    {
        return Product::query()->whereBelongsTo($this->brand)->orderBy('code');
    }

    /**
     * @param  Product  $product
     * @return array<int, mixed>
     */
    public function map($product): array
    {
        return array_map(
            fn (string $column) => $column === 'manufacturer_price' ? (float) $product->manufacturer_price : $product->{$column},
            Product::SPREADSHEET_COLUMNS,
        );
    }

    public function startCell(): string
    {
        return 'A2';
    }

    public function exportTemplate(): string
    {
        return storage_path('templates/products.xlsx');
    }
}
