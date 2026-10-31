<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $key
 * @property mixed $value
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    use LogsActivity;

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'json',
        ];
    }

    public function activityLabel(): string
    {
        return $this->key;
    }

    /**
     * Get a company setting by dot key, falling back to `config/quotation.php`.
     */
    public static function get(string $key): mixed
    {
        return data_get(self::values(), $key);
    }

    /**
     * All company settings: the saved groups over the defaults from `config/quotation.php`.
     *
     * @return array<string, mixed>
     */
    public static function values(): array
    {
        return once(fn () => array_replace(
            (array) config('quotation'),
            self::query()->pluck('value', 'key')->all(),
        ));
    }

    /**
     * Save whole setting groups, keyed by group name.
     *
     * @param  array<string, mixed>  $groups
     */
    public static function store(array $groups): void
    {
        foreach ($groups as $key => $value) {
            self::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
