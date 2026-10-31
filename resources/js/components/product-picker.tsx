import { Button, Input, Modal, Table } from '@heroui/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import Pagination from '@/components/pagination';
import { formatMoney } from '@/lib/pricing';
import { search as searchProducts } from '@/routes/products';
import type { PickerProduct } from '@/lib/revisions';
import type { Paginated } from '@/types';

type Props = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onAdd: (product: PickerProduct) => void;
};

export default function ProductPicker({ isOpen, onOpenChange, onAdd }: Props) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<Paginated<PickerProduct> | null>(
        null,
    );

    const load = async (url: string) => {
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
        });

        setResults((await response.json()) as Paginated<PickerProduct>);
    };

    useEffect(() => {
        if (isOpen && !results) {
            void load(searchProducts.url());
        }
    }, [isOpen, results]);

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container size="lg">
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Heading>Add products</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                fullWidth
                                aria-label="Search products"
                                placeholder="Brand, code, name or description"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        void load(
                                            searchProducts.url({
                                                query: { search },
                                            }),
                                        );
                                    }
                                }}
                            />
                            <Button
                                variant="secondary"
                                onPress={() =>
                                    void load(
                                        searchProducts.url({
                                            query: { search },
                                        }),
                                    )
                                }
                            >
                                <Search className="size-4" />
                                Search
                            </Button>
                        </div>

                        <Table>
                            <Table.ScrollContainer>
                                <Table.Content aria-label="Products">
                                    <Table.Header>
                                        <Table.Column isRowHeader>
                                            Brand
                                        </Table.Column>
                                        <Table.Column>Code</Table.Column>
                                        <Table.Column>Name</Table.Column>
                                        <Table.Column className="text-end">
                                            Manufacturer price
                                        </Table.Column>
                                        <Table.Column className="text-end">
                                            Add
                                        </Table.Column>
                                    </Table.Header>
                                    <Table.Body
                                        renderEmptyState={() => (
                                            <p className="p-4 text-center text-sm text-muted">
                                                No products found.
                                            </p>
                                        )}
                                    >
                                        {(results?.data ?? []).map(
                                            (product) => (
                                                <Table.Row key={product.id}>
                                                    <Table.Cell>
                                                        {product.brand.name}
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        {product.code}
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        {product.name}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-end">
                                                        {product.currency}{' '}
                                                        {formatMoney(
                                                            product.manufacturer_price,
                                                        )}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-end">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="secondary"
                                                            aria-label={`Add ${product.code}`}
                                                            onPress={() =>
                                                                onAdd(product)
                                                            }
                                                        >
                                                            <Plus className="size-4" />
                                                        </Button>
                                                    </Table.Cell>
                                                </Table.Row>
                                            ),
                                        )}
                                    </Table.Body>
                                </Table.Content>
                            </Table.ScrollContainer>
                        </Table>

                        {results && (
                            <Pagination
                                paginator={results}
                                onNavigate={(url) => void load(url)}
                            />
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button slot="close">Done</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
