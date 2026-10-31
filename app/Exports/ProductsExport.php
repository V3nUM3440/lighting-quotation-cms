<?php

namespace App\Exports;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * @implements WithMapping<Product>
 */
class ProductsExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    use Exportable;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function __construct(private array $filters) {}

    /**
     * @return Builder<Product>
     */
    public function query(): Builder
    {
        return Product::query()
            ->with('brand:id,name')
            ->filter($this->filters)
            ->orderBy(Brand::select('name')->whereColumn('brands.id', 'products.brand_id'))
            ->orderBy('code');
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return [
            'Brand',
            'Code',
            'Name',
            'Description',
            'UOM',
            'Currency',
            'Manufacturer Price',
            'Wattage',
            'Lumens',
            'Color Temperature',
            'CRI',
            'Beam Angle',
            'IP Rating',
            'Finish',
        ];
    }

    /**
     * @param  Product  $product
     * @return array<int, mixed>
     */
    public function map($product): array
    {
        return [
            $product->brand->name,
            $product->code,
            $product->name,
            $product->description,
            $product->uom,
            $product->currency,
            (float) $product->manufacturer_price,
            $product->wattage,
            $product->lumens,
            $product->color_temperature,
            $product->cri,
            $product->beam_angle,
            $product->ip_rating,
            $product->finish,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}
