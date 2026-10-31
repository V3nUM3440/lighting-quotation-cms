const round = (value: number) => Math.round(value * 100) / 100;

type Line = {
    quantity: string | number;
    manufacturer_price: string | number;
    discount: string | number;
    freight: string | number;
    customs: string | number;
    exchange_rate: string | number;
    accessories: string | number;
    margin: string | number;
    target_price?: string | number | null;
};

export function calculateLine(line: Line) {
    const value = (input: string | number | null | undefined) =>
        Number(input) || 0;

    const quantity = value(line.quantity);
    const margin = value(line.margin);
    const target = value(line.target_price);

    const unitCost = round(
        value(line.manufacturer_price) *
            (1 - value(line.discount) / 100) *
            (1 + value(line.freight) / 100) *
            (1 + value(line.customs) / 100) *
            value(line.exchange_rate),
    );
    const totalUnitCost = round(unitCost + value(line.accessories));
    const unitPrice =
        margin < 100 ? round(totalUnitCost / (1 - margin / 100)) : 0;
    const totalCost = round(totalUnitCost * quantity);
    const totalPrice = round(unitPrice * quantity);

    return {
        unitCost,
        totalUnitCost,
        unitPrice,
        totalCost,
        totalPrice,
        profit: round(totalPrice - totalCost),
        marginAtTarget: target > 0 ? (1 - totalUnitCost / target) * 100 : null,
    };
}

export function formatMoney(value: string | number) {
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
