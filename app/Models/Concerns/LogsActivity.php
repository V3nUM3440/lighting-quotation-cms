<?php

namespace App\Models\Concerns;

use App\Models\ActivityLog;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

trait LogsActivity
{
    public const IGNORED_ATTRIBUTES = ['id', 'created_at', 'updated_at', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at'];

    public static function bootLogsActivity(): void
    {
        static::created(fn (self $model) => $model->logActivity('created', [], $model->loggableAttributes($model->getAttributes())));

        static::updated(function (self $model) {
            $new = $model->loggableAttributes($model->getChanges());

            if ($new) {
                $model->logActivity('updated', $model->loggableAttributes(Arr::map($new, fn ($value, string $key) => $model->getRawOriginal($key))), $new);
            }
        });

        static::deleted(fn (self $model) => $model->logActivity('deleted', $model->loggableAttributes($model->getRawOriginal()), []));
    }

    /**
     * The name that identifies this record in the activity log.
     */
    public function activityLabel(): string
    {
        return (string) $this->getAttribute('name');
    }

    /**
     * @param  array<string, mixed>  $old
     * @param  array<string, mixed>  $new
     */
    protected function logActivity(string $action, array $old, array $new): void
    {
        ActivityLog::record(
            $action,
            Str::ucfirst($action).' '.Str::lower(Str::headline(class_basename($this))).' '.$this->activityLabel(),
            $this,
            array_filter(['old' => $old, 'new' => $new]),
        );
    }

    /**
     * The attributes worth logging, with hidden values masked.
     *
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    protected function loggableAttributes(array $attributes): array
    {
        $attributes = Arr::except($attributes, self::IGNORED_ATTRIBUTES);

        foreach (array_intersect(array_keys($attributes), $this->getHidden()) as $key) {
            $attributes[$key] = '(hidden)';
        }

        return $attributes;
    }
}
