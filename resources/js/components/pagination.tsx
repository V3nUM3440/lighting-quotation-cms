import { Pagination as HeroPagination } from '@heroui/react';
import { router } from '@inertiajs/react';
import type { Paginated } from '@/types';

export default function Pagination<T>({
    paginator,
    onNavigate,
}: {
    paginator: Paginated<T>;
    onNavigate?: (url: string) => void;
}) {
    const visit = (url: string | null) => {
        if (url && onNavigate) {
            onNavigate(url);
        } else if (url) {
            router.get(url, {}, { preserveScroll: true, preserveState: true });
        }
    };

    return (
        <HeroPagination>
            <HeroPagination.Summary>
                {paginator.total > 0
                    ? `Showing ${paginator.from}-${paginator.to} of ${paginator.total}`
                    : 'No results'}
            </HeroPagination.Summary>
            <HeroPagination.Content>
                <HeroPagination.Item>
                    <HeroPagination.Previous
                        isDisabled={!paginator.prev_page_url}
                        onPress={() => visit(paginator.prev_page_url)}
                    >
                        <HeroPagination.PreviousIcon />
                        <span>Previous</span>
                    </HeroPagination.Previous>
                </HeroPagination.Item>
                <HeroPagination.Item>
                    <HeroPagination.Link isActive>
                        {paginator.current_page}
                    </HeroPagination.Link>
                </HeroPagination.Item>
                <HeroPagination.Item>
                    <HeroPagination.Next
                        isDisabled={!paginator.next_page_url}
                        onPress={() => visit(paginator.next_page_url)}
                    >
                        <span>Next</span>
                        <HeroPagination.NextIcon />
                    </HeroPagination.Next>
                </HeroPagination.Item>
            </HeroPagination.Content>
        </HeroPagination>
    );
}
