import { Button } from '@heroui/react';
import { Form, Head } from '@inertiajs/react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import PasswordField from '@/components/password-field';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
};

export default function Security({ passwordRules }: Props) {
    return (
        <>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Update password"
                    description="Ensure your account is using a long, random password to stay secure"
                />

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <PasswordField
                                label="Current password"
                                name="current_password"
                                autoComplete="current-password"
                                placeholder="Current password"
                                error={errors.current_password}
                            />

                            <PasswordField
                                label="New password"
                                name="password"
                                autoComplete="new-password"
                                placeholder="New password"
                                passwordRules={passwordRules}
                                error={errors.password}
                            />

                            <PasswordField
                                label="Confirm password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="Confirm password"
                                passwordRules={passwordRules}
                                error={errors.password_confirmation}
                            />

                            <Button
                                type="submit"
                                isPending={processing}
                                data-test="update-password-button"
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

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};
