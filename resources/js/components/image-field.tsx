import { Label } from '@heroui/react';

type Props = {
    label: string;
    name: string;
    currentUrl?: string | null;
    error?: string;
};

export default function ImageField({ label, name, currentUrl, error }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={name}>{label}</Label>
            <div className="flex items-center gap-3">
                {currentUrl && (
                    <img
                        src={currentUrl}
                        alt=""
                        className="size-14 rounded-lg border border-separator object-contain"
                    />
                )}
                <input
                    id={name}
                    type="file"
                    name={name}
                    accept="image/*"
                    className="block w-full rounded-xl border border-field-border bg-field p-1 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-default file:px-3 file:py-2 file:text-sm file:font-medium"
                />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
        </div>
    );
}
