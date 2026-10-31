import { Button, Drawer } from '@heroui/react';
import { Menu } from 'lucide-react';
import AppSidebar from '@/components/app-sidebar';
import Breadcrumbs from '@/components/breadcrumbs';
import type { AppLayoutProps } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: AppLayoutProps) {
    return (
        <div className="flex min-h-svh">
            <aside className="hidden w-64 shrink-0 border-r border-separator md:block">
                <div className="sticky top-0 h-svh">
                    <AppSidebar />
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-separator px-4">
                    <Drawer>
                        <Button
                            isIconOnly
                            variant="ghost"
                            aria-label="Open navigation"
                            className="md:hidden"
                        >
                            <Menu className="size-5" />
                        </Button>
                        <Drawer.Backdrop>
                            <Drawer.Content placement="left">
                                <Drawer.Dialog className="p-0">
                                    <AppSidebar />
                                </Drawer.Dialog>
                            </Drawer.Content>
                        </Drawer.Backdrop>
                    </Drawer>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </header>

                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
