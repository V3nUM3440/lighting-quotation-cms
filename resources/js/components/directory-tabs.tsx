import { Tabs } from '@heroui/react';
import { usePage } from '@inertiajs/react';
import { index as brands } from '@/routes/brands';
import { index as products } from '@/routes/products';

export default function DirectoryTabs({
    selected,
}: {
    selected: 'brands' | 'products';
}) {
    const { auth } = usePage().props;

    return (
        <Tabs selectedKey={selected}>
            <Tabs.ListContainer>
                <Tabs.List aria-label="Directory">
                    {auth.permissions.includes('brands.view') && (
                        <Tabs.Tab id="brands" href={brands.url()}>
                            Brands
                            <Tabs.Indicator />
                        </Tabs.Tab>
                    )}
                    {auth.permissions.includes('products.view') && (
                        <Tabs.Tab id="products" href={products.url()}>
                            Products
                            <Tabs.Indicator />
                        </Tabs.Tab>
                    )}
                </Tabs.List>
            </Tabs.ListContainer>
        </Tabs>
    );
}
