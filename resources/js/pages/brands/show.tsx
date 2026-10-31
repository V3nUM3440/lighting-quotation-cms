import {
    Button,
    buttonVariants,
    Card,
    Chip,
    Modal,
    Table,
} from '@heroui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Download, Pencil, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import BrandController from '@/actions/App/Http/Controllers/BrandController';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import DeleteButton from '@/components/delete-button';
import Filters from '@/components/filters';
import FormField from '@/components/form-field';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import { formatMoney } from '@/lib/pricing';
import ProductModal from '@/components/product-modal';
import { directory } from '@/routes';
import { edit, show } from '@/routes/brands';
import type {
    Brand,
    Filters as FilterValues,
    Paginated,
    Product,
} from '@/types';

type Props = {
    brand: Brand;
    products: Paginated<Product>;
    currencies: string[];
    filters: FilterValues;
};

export default function ShowBrand({
    brand,
    products,
    currencies,
    filters,
}: Props) {
    const { auth } = usePage().props;
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);

    const can = (permission: string) => auth.permissions.includes(permission);

    const openProductModal = (product: Product | null) => {
        setEditing(product);
        setIsProductModalOpen(true);
    };

    return (
        <>
            <Head title={brand.name} />

            <div className="space-y-6 px-4 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            {brand.logo_url && (
                                <img
                                    src={brand.logo_url}
                                    alt=""
                                    className="size-12 rounded-lg border border-separator object-contain"
                                />
                            )}
                            <div>
                                <Heading title={brand.name} />
                                <p className="text-sm text-muted">
                                    {[
                                        brand.website,
                                        brand.is_partner &&
                                            'Excellence partner',
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {brand.tags?.map((tag) => (
                                <Chip key={tag} size="sm">
                                    {tag}
                                </Chip>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {can('brands.update') && (
                            <Link
                                href={edit(brand.id)}
                                className={buttonVariants({
                                    variant: 'secondary',
                                })}
                            >
                                <Pencil className="size-4" />
                                Edit brand
                            </Link>
                        )}
                        {can('brands.delete') && (
                            <DeleteButton
                                form={BrandController.destroy.form(brand.id)}
                                title={`Delete ${brand.name}?`}
                                description="The brand, its contacts and all of its products will be permanently deleted."
                            />
                        )}
                    </div>
                </div>

                <Card>
                    <Card.Header>
                        <Card.Title>Contacts</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        {brand.contacts?.length ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {brand.contacts.map((contact) => (
                                    <div key={contact.id} className="text-sm">
                                        <p className="font-medium">
                                            {contact.name}
                                        </p>
                                        {contact.phone && (
                                            <p className="text-muted">
                                                {contact.phone}
                                            </p>
                                        )}
                                        {contact.email && (
                                            <a
                                                href={`mailto:${contact.email}`}
                                                className="text-muted hover:underline"
                                            >
                                                {contact.email}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted">No contacts.</p>
                        )}
                    </Card.Content>
                </Card>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <Heading
                            variant="small"
                            title="Products"
                            description={`${products.total} products`}
                        />
                        <div className="flex flex-wrap gap-2">
                            {can('products.export') && (
                                <a
                                    href={ProductController.template.url(
                                        brand.id,
                                    )}
                                    className={buttonVariants({
                                        variant: 'secondary',
                                    })}
                                >
                                    <Download className="size-4" />
                                    Download template
                                </a>
                            )}
                            {can('products.import') && (
                                <Button
                                    variant="secondary"
                                    onPress={() => setIsImportModalOpen(true)}
                                >
                                    <Upload className="size-4" />
                                    Upload products
                                </Button>
                            )}
                            {can('products.create') && (
                                <Button onPress={() => openProductModal(null)}>
                                    <Plus className="size-4" />
                                    Add product
                                </Button>
                            )}
                        </div>
                    </div>

                    <Filters action={show.url(brand.id)}>
                        <FormField
                            label="Search"
                            name="search"
                            placeholder="Code, name or description"
                            defaultValue={filters.search}
                        />
                    </Filters>

                    <Table>
                        <Table.ScrollContainer>
                            <Table.Content aria-label="Products">
                                <Table.Header>
                                    <Table.Column isRowHeader>
                                        Code
                                    </Table.Column>
                                    <Table.Column>Name</Table.Column>
                                    <Table.Column>Wattage</Table.Column>
                                    <Table.Column>UOM</Table.Column>
                                    <Table.Column>CCT</Table.Column>
                                    <Table.Column>IP</Table.Column>
                                    <Table.Column className="text-end">
                                        Mfr. price
                                    </Table.Column>
                                    <Table.Column className="text-end">
                                        Actions
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
                                            <Table.Cell>
                                                {product.name}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {product.wattage}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {product.uom}
                                            </Table.Cell>
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
                                            <Table.Cell>
                                                <div className="flex justify-end gap-1">
                                                    {can('products.update') && (
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="ghost"
                                                            aria-label="Edit"
                                                            onPress={() =>
                                                                openProductModal(
                                                                    product,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                    )}
                                                    {can('products.delete') && (
                                                        <DeleteButton
                                                            form={ProductController.destroy.form(
                                                                product.id,
                                                            )}
                                                            title={`Delete ${product.code}?`}
                                                            description="This product will be permanently deleted."
                                                        />
                                                    )}
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Content>
                        </Table.ScrollContainer>
                    </Table>

                    <Pagination paginator={products} />
                </div>
            </div>

            <ProductModal
                brand={brand}
                currencies={currencies}
                product={editing}
                isOpen={isProductModalOpen}
                onOpenChange={setIsProductModalOpen}
            />

            <Modal.Backdrop
                isOpen={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
            >
                <Modal.Container>
                    <Modal.Dialog>
                        <Form
                            {...ProductController.import.form(brand.id)}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setIsImportModalOpen(false)}
                            className="contents"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Modal.Header>
                                        <Modal.Heading>
                                            Upload products
                                        </Modal.Heading>
                                    </Modal.Header>
                                    <Modal.Body className="space-y-4">
                                        <p className="text-sm text-muted">
                                            Upload the filled-in template. Rows
                                            with an existing code update that
                                            product, new codes create products.
                                        </p>
                                        <input
                                            type="file"
                                            name="file"
                                            accept=".xlsx"
                                            className="block w-full rounded-xl border border-field-border bg-field p-1 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-default file:px-3 file:py-2 file:text-sm file:font-medium"
                                        />
                                        {errors.file && (
                                            <p className="text-sm whitespace-pre-line text-danger">
                                                {errors.file}
                                            </p>
                                        )}
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button slot="close" variant="tertiary">
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            isPending={processing}
                                        >
                                            Upload
                                        </Button>
                                    </Modal.Footer>
                                </>
                            )}
                        </Form>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </>
    );
}

ShowBrand.layout = {
    breadcrumbs: [
        {
            title: 'Directory',
            href: directory(),
        },
    ],
};
