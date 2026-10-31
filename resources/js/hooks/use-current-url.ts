import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';

export function useCurrentUrl() {
    const currentPath = usePage().url.split('?')[0];

    const isCurrentOrParentUrl = (
        href: NonNullable<InertiaLinkProps['href']>,
    ): boolean => currentPath.startsWith(toUrl(href));

    return { isCurrentOrParentUrl };
}
