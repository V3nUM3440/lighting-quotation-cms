import type {
    Brand,
    ItemRow,
    Product,
    ProjectRevision,
    ProjectRevisionItem,
    RevisionDefaults,
    RevisionStage,
    RevisionDraft,
} from '@/types';

export type PickerProduct = Product & { brand: Pick<Brand, 'id' | 'name'> };

export function newDraft(
    defaults: RevisionDefaults,
    revision?: ProjectRevision,
): RevisionDraft {
    return {
        key: crypto.randomUUID(),
        items: (revision?.items ?? [])
            .filter((item) => item.product_id !== null)
            .map(rowFromItem),
        validity_days: String(
            revision?.validity_days ?? defaults.validity_days,
        ),
        payment_terms: revision?.payment_terms ?? defaults.payment_terms,
        terms: revision?.terms ?? defaults.terms,
    };
}

export function copyDraft(draft: RevisionDraft): RevisionDraft {
    return {
        ...draft,
        key: crypto.randomUUID(),
        items: draft.items.map((item) => ({
            ...item,
            key: crypto.randomUUID(),
        })),
    };
}

export function rowFromProduct(
    product: PickerProduct,
    defaults: RevisionDefaults,
    companyCurrency: string,
): ItemRow {
    const imported = product.currency !== companyCurrency;

    return {
        key: crypto.randomUUID(),
        product_id: product.id,
        brand_name: product.brand.name,
        product_code: product.code,
        product_name: product.name,
        uom: product.uom,
        currency: product.currency,
        type: '',
        quantity: '1',
        manufacturer_price: product.manufacturer_price,
        discount: '0',
        freight: String(imported ? defaults.freight : 0),
        customs: String(imported ? defaults.customs : 0),
        exchange_rate: String(defaults.exchangeRates[product.currency] ?? 1),
        accessories: '0',
        margin: '0',
        target_price: '',
    };
}

function rowFromItem(item: ProjectRevisionItem): ItemRow {
    return {
        key: crypto.randomUUID(),
        product_id: item.product_id as number,
        brand_name: item.brand_name,
        product_code: item.product_code,
        product_name: item.product_name,
        uom: item.uom,
        currency: item.currency,
        type: item.type ?? '',
        quantity: String(Number(item.quantity)),
        manufacturer_price: item.manufacturer_price,
        discount: String(Number(item.discount)),
        freight: String(Number(item.freight)),
        customs: String(Number(item.customs)),
        exchange_rate: String(Number(item.exchange_rate)),
        accessories: item.accessories,
        margin: String(Number(item.margin)),
        target_price: item.target_price ?? '',
    };
}

export const stageColors: Record<
    RevisionStage,
    'default' | 'accent' | 'success' | 'warning' | 'danger'
> = {
    pending_approval: 'warning',
    rejected: 'danger',
    awaiting_validation: 'default',
    price_changed: 'danger',
    ready_to_issue: 'accent',
    issued: 'success',
};
