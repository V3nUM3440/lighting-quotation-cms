import { Button, FieldError, Label, TextArea, TextField } from '@heroui/react';
import { Form, Head } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CompanyController from '@/actions/App/Http/Controllers/Settings/CompanyController';
import FormField from '@/components/form-field';
import Heading from '@/components/heading';
import ImageField from '@/components/image-field';
import RichTextEditor from '@/components/rich-text-editor';
import { edit } from '@/routes/company';

type Settings = {
    company: {
        name: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        logo_url: string | null;
        stamp_url: string | null;
        signature_url: string | null;
    };
    currency: string;
    vat_rate: number;
    margin_floor: number;
    exchange_rates: { code: string; rate: number }[];
    defaults: {
        freight: number;
        customs: number;
        validity_days: number;
        payment_terms: string | null;
        terms: string | null;
    };
};

export default function Company({ settings }: { settings: Settings }) {
    const { company, defaults } = settings;
    const [rates, setRates] = useState(
        settings.exchange_rates.map((rate) => ({
            key: crypto.randomUUID(),
            code: rate.code,
            rate: String(rate.rate),
        })),
    );
    const [terms, setTerms] = useState(defaults.terms ?? '');

    const updateRate = (key: string, field: 'code' | 'rate', value: string) =>
        setRates(
            rates.map((rate) =>
                rate.key === key ? { ...rate, [field]: value } : rate,
            ),
        );

    return (
        <>
            <Head title="Company settings" />

            <h1 className="sr-only">Company settings</h1>

            <Form
                {...CompanyController.update.form()}
                options={{ preserveScroll: true }}
                className="space-y-12"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-6">
                            <Heading
                                variant="small"
                                title="Company details"
                                description="Shown in the header of every quotation"
                            />
                            <FormField
                                label="Company name"
                                name="company[name]"
                                isRequired
                                defaultValue={company.name}
                                error={errors['company.name']}
                            />
                            <FormField
                                label="Address"
                                name="company[address]"
                                defaultValue={company.address ?? ''}
                                error={errors['company.address']}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Phone"
                                    name="company[phone]"
                                    type="tel"
                                    defaultValue={company.phone ?? ''}
                                    error={errors['company.phone']}
                                />
                                <FormField
                                    label="Email"
                                    name="company[email]"
                                    type="email"
                                    defaultValue={company.email ?? ''}
                                    error={errors['company.email']}
                                />
                            </div>
                            <FormField
                                label="Website"
                                name="company[website]"
                                defaultValue={company.website ?? ''}
                                error={errors['company.website']}
                            />
                            <ImageField
                                label="Logo"
                                name="logo"
                                currentUrl={company.logo_url}
                                error={errors.logo}
                            />
                            <ImageField
                                label="Stamp"
                                name="stamp"
                                currentUrl={company.stamp_url}
                                error={errors.stamp}
                            />
                            <ImageField
                                label="Signature"
                                name="signature"
                                currentUrl={company.signature_url}
                                error={errors.signature}
                            />
                        </div>

                        <div className="space-y-6">
                            <Heading
                                variant="small"
                                title="Pricing"
                                description="Quotations are priced in the company currency. New revisions use the current VAT rate and margin floor; revisions below the floor need approval."
                            />
                            <div className="grid gap-4 sm:grid-cols-3">
                                <FormField
                                    label="Company currency"
                                    name="currency"
                                    isRequired
                                    defaultValue={settings.currency}
                                    error={errors.currency}
                                />
                                <FormField
                                    label="VAT rate %"
                                    name="vat_rate"
                                    isRequired
                                    inputMode="decimal"
                                    defaultValue={String(settings.vat_rate)}
                                    error={errors.vat_rate}
                                />
                                <FormField
                                    label="Margin floor %"
                                    name="margin_floor"
                                    isRequired
                                    inputMode="decimal"
                                    defaultValue={String(settings.margin_floor)}
                                    error={errors.margin_floor}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Heading
                                variant="small"
                                title="Exchange rates"
                                description="The value of 1 unit of each currency in the company currency. Products can only use these currencies."
                            />
                            {rates.map((rate, i) => (
                                <div
                                    key={rate.key}
                                    className="grid grid-cols-[1fr_1fr_auto] items-start gap-3"
                                >
                                    <FormField
                                        label="Currency"
                                        name={`exchange_rates[${i}][code]`}
                                        value={rate.code}
                                        onChange={(value) =>
                                            updateRate(
                                                rate.key,
                                                'code',
                                                value.toUpperCase(),
                                            )
                                        }
                                        error={
                                            errors[`exchange_rates.${i}.code`]
                                        }
                                    />
                                    <FormField
                                        label="Rate"
                                        name={`exchange_rates[${i}][rate]`}
                                        inputMode="decimal"
                                        value={rate.rate}
                                        onChange={(value) =>
                                            updateRate(rate.key, 'rate', value)
                                        }
                                        error={
                                            errors[`exchange_rates.${i}.rate`]
                                        }
                                    />
                                    <Button
                                        isIconOnly
                                        variant="ghost"
                                        aria-label="Remove currency"
                                        className="mt-6"
                                        isDisabled={rates.length === 1}
                                        onPress={() =>
                                            setRates(
                                                rates.filter(
                                                    (row) =>
                                                        row.key !== rate.key,
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="size-4 text-danger" />
                                    </Button>
                                </div>
                            ))}
                            {errors.exchange_rates && (
                                <p className="text-sm text-danger">
                                    {errors.exchange_rates}
                                </p>
                            )}
                            <Button
                                size="sm"
                                variant="secondary"
                                onPress={() =>
                                    setRates([
                                        ...rates,
                                        {
                                            key: crypto.randomUUID(),
                                            code: '',
                                            rate: '',
                                        },
                                    ])
                                }
                            >
                                <Plus className="size-4" />
                                Add currency
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <Heading
                                variant="small"
                                title="Revision defaults"
                                description="The values new revisions start with. They can be changed per revision."
                            />
                            <div className="grid gap-4 sm:grid-cols-3">
                                <FormField
                                    label="Freight % (imported)"
                                    name="defaults[freight]"
                                    inputMode="decimal"
                                    defaultValue={String(defaults.freight)}
                                    error={errors['defaults.freight']}
                                />
                                <FormField
                                    label="Customs % (imported)"
                                    name="defaults[customs]"
                                    inputMode="decimal"
                                    defaultValue={String(defaults.customs)}
                                    error={errors['defaults.customs']}
                                />
                                <FormField
                                    label="Validity (days)"
                                    name="defaults[validity_days]"
                                    inputMode="numeric"
                                    defaultValue={String(
                                        defaults.validity_days,
                                    )}
                                    error={errors['defaults.validity_days']}
                                />
                            </div>
                            <TextField
                                fullWidth
                                name="defaults[payment_terms]"
                                defaultValue={defaults.payment_terms ?? ''}
                                validationBehavior="aria"
                                isInvalid={!!errors['defaults.payment_terms']}
                            >
                                <Label>Payment terms</Label>
                                <TextArea rows={2} />
                                <FieldError>
                                    {errors['defaults.payment_terms']}
                                </FieldError>
                            </TextField>
                            <RichTextEditor
                                label="Terms and conditions"
                                name="defaults[terms]"
                                value={terms}
                                onChange={setTerms}
                                error={errors['defaults.terms']}
                            />
                        </div>

                        <Button type="submit" isPending={processing}>
                            Save
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

Company.layout = {
    breadcrumbs: [
        {
            title: 'Company settings',
            href: edit(),
        },
    ],
};
