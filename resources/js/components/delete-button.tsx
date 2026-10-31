import { AlertDialog, Button } from '@heroui/react';
import { Form } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import type { RouteFormDefinition } from '@/wayfinder';

type Props = {
    form: RouteFormDefinition<'post'>;
    title: string;
    description: string;
};

export default function DeleteButton({ form, title, description }: Props) {
    return (
        <AlertDialog>
            <Button isIconOnly size="sm" variant="ghost" aria-label="Delete">
                <Trash2 className="size-4 text-danger" />
            </Button>
            <AlertDialog.Backdrop>
                <AlertDialog.Container>
                    <AlertDialog.Dialog>
                        <Form
                            {...form}
                            options={{ preserveScroll: true }}
                            className="contents"
                        >
                            {({ processing }) => (
                                <>
                                    <AlertDialog.Header>
                                        <AlertDialog.Icon status="danger" />
                                        <AlertDialog.Heading>
                                            {title}
                                        </AlertDialog.Heading>
                                    </AlertDialog.Header>
                                    <AlertDialog.Body>
                                        {description}
                                    </AlertDialog.Body>
                                    <AlertDialog.Footer>
                                        <Button slot="close" variant="tertiary">
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="danger"
                                            isPending={processing}
                                        >
                                            Delete
                                        </Button>
                                    </AlertDialog.Footer>
                                </>
                            )}
                        </Form>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}
