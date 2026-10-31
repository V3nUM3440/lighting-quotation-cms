import { Button } from '@heroui/react';
import { usePage } from '@inertiajs/react';
import { Plus, Target, Trash2 } from 'lucide-react';
import { useState } from 'react';
import FormField from '@/components/form-field';
import ProductPicker from '@/components/product-picker';
import { calculateLine, formatMoney } from '@/lib/pricing';
import { rowFromProduct } from '@/lib/revisions';
import type { ItemRow, RevisionDefaults } from '@/types';

type Props = {
    items: ItemRow[];
    onChange: (items: ItemRow[]) => void;
    name: string;
    errorKey: string;
    errors: Partial<Record<string, string>>;
    defaults: RevisionDefaults;
};

export default function RevisionItemsEditor({
    items,
    onChange,
    name,
    errorKey,
    errors,
    defaults,
}: Props) {
    const { currency } = usePage().props;
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const lines = items.map((item) => calculateLine(item));
    const totalCost = lines.reduce((sum, line) => sum + line.totalCost, 0);
    const total = lines.reduce((sum, line) => sum + line.totalPrice, 0);
    const vat = Math.round(total * defaults.vatRate) / 100;
    const margin = total ? ((total - totalCost) / total) * 100 : 0;
    const belowFloor = items.length > 0 && margin < defaults.marginFloor;

    const update = (key: string, field: keyof ItemRow, value: string) =>
        onChange(
            items.map((item) =>
                item.key === key ? { ...item, [field]: value } : item,
            ),
        );

    return (
        <div className="space-y-3">
            {items.map((item, i) => {
                const line = lines[i];
                const field = (
                    key: keyof ItemRow,
                    label: string,
                    inputMode: 'decimal' | 'text' = 'decimal',
                ) => (
                    <FormField
                        label={label}
                        name={`${name}[${i}][${key}]`}
                        inputMode={inputMode}
                        value={item[key] as string}
                        onChange={(value) => update(item.key, key, value)}
                        error={errors[`${errorKey}.${i}.${key}`]}
                    />
                );

                return (
                    <div
                        key={item.key}
                        className="space-y-3 rounded-xl border border-separator p-3"
                    >
                        <input
                            type="hidden"
                            name={`${name}[${i}][product_id]`}
                            value={item.product_id}
                        />
                        <div className="flex items-start justify-between gap-2">
                            <div className="text-sm">
                                <p className="font-medium">
                                    {i + 1}. {item.brand_name} ·{' '}
                                    {item.product_code}
                                </p>
                                <p className="text-xs text-muted">
                                    {item.product_name} · {item.currency} ·{' '}
                                    {item.uom}
                                </p>
                                <p className="text-xs text-danger">
                                    {errors[`${errorKey}.${i}.product_id`]}
                                </p>
                            </div>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                aria-label="Remove product"
                                onPress={() =>
                                    onChange(
                                        items.filter(
                                            (row) => row.key !== item.key,
                                        ),
                                    )
                                }
                            >
                                <Trash2 className="size-4 text-danger" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-10">
                            {field('type', 'Type', 'text')}
                            {field('quantity', `Qty (${item.uom})`)}
                            {field(
                                'manufacturer_price',
                                `Mfr. price (${item.currency})`,
                            )}
                            {field('discount', 'Discount %')}
                            {field('freight', 'Freight %')}
                            {field('customs', 'Customs %')}
                            {field('exchange_rate', 'Exchange rate')}
                            {field('accessories', `Accessories (${currency})`)}
                            {field('margin', 'Margin %')}
                            {field('target_price', 'Target price')}
                        </div>

                        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg bg-default/50 p-2 text-xs sm:grid-cols-4 lg:grid-cols-7">
                            {[
                                ['Unit cost', line.unitCost],
                                ['Total unit cost', line.totalUnitCost],
                                ['Unit price', line.unitPrice],
                                ['Total cost', line.totalCost],
                                ['Total price', line.totalPrice],
                                ['Profit', line.profit],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <dt className="text-muted">{label}</dt>
                                    <dd className="font-medium">
                                        {formatMoney(value)}
                                    </dd>
                                </div>
                            ))}
                            <div>
                                <dt className="text-muted">Margin at target</dt>
                                <dd className="flex items-center gap-1 font-medium">
                                    {line.marginAtTarget === null
                                        ? '-'
                                        : `${line.marginAtTarget.toFixed(2)}%`}
                                    {line.marginAtTarget !== null && (
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="ghost"
                                            aria-label="Use target margin"
                                            className="size-6 min-w-6"
                                            onPress={() =>
                                                update(
                                                    item.key,
                                                    'margin',
                                                    String(
                                                        Number(
                                                            line.marginAtTarget?.toFixed(
                                                                4,
                                                            ),
                                                        ),
                                                    ),
                                                )
                                            }
                                        >
                                            <Target className="size-3.5" />
                                        </Button>
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </div>
                );
            })}

            {items.length === 0 && (
                <p className="py-4 text-center text-sm text-muted">
                    No products added.
                </p>
            )}

            {belowFloor && (
                <p className="rounded-lg bg-warning/10 p-2 text-sm text-warning">
                    The margin is below the {defaults.marginFloor}% floor. This
                    revision will need approval before its quotation can be
                    issued.
                </p>
            )}

            {errors[errorKey] && (
                <p className="text-sm text-danger">{errors[errorKey]}</p>
            )}

            <div className="flex flex-wrap items-start justify-between gap-4">
                <Button
                    variant="secondary"
                    onPress={() => setIsPickerOpen(true)}
                >
                    <Plus className="size-4" />
                    Add products
                </Button>
                <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm">
                    <dt className="text-muted">Total cost</dt>
                    <dd className="text-end">{formatMoney(totalCost)}</dd>
                    <dt className="text-muted">Total</dt>
                    <dd className="text-end">{formatMoney(total)}</dd>
                    <dt className="text-muted">VAT ({defaults.vatRate}%)</dt>
                    <dd className="text-end">{formatMoney(vat)}</dd>
                    <dt className="font-medium">Gross total</dt>
                    <dd className="text-end font-medium">
                        {currency} {formatMoney(total + vat)}
                    </dd>
                    <dt className="text-muted">Profit</dt>
                    <dd className="text-end">
                        {formatMoney(total - totalCost)}
                    </dd>
                    <dt className="text-muted">Margin</dt>
                    <dd
                        className={`text-end ${belowFloor ? 'font-medium text-warning' : ''}`}
                    >
                        {margin.toFixed(2)}%
                    </dd>
                </dl>
            </div>

            <ProductPicker
                isOpen={isPickerOpen}
                onOpenChange={setIsPickerOpen}
                onAdd={(product) =>
                    onChange([
                        ...items,
                        rowFromProduct(product, defaults, currency),
                    ])
                }
            />
        </div>
    );
}
