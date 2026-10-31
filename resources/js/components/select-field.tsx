import { FieldError, Label, ListBox, Select } from '@heroui/react';

type Option = {
    id: string | number;
    name: string;
};

type Value = string | number | null | undefined;

type Props = {
    label: string;
    name: string;
    options: Option[];
    defaultValue?: Value | Value[];
    placeholder?: string;
    error?: string;
    isClearable?: boolean;
    isMultiple?: boolean;
    value?: string;
    onChange?: (value: string) => void;
};

export default function SelectField({
    label,
    name,
    options,
    defaultValue,
    placeholder,
    error,
    isClearable = false,
    isMultiple = false,
    value,
    onChange,
}: Props) {
    const values = [defaultValue ?? []]
        .flat()
        .filter(
            (value) => value !== null && value !== undefined && value !== '',
        )
        .map(String);

    return (
        <Select
            fullWidth
            name={isMultiple ? `${name}[]` : name}
            placeholder={placeholder}
            selectionMode={isMultiple ? 'multiple' : 'single'}
            defaultValue={isMultiple ? values : (values[0] ?? null)}
            value={value}
            onChange={(key) => onChange?.(String(key))}
            isInvalid={!!error}
            validationBehavior="aria"
        >
            <Label>{label}</Label>
            <Select.Trigger>
                <Select.Value />
                {isClearable && <Select.ClearButton />}
                <Select.Indicator />
            </Select.Trigger>
            <FieldError>{error}</FieldError>
            <Select.Popover>
                <ListBox selectionMode={isMultiple ? 'multiple' : 'single'}>
                    {options.map((option) => (
                        <ListBox.Item
                            key={option.id}
                            id={String(option.id)}
                            textValue={option.name}
                        >
                            {option.name}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );
}
