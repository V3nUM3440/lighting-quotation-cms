<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $name
 * @property list<string>|null $tags
 * @property string|null $website
 * @property string|null $logo_path
 * @property bool $is_partner
 * @property-read string|null $logo_url
 */
#[Fillable(['name', 'tags', 'website', 'logo_path', 'is_partner'])]
#[Appends(['logo_url'])]
class Brand extends Model
{
    use LogsActivity;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'is_partner' => 'boolean',
        ];
    }

    /**
     * @return HasMany<BrandContact, $this>
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(BrandContact::class);
    }

    /**
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function logoUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null);
    }
}
