import { FieldError, Input, Label, TextField } from '@heroui/react';
import type { TextFieldProps } from '@heroui/react';

type Props = Omit<TextFieldProps, 'children'> & {
    label: string;
    error?: string;
    placeholder?: string;
};

export default function FormField({
    label,
    error,
    placeholder,
    ...props
}: Props) {
    return (
        <TextField
            fullWidth
            validationBehavior="aria"
            isInvalid={!!error}
            {...props}
        >
            <Label>{label}</Label>
            <Input placeholder={placeholder} />
            <FieldError>{error}</FieldError>
        </TextField>
    );
}
