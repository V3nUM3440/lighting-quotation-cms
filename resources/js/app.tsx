import { RouterProvider } from '@heroui/react';
import { createInertiaApp, router } from '@inertiajs/react';
import Toaster from '@/components/toaster';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <RouterProvider navigate={(href) => router.visit(href)}>
                {app}
                <Toaster />
            </RouterProvider>
        );
    },
    progress: {
        color: '#FCB040',
    },
});

router.on('navigate', (event) => {
    if (event.detail.type === 'history') {
        router.reload();
    }
});

initializeTheme();
