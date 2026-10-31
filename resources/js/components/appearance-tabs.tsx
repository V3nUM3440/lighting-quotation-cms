import { ToggleButton, ToggleButtonGroup } from '@heroui/react';
import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';

const options: { value: Appearance; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
];

export default function AppearanceTabs() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <ToggleButtonGroup
            aria-label="Appearance"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[appearance]}
            onSelectionChange={(keys) =>
                updateAppearance([...keys][0] as Appearance)
            }
        >
            {options.map(({ value, icon: Icon, label }, index) => (
                <ToggleButton key={value} id={value}>
                    {index > 0 && <ToggleButtonGroup.Separator />}
                    <Icon className="size-4" />
                    {label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
