import { Button, buttonVariants } from '@heroui/react';
import { Form, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

type Props = {
    action: string;
    children: ReactNode;
};

export default function Filters({ action, children }: Props) {
    return (
        <Form
            action={action}
            method="get"
            options={{ preserveScroll: true, preserveState: true }}
            className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
            {children}
            <div className="flex gap-2">
                <Button type="submit" variant="secondary">
                    Filter
                </Button>
                <Link
                    href={action}
                    className={buttonVariants({ variant: 'ghost' })}
                >
                    Reset
                </Link>
            </div>
        </Form>
    );
}
