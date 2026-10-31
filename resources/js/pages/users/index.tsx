import { Alert, Button, Modal, Table } from '@heroui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import DeleteButton from '@/components/delete-button';
import Filters from '@/components/filters';
import FormField from '@/components/form-field';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import SelectField from '@/components/select-field';
import { index } from '@/routes/users';
import type { Filters as FilterValues, Paginated, Role, User } from '@/types';

type Props = {
    users: Paginated<User>;
    roles: Pick<Role, 'id' | 'name'>[];
    assignableRoleIds: number[];
    defaultPassword: string | null;
    filters: FilterValues;
};

export default function Users({
    users,
    roles,
    assignableRoleIds,
    defaultPassword,
    filters,
}: Props) {
    const { auth } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);

    const can = (permission: string) => auth.permissions.includes(permission);
    const assignableRoles = roles.filter((role) =>
        assignableRoleIds.includes(role.id),
    );

    const openModal = (user: User | null) => {
        setEditing(user);
        setIsModalOpen(true);
    };

    return (
        <>
            <Head title="Users" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Users"
                        description="New users are given the default password and can change it from their settings"
                    />
                    {can('users.create') && (
                        <Button onPress={() => openModal(null)}>
                            <Plus className="size-4" />
                            Add user
                        </Button>
                    )}
                </div>

                <Filters action={index.url()}>
                    <FormField
                        label="Search"
                        name="search"
                        placeholder="Name or email"
                        defaultValue={filters.search}
                    />
                    <SelectField
                        label="Roles"
                        name="roles"
                        placeholder="All roles"
                        options={roles}
                        defaultValue={filters.roles}
                        isClearable
                        isMultiple
                    />
                </Filters>

                <Table>
                    <Table.ScrollContainer>
                        <Table.Content aria-label="Users">
                            <Table.Header>
                                <Table.Column isRowHeader>Name</Table.Column>
                                <Table.Column>Email</Table.Column>
                                <Table.Column>Role</Table.Column>
                                <Table.Column className="text-end">
                                    Actions
                                </Table.Column>
                            </Table.Header>
                            <Table.Body
                                renderEmptyState={() => (
                                    <p className="p-4 text-center text-sm text-muted">
                                        No users found.
                                    </p>
                                )}
                            >
                                {users.data.map((user) => (
                                    <Table.Row key={user.id}>
                                        <Table.Cell>{user.name}</Table.Cell>
                                        <Table.Cell>{user.email}</Table.Cell>
                                        <Table.Cell>
                                            {user.role?.name}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {user.can_manage && (
                                                <div className="flex justify-end gap-1">
                                                    {can('users.update') && (
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="ghost"
                                                            aria-label="Edit"
                                                            onPress={() =>
                                                                openModal(user)
                                                            }
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                    )}
                                                    {can('users.delete') &&
                                                        user.id !==
                                                            auth.user.id && (
                                                            <DeleteButton
                                                                form={UserController.destroy.form(
                                                                    user.id,
                                                                )}
                                                                title={`Delete ${user.name}?`}
                                                                description="This user will no longer be able to log in. This cannot be undone."
                                                            />
                                                        )}
                                                </div>
                                            )}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>

                <Pagination paginator={users} />
            </div>

            <Modal.Backdrop isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
                <Modal.Container>
                    <Modal.Dialog>
                        <Form
                            key={editing?.id ?? 'new'}
                            {...(editing
                                ? UserController.update.form(editing.id)
                                : UserController.store.form())}
                            onSuccess={() => setIsModalOpen(false)}
                            className="contents"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Modal.Header>
                                        <Modal.Heading>
                                            {editing ? 'Edit user' : 'Add user'}
                                        </Modal.Heading>
                                    </Modal.Header>
                                    <Modal.Body className="space-y-4">
                                        {!editing && defaultPassword && (
                                            <Alert>
                                                <Alert.Indicator />
                                                <Alert.Content>
                                                    <Alert.Title>
                                                        Default password:{' '}
                                                        <span className="font-mono">
                                                            {defaultPassword}
                                                        </span>
                                                    </Alert.Title>
                                                    <Alert.Description>
                                                        Share it with the new
                                                        user. They can change it
                                                        under Settings →
                                                        Security.
                                                    </Alert.Description>
                                                </Alert.Content>
                                            </Alert>
                                        )}
                                        <FormField
                                            label="Name"
                                            name="name"
                                            autoFocus
                                            defaultValue={editing?.name}
                                            placeholder="Full name"
                                            error={errors.name}
                                        />
                                        <FormField
                                            label="Email address"
                                            name="email"
                                            type="email"
                                            defaultValue={editing?.email}
                                            placeholder="email@example.com"
                                            error={errors.email}
                                        />
                                        <FormField
                                            label="Mobile"
                                            name="phone"
                                            type="tel"
                                            defaultValue={editing?.phone ?? ''}
                                            error={errors.phone}
                                        />
                                        <SelectField
                                            label="Role"
                                            name="role_id"
                                            placeholder="Select a role"
                                            options={assignableRoles}
                                            defaultValue={editing?.role_id}
                                            error={errors.role_id}
                                        />
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button slot="close" variant="tertiary">
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            isPending={processing}
                                        >
                                            {editing ? 'Save' : 'Add user'}
                                        </Button>
                                    </Modal.Footer>
                                </>
                            )}
                        </Form>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </>
    );
}

Users.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: index(),
        },
    ],
};
