import {
    Button,
    FieldError,
    Label,
    Modal,
    TextArea,
    TextField,
} from '@heroui/react';
import { Form } from '@inertiajs/react';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import FormField from '@/components/form-field';
import ImageField from '@/components/image-field';
import SelectField from '@/components/select-field';
import type { Brand, Product } from '@/types';

const specs = [
    { name: 'wattage', label: 'Wattage', placeholder: '12W' },
    { name: 'lumens', label: 'Lumens', placeholder: '1100' },
    {
        name: 'color_temperature',
        label: 'Color temperature',
        placeholder: '3000K',
    },
    { name: 'cri', label: 'CRI', placeholder: '90' },
    { name: 'beam_angle', label: 'Beam angle', placeholder: '36°' },
    { name: 'ip_rating', label: 'IP rating', placeholder: 'IP65' },
    { name: 'finish', label: 'Finish', placeholder: 'White' },
] as const;

type Props = {
    brand: Brand;
    currencies: string[];
    product: Product | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
};

export default function ProductModal({
    brand,
    currencies,
    product,
    isOpen,
    onOpenChange,
}: Props) {
    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container size="lg">
                <Modal.Dialog>
                    <Form
                        key={product?.id ?? 'new'}
                        {...(product
                            ? ProductController.update.form(product.id)
                            : ProductController.store.form(brand.id))}
                        options={{ preserveScroll: true }}
                        onSuccess={() => onOpenChange(false)}
                        className="contents"
                    >
                        {({ processing, errors }) => (
                            <>
                                <Modal.Header>
                                    <Modal.Heading>
                                        {product
                                            ? 'Edit product'
                                            : 'Add product'}
                                    </Modal.Heading>
                                </Modal.Header>
                                <Modal.Body className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        label="Code"
                                        name="code"
                                        isRequired
                                        autoFocus
                                        defaultValue={product?.code}
                                        error={errors.code}
                                    />
                                    <FormField
                                        label="Name"
                                        name="name"
                                        isRequired
                                        defaultValue={product?.name}
                                        error={errors.name}
                                    />
                                    <TextField
                                        fullWidth
                                        name="description"
                                        defaultValue={
                                            product?.description ?? ''
                                        }
                                        validationBehavior="aria"
                                        isInvalid={!!errors.description}
                                        className="sm:col-span-2"
                                    >
                                        <Label>Description</Label>
                                        <TextArea rows={5} />
                                        <FieldError>
                                            {errors.description}
                                        </FieldError>
                                    </TextField>
                                    <FormField
                                        label="UOM"
                                        name="uom"
                                        isRequired
                                        placeholder="NOS."
                                        defaultValue={product?.uom ?? 'NOS.'}
                                        error={errors.uom}
                                    />
                                    <SelectField
                                        label="Currency"
                                        name="currency"
                                        options={currencies.map((currency) => ({
                                            id: currency,
                                            name: currency,
                                        }))}
                                        defaultValue={product?.currency}
                                        error={errors.currency}
                                    />
                                    <FormField
                                        label="Manufacturer price"
                                        name="manufacturer_price"
                                        isRequired
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        defaultValue={
                                            product?.manufacturer_price
                                        }
                                        error={errors.manufacturer_price}
                                    />
                                    <ImageField
                                        label="Image"
                                        name="image"
                                        currentUrl={product?.image_url}
                                        error={errors.image}
                                    />
                                    {specs.map((spec) => (
                                        <FormField
                                            key={spec.name}
                                            label={spec.label}
                                            name={spec.name}
                                            placeholder={spec.placeholder}
                                            defaultValue={
                                                product?.[spec.name] ?? ''
                                            }
                                            error={errors[spec.name]}
                                        />
                                    ))}
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button slot="close" variant="tertiary">
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isPending={processing}
                                    >
                                        {product ? 'Save' : 'Add product'}
                                    </Button>
                                </Modal.Footer>
                            </>
                        )}
                    </Form>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
