import { Button, Checkbox, Popover } from '@heroui/react';
import { Form, Head } from '@inertiajs/react';
import FormField from '@/components/form-field';
import PasswordField from '@/components/password-field';
import { store } from '@/routes/login';

export default function Login({ status }: { status?: string }) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <div className="text-center text-sm font-medium text-success">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <FormField
                            label="Email address"
                            name="email"
                            type="email"
                            isRequired
                            autoFocus
                            autoComplete="email"
                            placeholder="email@example.com"
                            error={errors.email}
                        />

                        <PasswordField
                            label="Password"
                            name="password"
                            isRequired
                            autoComplete="current-password"
                            placeholder="Password"
                            error={errors.password}
                        />

                        <div className="flex items-center justify-between">
                            <Checkbox name="remember">
                                <Checkbox.Content>
                                    <Checkbox.Control>
                                        <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    Remember me
                                </Checkbox.Content>
                            </Checkbox>

                            <Popover>
                                <Button size="sm" variant="ghost">
                                    Forgot your password?
                                </Button>
                                <Popover.Content className="max-w-64">
                                    <Popover.Dialog>
                                        <Popover.Arrow />
                                        <p className="text-sm">
                                            Please contact the systems team to
                                            reset your password.
                                        </p>
                                    </Popover.Dialog>
                                </Popover.Content>
                            </Popover>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            isPending={processing}
                            data-test="login-button"
                        >
                            Log in
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
