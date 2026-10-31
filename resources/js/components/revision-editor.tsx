import { FieldError, Label, TextArea, TextField } from '@heroui/react';
import FormField from '@/components/form-field';
import RevisionItemsEditor from '@/components/revision-items-editor';
import RichTextEditor from '@/components/rich-text-editor';
import type { RevisionDefaults, RevisionDraft } from '@/types';

type Props = {
    draft: RevisionDraft;
    onChange: (draft: RevisionDraft) => void;
    name?: string;
    errorPrefix?: string;
    errors: Partial<Record<string, string>>;
    defaults: RevisionDefaults;
};

export default function RevisionEditor({
    draft,
    onChange,
    name,
    errorPrefix = '',
    errors,
    defaults,
}: Props) {
    const fieldName = (field: string) => (name ? `${name}[${field}]` : field);

    return (
        <div className="space-y-6">
            <RevisionItemsEditor
                items={draft.items}
                onChange={(items) => onChange({ ...draft, items })}
                name={fieldName('items')}
                errorKey={`${errorPrefix}items`}
                errors={errors}
                defaults={defaults}
            />

            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                <FormField
                    label="Validity (days)"
                    name={fieldName('validity_days')}
                    inputMode="numeric"
                    value={draft.validity_days}
                    onChange={(validity_days) =>
                        onChange({ ...draft, validity_days })
                    }
                    error={errors[`${errorPrefix}validity_days`]}
                />
                <TextField
                    fullWidth
                    name={fieldName('payment_terms')}
                    value={draft.payment_terms}
                    onChange={(payment_terms) =>
                        onChange({ ...draft, payment_terms })
                    }
                    validationBehavior="aria"
                    isInvalid={!!errors[`${errorPrefix}payment_terms`]}
                >
                    <Label>Payment terms</Label>
                    <TextArea rows={2} />
                    <FieldError>
                        {errors[`${errorPrefix}payment_terms`]}
                    </FieldError>
                </TextField>
            </div>

            <RichTextEditor
                label="Terms and conditions"
                name={fieldName('terms')}
                value={draft.terms}
                onChange={(terms) => onChange({ ...draft, terms })}
                error={errors[`${errorPrefix}terms`]}
            />
        </div>
    );
}
