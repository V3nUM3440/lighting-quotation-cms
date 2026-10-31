<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use LogicException;

/**
 * @property int $id
 * @property int $project_revision_id
 * @property int|null $product_id
 * @property string|null $type
 * @property string $brand_name
 * @property string $product_code
 * @property string $product_name
 * @property string|null $description
 * @property array<string, string>|null $specs
 * @property string|null $image_path
 * @property string $uom
 * @property string $currency
 * @property string $quantity
 * @property string $manufacturer_price
 * @property string $discount
 * @property string $freight
 * @property string $customs
 * @property string $exchange_rate
 * @property string $unit_cost
 * @property string $accessories
 * @property string $total_unit_cost
 * @property string $margin
 * @property string $unit_price
 * @property string $total_cost
 * @property string $total_price
 * @property string|null $target_price
 * @property-read string|null $image_url
 */
#[Fillable([
    'product_id',
    'type',
    'brand_name',
    'product_code',
    'product_name',
    'description',
    'specs',
    'image_path',
    'uom',
    'currency',
    'quantity',
    'manufacturer_price',
    'discount',
    'freight',
    'customs',
    'exchange_rate',
    'unit_cost',
    'accessories',
    'total_unit_cost',
    'margin',
    'unit_price',
    'total_cost',
    'total_price',
    'target_price',
])]
#[Appends(['image_url'])]
class ProjectRevisionItem extends Model
{
    /**
     * Revision items are read-only once saved.
     */
    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Project revision items cannot be changed.'));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'specs' => 'array',
            'quantity' => 'decimal:2',
            'manufacturer_price' => 'decimal:2',
            'discount' => 'decimal:2',
            'freight' => 'decimal:2',
            'customs' => 'decimal:2',
            'exchange_rate' => 'decimal:4',
            'unit_cost' => 'decimal:2',
            'accessories' => 'decimal:2',
            'total_unit_cost' => 'decimal:2',
            'margin' => 'decimal:4',
            'unit_price' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'total_price' => 'decimal:2',
            'target_price' => 'decimal:2',
        ];
    }

    /**
     * Build a line from a product and the costing inputs entered for it, copying the product's
     * details so later directory changes don't affect the revision.
     *
     * @param  array<string, mixed>  $line
     */
    public static function fromProduct(Product $product, array $line): self
    {
        $quantity = (float) $line['quantity'];
        $unitCost = round(
            (float) $line['manufacturer_price']
            * (1 - (float) $line['discount'] / 100)
            * (1 + (float) $line['freight'] / 100)
            * (1 + (float) $line['customs'] / 100)
            * (float) $line['exchange_rate'],
            2,
        );
        $totalUnitCost = round($unitCost + (float) $line['accessories'], 2);
        $unitPrice = round($totalUnitCost / (1 - (float) $line['margin'] / 100), 2);

        return new self([
            'product_id' => $product->id,
            'type' => $line['type'] ?? null,
            'brand_name' => $product->brand->name,
            'product_code' => $product->code,
            'product_name' => $product->name,
            'description' => $product->description,
            'specs' => $product->specs(),
            'image_path' => $product->image_path,
            'uom' => $product->uom,
            'currency' => $product->currency,
            'quantity' => $quantity,
            'manufacturer_price' => $line['manufacturer_price'],
            'discount' => $line['discount'],
            'freight' => $line['freight'],
            'customs' => $line['customs'],
            'exchange_rate' => $line['exchange_rate'],
            'unit_cost' => $unitCost,
            'accessories' => $line['accessories'],
            'total_unit_cost' => $totalUnitCost,
            'margin' => $line['margin'],
            'unit_price' => $unitPrice,
            'total_cost' => round($totalUnitCost * $quantity, 2),
            'total_price' => round($unitPrice * $quantity, 2),
            'target_price' => $line['target_price'] ?? null,
        ]);
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->image_path ? Storage::disk('public')->url($this->image_path) : null);
    }

    /**
     * @return BelongsTo<ProjectRevision, $this>
     */
    public function revision(): BelongsTo
    {
        return $this->belongsTo(ProjectRevision::class, 'project_revision_id');
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
