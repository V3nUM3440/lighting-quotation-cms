<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $brand_id
 * @property string $code
 * @property string $name
 * @property string|null $description
 * @property string $uom
 * @property string $currency
 * @property string $manufacturer_price
 * @property string|null $image_path
 * @property string|null $wattage
 * @property string|null $lumens
 * @property string|null $color_temperature
 * @property string|null $cri
 * @property string|null $beam_angle
 * @property string|null $ip_rating
 * @property string|null $finish
 * @property-read string|null $image_url
 * @property-read Brand $brand
 */
#[Fillable([
    'brand_id',
    'code',
    'name',
    'description',
    'uom',
    'currency',
    'manufacturer_price',
    'image_path',
    'wattage',
    'lumens',
    'color_temperature',
    'cri',
    'beam_angle',
    'ip_rating',
    'finish',
])]
#[Appends(['image_url'])]
class Product extends Model
{
    use LogsActivity;

    public const SPREADSHEET_COLUMNS = [
        'code',
        'name',
        'description',
        'uom',
        'currency',
        'manufacturer_price',
        'wattage',
        'lumens',
        'color_temperature',
        'cri',
        'beam_angle',
        'ip_rating',
        'finish',
    ];

    public const SPEC_LABELS = [
        'wattage' => 'Wattage',
        'lumens' => 'Lumens',
        'color_temperature' => 'Color temperature',
        'cri' => 'CRI',
        'beam_angle' => 'Beam angle',
        'ip_rating' => 'IP rating',
        'finish' => 'Finish',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'manufacturer_price' => 'decimal:2',
        ];
    }

    public function activityLabel(): string
    {
        return "{$this->code} {$this->name}";
    }

    /**
     * @return BelongsTo<Brand, $this>
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->image_path ? Storage::disk('public')->url($this->image_path) : null);
    }

    /**
     * The product's filled-in specifications, keyed by label.
     *
     * @return array<string, string>
     */
    public function specs(): array
    {
        $specs = [];

        foreach (self::SPEC_LABELS as $field => $label) {
            if (filled($this->{$field})) {
                $specs[$label] = (string) $this->{$field};
            }
        }

        return $specs;
    }

    /**
     * Apply the product list filters.
     *
     * @param  Builder<self>  $query
     * @param  array<string, mixed>  $filters
     */
    #[Scope]
    protected function filter(Builder $query, array $filters): void
    {
        $query
            ->when($filters['search'] ?? null, fn (Builder $query, $search) => $query->whereAny(['code', 'name', 'description'], 'like', "%{$search}%"))
            ->when($filters['brands'] ?? null, fn (Builder $query, $brands) => $query->whereIn('brand_id', (array) $brands));
    }
}
