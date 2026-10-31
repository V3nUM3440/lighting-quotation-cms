import {
    Button,
    Checkbox,
    CheckboxGroup,
    Label,
    Modal,
    Table,
} from '@heroui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import RoleController from '@/actions/App/Http/Controllers/RoleController';
import DeleteButton from '@/components/delete-button';
import Filters from '@/components/filters';
import FormField from '@/components/form-field';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import SelectField from '@/components/select-field';
import { index } from '@/routes/roles';
import type { Filters as FilterValues, Paginated, Role } from '@/types';

type Props = {
    roles: Paginated<Role>;
    permissions: string[];
    grantable: string[];
    filters: FilterValues;
};

export default function Roles({
    roles,
    permissions,
    grantable,
    filters,
}: Props) {
    const { auth } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Role | null>(null);

    const can = (permission: string) => auth.permissions.includes(permission);

    const groups = Object.groupBy(
        permissions,
        (permission) => permission.split('.')[0],
    );

    const openModal = (role: Role | null) => {
        setEditing(role);
        setIsModalOpen(true);
    };

    return (
        <>
            <Head title="Roles" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Roles"
                        description="The Admin role is a system role and always has every permission"
                    />
                    {can('roles.create') && (
                        <Button onPress={() => openModal(null)}>
                            <Plus className="size-4" />
                            Add role
                        </Button>
                    )}
                </div>

                <Filters action={index.url()}>
                    <FormField
                        label="Search"
                        name="search"
                        placeholder="Role name"
                        defaultValue={filters.search}
                    />
                    <SelectField
                        label="Permissions"
                        name="permissions"
                        placeholder="Any permission"
                        options={permissions.map((permission) => ({
                            id: permission,
                            name: permission,
                        }))}
                        defaultValue={filters.permissions}
                        isClearable
                        isMultiple
                    />
                </Filters>

                <Table>
                    <Table.ScrollContainer>
                        <Table.Content aria-label="Roles">
                            <Table.Header>
                                <Table.Column isRowHeader>Name</Table.Column>
                                <Table.Column>Permissions</Table.Column>
                                <Table.Column>Users</Table.Column>
                                <Table.Column className="text-end">
                                    Actions
                                </Table.Column>
                            </Table.Header>
                            <Table.Body
                                renderEmptyState={() => (
                                    <p className="p-4 text-center text-sm text-muted">
                                        No roles found.
                                    </p>
                                )}
                            >
                                {roles.data.map((role) => (
                                    <Table.Row key={role.id}>
                                        <Table.Cell>{role.name}</Table.Cell>
                                        <Table.Cell>
                                            {role.is_admin
                                                ? 'All'
                                                : role.permissions?.length}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {role.users_count}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {role.can_manage && (
                                                <div className="flex justify-end gap-1">
                                                    {can('roles.update') && (
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="ghost"
                                                            aria-label="Edit"
                                                            onPress={() =>
                                                                openModal(role)
                                                            }
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                    )}
                                                    {can('roles.delete') && (
                                                        <DeleteButton
                                                            form={RoleController.destroy.form(
                                                                role.id,
                                                            )}
                                                            title={`Delete ${role.name}?`}
                                                            description="Roles that are assigned to users cannot be deleted."
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

                <Pagination paginator={roles} />
            </div>

            <Modal.Backdrop isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
                <Modal.Container size="lg">
                    <Modal.Dialog>
                        <Form
                            key={editing?.id ?? 'new'}
                            {...(editing
                                ? RoleController.update.form(editing.id)
                                : RoleController.store.form())}
                            onSuccess={() => setIsModalOpen(false)}
                            className="contents"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Modal.Header>
                                        <Modal.Heading>
                                            {editing ? 'Edit role' : 'Add role'}
                                        </Modal.Heading>
                                    </Modal.Header>
                                    <Modal.Body className="space-y-6">
                                        <FormField
                                            label="Name"
                                            name="name"
                                            autoFocus
                                            defaultValue={editing?.name}
                                            placeholder="Role name"
                                            error={errors.name}
                                        />
                                        <CheckboxGroup
                                            name="permissions[]"
                                            defaultValue={editing?.permissions?.map(
                                                (permission) => permission.name,
                                            )}
                                        >
                                            <Label>Permissions</Label>
                                            <div className="space-y-4">
                                                {Object.entries(groups).map(
                                                    ([group, names]) => (
                                                        <div key={group}>
                                                            <p className="mb-2 text-sm font-medium capitalize">
                                                                {group}
                                                            </p>
                                                            <div className="flex flex-wrap gap-4">
                                                                {names?.map(
                                                                    (name) => (
                                                                        <Checkbox
                                                                            key={
                                                                                name
                                                                            }
                                                                            value={
                                                                                name
                                                                            }
                                                                            isDisabled={
                                                                                !grantable.includes(
                                                                                    name,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Checkbox.Content>
                                                                                <Checkbox.Control>
                                                                                    <Checkbox.Indicator />
                                                                                </Checkbox.Control>
                                                                                <span className="capitalize">
                                                                                    {
                                                                                        name.split(
                                                                                            '.',
                                                                                        )[1]
                                                                                    }
                                                                                </span>
                                                                            </Checkbox.Content>
                                                                        </Checkbox>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </CheckboxGroup>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button slot="close" variant="tertiary">
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            isPending={processing}
                                        >
                                            {editing ? 'Save' : 'Add role'}
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

Roles.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: index(),
        },
    ],
};
