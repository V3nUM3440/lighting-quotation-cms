import { Button } from '@heroui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import FormField from '@/components/form-field';
import Heading from '@/components/heading';
import { edit } from '@/routes/profile';

export default function Profile() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your name and email address"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                label="Name"
                                name="name"
                                defaultValue={auth.user.name}
                                isRequired
                                autoComplete="name"
                                placeholder="Full name"
                                error={errors.name}
                            />

                            <FormField
                                label="Email address"
                                name="email"
                                type="email"
                                defaultValue={auth.user.email}
                                isRequired
                                autoComplete="username"
                                placeholder="Email address"
                                error={errors.email}
                            />

                            <FormField
                                label="Mobile"
                                name="phone"
                                type="tel"
                                defaultValue={auth.user.phone ?? ''}
                                autoComplete="tel"
                                error={errors.phone}
                            />

                            <Button
                                type="submit"
                                isPending={processing}
                                data-test="update-profile-button"
                            >
                                Save
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
