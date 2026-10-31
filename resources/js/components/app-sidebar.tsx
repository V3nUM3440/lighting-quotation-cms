import { buttonVariants, cn } from '@heroui/react';
import { Link, usePage } from '@inertiajs/react';
import {
    FolderKanban,
    History,
    LayoutGrid,
    Lightbulb,
    ShieldCheck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import NavUser from '@/components/nav-user';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard, directory } from '@/routes';
import { index as activityLogs } from '@/routes/activity-logs';
import { index as projects } from '@/routes/projects';
import { index as roles } from '@/routes/roles';
import { index as users } from '@/routes/users';
import type { NavItem } from '@/types';

export default function AppSidebar() {
    const { auth } = usePage().props;
    const { isCurrentOrParentUrl } = useCurrentUrl();

    const navItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (auth.permissions.includes('projects.view')) {
        navItems.push({
            title: 'Projects',
            href: projects(),
            icon: FolderKanban,
        });
    }

    if (
        auth.permissions.includes('brands.view') ||
        auth.permissions.includes('products.view')
    ) {
        navItems.push({
            title: 'Directory',
            href: directory(),
            icon: Lightbulb,
        });
    }

    if (auth.permissions.includes('users.view')) {
        navItems.push({
            title: 'Users',
            href: users(),
            icon: Users,
        });
    }

    if (auth.permissions.includes('roles.view')) {
        navItems.push({
            title: 'Roles',
            href: roles(),
            icon: ShieldCheck,
        });
    }

    if (auth.permissions.includes('activity-logs.view')) {
        navItems.push({
            title: 'Activity log',
            href: activityLogs(),
            icon: History,
        });
    }

    return (
        <div className="flex h-full flex-col gap-4 p-3">
            <Link href={dashboard()} className="flex items-center p-2">
                <AppLogo />
            </Link>

            <nav className="flex flex-1 flex-col gap-1">
                {navItems.map((item) => (
                    <Link
                        key={item.title}
                        href={item.href}
                        className={cn(
                            buttonVariants({
                                variant: isCurrentOrParentUrl(item.href)
                                    ? 'secondary'
                                    : 'ghost',
                            }),
                            'w-full justify-start',
                        )}
                    >
                        {item.icon && <item.icon className="size-4" />}
                        {item.title}
                    </Link>
                ))}
            </nav>

            <NavUser />
        </div>
    );
}
