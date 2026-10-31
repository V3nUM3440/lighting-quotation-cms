import { buttonVariants, Table } from '@heroui/react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Download } from 'lucide-react';
import DirectoryTabs from '@/components/directory-tabs';
import Filters from '@/components/filters';
import FormField from '@/components/form-field';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { formatMoney } from '@/lib/pricing';
import SelectField from '@/components/select-field';
import { show } from '@/routes/brands';
import { directory } from '@/routes';
import { exportMethod as exportProducts, index } from '@/routes/products';
import type {
    Brand,
    Filters as FilterValues,
    Paginated,
    Product,
} from '@/types';

type Props = {
    products: Paginated<Product & { brand: Pick<Brand, 'id' | 'name'> }>;
    brands: Pick<Brand, 'id' | 'name'>[];
    filters: FilterValues;
};

export default function Products({ products, brands, filters }: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Products" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Directory"
                        description="Brands and the products they supply"
                    />
                    {auth.permissions.includes('products.export') && (
                        <a
                            href={exportProducts.url({ query: filters })}
                            className={buttonVariants({ variant: 'secondary' })}
                        >
                            <Download className="size-4" />
                            Export
                        </a>
                    )}
                </div>

                <DirectoryTabs selected="products" />

                <Filters action={index.url()}>
                    <FormField
                        label="Search"
                        name="search"
                        placeholder="Code, name or description"
                        defaultValue={filters.search}
                    />
                    <SelectField
                        label="Brands"
                        name="brands"
                        placeholder="All brands"
                        options={brands}
                        defaultValue={filters.brands}
                        isClearable
                        isMultiple
                    />
                </Filters>

                <Table>
                    <Table.ScrollContainer>
                        <Table.Content aria-label="Products">
                            <Table.Header>
                                <Table.Column isRowHeader>Code</Table.Column>
                                <Table.Column>Name</Table.Column>
                                <Table.Column>Brand</Table.Column>
                                <Table.Column>Wattage</Table.Column>
                                <Table.Column>UOM</Table.Column>
                                <Table.Column>CCT</Table.Column>
                                <Table.Column>IP</Table.Column>
                                <Table.Column className="text-end">
                                    Mfr. price
                                </Table.Column>
                            </Table.Header>
                            <Table.Body
                                renderEmptyState={() => (
                                    <p className="p-4 text-center text-sm text-muted">
                                        No products found.
                                    </p>
                                )}
                            >
                                {products.data.map((product) => (
                                    <Table.Row key={product.id}>
                                        <Table.Cell className="font-medium">
                                            {product.code}
                                        </Table.Cell>
                                        <Table.Cell>{product.name}</Table.Cell>
                                        <Table.Cell>
                                            {auth.permissions.includes(
                                                'brands.view',
                                            ) ? (
                                                <Link
                                                    href={show(
                                                        product.brand.id,
                                                    )}
                                                    className="hover:underline"
                                                >
                                                    {product.brand.name}
                                                </Link>
                                            ) : (
                                                product.brand.name
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {product.wattage}
                                        </Table.Cell>
                                        <Table.Cell>{product.uom}</Table.Cell>
                                        <Table.Cell>
                                            {product.color_temperature}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {product.ip_rating}
                                        </Table.Cell>
                                        <Table.Cell className="text-end">
                                            {product.currency}{' '}
                                            {formatMoney(
                                                product.manufacturer_price,
                                            )}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>

                <Pagination paginator={products} />
            </div>
        </>
    );
}

Products.layout = {
    breadcrumbs: [
        {
            title: 'Directory',
            href: directory(),
        },
    ],
};
