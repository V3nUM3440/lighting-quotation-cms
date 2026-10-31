import {
    Button,
    FieldError,
    InputGroup,
    Label,
    TextField,
} from '@heroui/react';
import type { TextFieldProps } from '@heroui/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

type Props = Omit<TextFieldProps, 'children' | 'type'> & {
    label: string;
    error?: string;
    placeholder?: string;
    passwordRules?: string;
};

export default function PasswordField({
    label,
    error,
    placeholder,
    passwordRules,
    ...props
}: Props) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <TextField
            fullWidth
            validationBehavior="aria"
            isInvalid={!!error}
            {...props}
        >
            <Label>{label}</Label>
            <InputGroup fullWidth>
                <InputGroup.Input
                    type={isVisible ? 'text' : 'password'}
                    placeholder={placeholder}
                    passwordrules={passwordRules}
                />
                <InputGroup.Suffix>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        aria-label={
                            isVisible ? 'Hide password' : 'Show password'
                        }
                        onPress={() => setIsVisible(!isVisible)}
                    >
                        {isVisible ? (
                            <EyeOff className="size-4" />
                        ) : (
                            <Eye className="size-4" />
                        )}
                    </Button>
                </InputGroup.Suffix>
            </InputGroup>
            <FieldError>{error}</FieldError>
        </TextField>
    );
}
