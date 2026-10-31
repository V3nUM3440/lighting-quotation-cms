import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'danger';
    message: string;
};

export type AuthLayoutProps = {
    children?: ReactNode;
    title?: string;
    description?: string;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type Filters = {
    search?: string;
    [key: string]: string | string[] | undefined;
};
