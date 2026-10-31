import { Table } from '@heroui/react';
import { usePage } from '@inertiajs/react';
import { formatMoney } from '@/lib/pricing';
import type { ProjectRevision } from '@/types';

const number = (value: string) => String(Number(value));

export default function RevisionItemsTable({
    revision,
}: {
    revision: ProjectRevision;
}) {
    const { currency } = usePage().props;
    const totalCost = revision.items.reduce(
        (sum, item) => sum + Number(item.total_cost),
        0,
    );
    const total = revision.items.reduce(
        (sum, item) => sum + Number(item.total_price),
        0,
    );
    const vat = Math.round(total * Number(revision.vat_rate)) / 100;

    return (
        <div className="space-y-3">
            <Table>
                <Table.ScrollContainer>
                    <Table.Content
                        aria-label={`Revision ${revision.number}`}
                        className="min-w-[80rem]"
                    >
                        <Table.Header>
                            <Table.Column isRowHeader>#</Table.Column>
                            <Table.Column>Type</Table.Column>
                            <Table.Column>Product</Table.Column>
                            <Table.Column className="text-end">
                                Qty
                            </Table.Column>
                            <Table.Column className="text-end">
                                Mfr. price
                            </Table.Column>
                            <Table.Column className="text-end">
                                Disc. %
                            </Table.Column>
                            <Table.Column className="text-end">
                                Freight %
                            </Table.Column>
                            <Table.Column className="text-end">
                                Customs %
                            </Table.Column>
                            <Table.Column className="text-end">
                                Rate
                            </Table.Column>
                            <Table.Column className="text-end">
                                Unit cost
                            </Table.Column>
                            <Table.Column className="text-end">
                                Acc.
                            </Table.Column>
                            <Table.Column className="text-end">
                                Total unit cost
                            </Table.Column>
                            <Table.Column className="text-end">
                                Margin %
                            </Table.Column>
                            <Table.Column className="text-end">
                                Unit price
                            </Table.Column>
                            <Table.Column className="text-end">
                                Total cost
                            </Table.Column>
                            <Table.Column className="text-end">
                                Total price
                            </Table.Column>
                        </Table.Header>
                        <Table.Body>
                            {revision.items.map((item, i) => (
                                <Table.Row key={item.id}>
                                    <Table.Cell>{i + 1}</Table.Cell>
                                    <Table.Cell>{item.type}</Table.Cell>
                                    <Table.Cell>
                                        <p className="font-medium">
                                            {item.brand_name} ·{' '}
                                            {item.product_code}
                                        </p>
                                        <p className="text-xs text-muted">
                                            {item.product_name}
                                        </p>
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {number(item.quantity)} {item.uom}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {item.currency}{' '}
                                        {formatMoney(item.manufacturer_price)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {number(item.discount)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {number(item.freight)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {number(item.customs)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {number(item.exchange_rate)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {formatMoney(item.unit_cost)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {formatMoney(item.accessories)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {formatMoney(item.total_unit_cost)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {Number(item.margin).toFixed(2)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {formatMoney(item.unit_price)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end">
                                        {formatMoney(item.total_cost)}
                                    </Table.Cell>
                                    <Table.Cell className="text-end font-medium">
                                        {formatMoney(item.total_price)}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
            </Table>

            <dl className="ml-auto grid w-fit grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm">
                <dt className="text-muted">Total cost</dt>
                <dd className="text-end">{formatMoney(totalCost)}</dd>
                <dt className="text-muted">Total</dt>
                <dd className="text-end">{formatMoney(total)}</dd>
                <dt className="text-muted">
                    VAT ({Number(revision.vat_rate)}%)
                </dt>
                <dd className="text-end">{formatMoney(vat)}</dd>
                <dt className="font-medium">Gross total</dt>
                <dd className="text-end font-medium">
                    {currency} {formatMoney(total + vat)}
                </dd>
                <dt className="text-muted">Profit</dt>
                <dd className="text-end">{formatMoney(total - totalCost)}</dd>
            </dl>
        </div>
    );
}
