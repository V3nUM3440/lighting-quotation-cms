import { Toast, toast } from '@heroui/react';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import type { FlashToast } from '@/types';

export default function Toaster() {
    useEffect(() => {
        return router.on('flash', (event) => {
            const data = event.detail.flash?.toast as FlashToast | undefined;

            if (data) {
                toast[data.type](data.message);
            }
        });
    }, []);

    return <Toast.Provider />;
}
