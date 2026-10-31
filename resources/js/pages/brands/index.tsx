import { buttonVariants, Chip, Table } from '@heroui/react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import DirectoryTabs from '@/components/directory-tabs';
import Filters from '@/components/filters';
import FormField from '@/components/form-field';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import SelectField from '@/components/select-field';
import { directory } from '@/routes';
import { create, index, show } from '@/routes/brands';
import type { Brand, Filters as FilterValues, Paginated } from '@/types';

type Props = {
    brands: Paginated<Brand>;
    tags: string[];
    filters: FilterValues;
};

export default function Brands({ brands, tags, filters }: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Directory" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Directory"
                        description="Brands and the products they supply"
                    />
                    {auth.permissions.includes('brands.create') && (
                        <Link href={create()} className={buttonVariants()}>
                            <Plus className="size-4" />
                            Add brand
                        </Link>
                    )}
                </div>

                <DirectoryTabs selected="brands" />

                <Filters action={index.url()}>
                    <FormField
                        label="Search"
                        name="search"
                        placeholder="Brand name"
                        defaultValue={filters.search}
                    />
                    <SelectField
                        label="Tags"
                        name="tags"
                        placeholder="All tags"
                        options={tags.map((tag) => ({ id: tag, name: tag }))}
                        defaultValue={filters.tags}
                        isClearable
                        isMultiple
                    />
                </Filters>

                <Table>
                    <Table.ScrollContainer>
                        <Table.Content aria-label="Brands">
                            <Table.Header>
                                <Table.Column isRowHeader>Brand</Table.Column>
                                <Table.Column>Tags</Table.Column>
                                <Table.Column>Products</Table.Column>
                                <Table.Column>Contacts</Table.Column>
                            </Table.Header>
                            <Table.Body
                                renderEmptyState={() => (
                                    <p className="p-4 text-center text-sm text-muted">
                                        No brands found.
                                    </p>
                                )}
                            >
                                {brands.data.map((brand) => (
                                    <Table.Row key={brand.id}>
                                        <Table.Cell>
                                            <Link
                                                href={show(brand.id)}
                                                className="font-medium hover:underline"
                                            >
                                                {brand.name}
                                            </Link>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex flex-wrap gap-1">
                                                {brand.tags?.map((tag) => (
                                                    <Chip key={tag} size="sm">
                                                        {tag}
                                                    </Chip>
                                                ))}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {brand.products_count}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {brand.contacts_count}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>

                <Pagination paginator={brands} />
            </div>
        </>
    );
}

Brands.layout = {
    breadcrumbs: [
        {
            title: 'Directory',
            href: directory(),
        },
    ],
};
