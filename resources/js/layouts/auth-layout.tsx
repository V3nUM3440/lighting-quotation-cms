import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-8">
                <div className="flex flex-col items-center gap-4">
                    <Link href={home()}>
                        <AppLogo />
                    </Link>

                    <div className="space-y-2 text-center">
                        <h1 className="font-heading text-xl font-bold">
                            {title}
                        </h1>
                        <p className="text-sm text-muted">{description}</p>
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
