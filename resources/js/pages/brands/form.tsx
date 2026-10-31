import { Button, buttonVariants, Card, Checkbox } from '@heroui/react';
import { Form, Head, Link } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import BrandController from '@/actions/App/Http/Controllers/BrandController';
import FormField from '@/components/form-field';
import Heading from '@/components/heading';
import ImageField from '@/components/image-field';
import TagInput from '@/components/tag-input';
import { directory } from '@/routes';
import { index, show } from '@/routes/brands';
import type { Brand, BrandContact } from '@/types';

type ContactRow = Partial<BrandContact> & { key: string };

export default function BrandForm({ brand }: { brand?: Brand }) {
    const [contacts, setContacts] = useState<ContactRow[]>(
        brand?.contacts?.map((contact) => ({
            ...contact,
            key: String(contact.id),
        })) ?? [],
    );

    return (
        <>
            <Head title={brand ? `Edit ${brand.name}` : 'Add brand'} />

            <div className="max-w-3xl space-y-6 px-4 py-6">
                <Heading
                    title={brand ? `Edit ${brand.name}` : 'Add brand'}
                    description="Brand details and the people to contact there"
                />

                <Form
                    {...(brand
                        ? BrandController.update.form(brand.id)
                        : BrandController.store.form())}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                label="Name"
                                name="name"
                                isRequired
                                autoFocus
                                defaultValue={brand?.name}
                                placeholder="Brand name"
                                error={errors.name}
                            />

                            <TagInput
                                name="tags"
                                label="Tags"
                                defaultValue={brand?.tags ?? []}
                                error={errors.tags}
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Website"
                                    name="website"
                                    placeholder="www.example.com"
                                    defaultValue={brand?.website ?? ''}
                                    error={errors.website}
                                />
                                <ImageField
                                    label="Logo"
                                    name="logo"
                                    currentUrl={brand?.logo_url}
                                    error={errors.logo}
                                />
                            </div>

                            <Checkbox
                                name="is_partner"
                                value="1"
                                defaultSelected={brand?.is_partner}
                            >
                                <Checkbox.Content>
                                    <Checkbox.Control>
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    Show as an excellence partner on quotations
                                </Checkbox.Content>
                            </Checkbox>

                            <Card>
                                <Card.Header className="flex-row items-center justify-between">
                                    <Card.Title>Contacts</Card.Title>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onPress={() =>
                                            setContacts([
                                                ...contacts,
                                                { key: crypto.randomUUID() },
                                            ])
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Add contact
                                    </Button>
                                </Card.Header>
                                <Card.Content className="space-y-4">
                                    {contacts.length === 0 && (
                                        <p className="text-sm text-muted">
                                            No contacts added.
                                        </p>
                                    )}

                                    {contacts.map((contact, i) => (
                                        <div
                                            key={contact.key}
                                            className="grid items-start gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
                                        >
                                            {contact.id && (
                                                <input
                                                    type="hidden"
                                                    name={`contacts[${i}][id]`}
                                                    value={contact.id}
                                                />
                                            )}
                                            <FormField
                                                label="Name"
                                                name={`contacts[${i}][name]`}
                                                isRequired
                                                defaultValue={contact.name}
                                                error={
                                                    errors[`contacts.${i}.name`]
                                                }
                                            />
                                            <FormField
                                                label="Phone"
                                                name={`contacts[${i}][phone]`}
                                                type="tel"
                                                defaultValue={
                                                    contact.phone ?? undefined
                                                }
                                                error={
                                                    errors[
                                                        `contacts.${i}.phone`
                                                    ]
                                                }
                                            />
                                            <FormField
                                                label="Email"
                                                name={`contacts[${i}][email]`}
                                                type="email"
                                                defaultValue={
                                                    contact.email ?? undefined
                                                }
                                                error={
                                                    errors[
                                                        `contacts.${i}.email`
                                                    ]
                                                }
                                            />
                                            <Button
                                                isIconOnly
                                                variant="ghost"
                                                aria-label="Remove contact"
                                                className="sm:mt-6"
                                                onPress={() =>
                                                    setContacts(
                                                        contacts.filter(
                                                            (row) =>
                                                                row.key !==
                                                                contact.key,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Trash2 className="size-4 text-danger" />
                                            </Button>
                                        </div>
                                    ))}
                                </Card.Content>
                            </Card>

                            <div className="flex gap-3">
                                <Button type="submit" isPending={processing}>
                                    {brand ? 'Save' : 'Add brand'}
                                </Button>
                                <Link
                                    href={brand ? show(brand.id) : index()}
                                    className={buttonVariants({
                                        variant: 'tertiary',
                                    })}
                                >
                                    Cancel
                                </Link>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

BrandForm.layout = {
    breadcrumbs: [
        {
            title: 'Directory',
            href: directory(),
        },
    ],
};
