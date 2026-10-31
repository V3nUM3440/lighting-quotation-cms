import { Breadcrumbs as HeroBreadcrumbs } from '@heroui/react';
import { toUrl } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

export default function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItem[];
}) {
    if (breadcrumbs.length === 0) {
        return null;
    }

    return (
        <HeroBreadcrumbs>
            {breadcrumbs.map((item, index) => (
                <HeroBreadcrumbs.Item
                    key={index}
                    href={
                        index < breadcrumbs.length - 1
                            ? toUrl(item.href)
                            : undefined
                    }
                >
                    {item.title}
                </HeroBreadcrumbs.Item>
            ))}
        </HeroBreadcrumbs>
    );
}
