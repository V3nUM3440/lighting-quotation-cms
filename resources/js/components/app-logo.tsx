import { usePage } from '@inertiajs/react';
import { Lightbulb } from 'lucide-react';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <span className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Lightbulb className="size-5" />
            </span>
            <span className="truncate font-heading text-base font-bold">
                {name}
            </span>
        </span>
    );
}
