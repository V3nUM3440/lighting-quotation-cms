import { buttonVariants, cn, Separator } from '@heroui/react';
import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editCompany } from '@/routes/company';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const navItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
    },
    {
        title: 'Security',
        href: editSecurity(),
    },
    {
        title: 'Appearance',
        href: editAppearance(),
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props;
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const items = auth.permissions.includes('company-settings.update')
        ? [...navItems, { title: 'Company', href: editCompany() }]
        : navItems;

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:gap-12">
                <nav
                    className="flex w-full max-w-xl flex-col gap-1 lg:w-48"
                    aria-label="Settings"
                >
                    {items.map((item) => (
                        <Link
                            key={toUrl(item.href)}
                            href={item.href}
                            className={cn(
                                buttonVariants({
                                    size: 'sm',
                                    variant: isCurrentOrParentUrl(item.href)
                                        ? 'secondary'
                                        : 'ghost',
                                }),
                                'w-full justify-start',
                            )}
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <Separator className="my-6 lg:hidden" />

                <section className="max-w-xl flex-1 space-y-12">
                    {children}
                </section>
            </div>
        </div>
    );
}
