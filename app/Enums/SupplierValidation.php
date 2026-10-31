<?php

namespace App\Enums;

enum SupplierValidation: string
{
    case Pending = 'pending';
    case Validated = 'validated';
    case PriceChanged = 'price_changed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Validated => 'Validated',
            self::PriceChanged => 'Price changed',
        };
    }
}
