import { Button, Chip, Modal, Table } from '@heroui/react';
import { Head } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import DatePickerField from '@/components/date-picker-field';
import Filters from '@/components/filters';
import FormField from '@/components/form-field';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import SelectField from '@/components/select-field';
import { index } from '@/routes/activity-logs';
import type { Filters as FilterValues, Paginated, User } from '@/types';

type ActivityLog = {
    id: number;
    action: string;
    subject_type: string | null;
    subject_id: string | null;
    description: string;
    properties: {
        old?: Record<string, unknown>;
        new?: Record<string, unknown>;
    } | null;
    ip_address: string | null;
    created_at: string;
    user: Pick<User, 'id' | 'name'> | null;
};

type Option = { id: string; name: string };

type Props = {
    logs: Paginated<ActivityLog>;
    users: Pick<User, 'id' | 'name'>[];
    actions: Option[];
    subjects: Option[];
    filters: FilterValues;
};

const actionColors: Record<
    string,
    'success' | 'accent' | 'danger' | 'warning'
> = {
    created: 'success',
    updated: 'accent',
    deleted: 'danger',
    login_failed: 'warning',
};

const headline = (value: string) =>
    value.replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());

const display = (value: unknown) =>
    value === null || value === undefined || value === ''
        ? '—'
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value as string | number | boolean);

export default function ActivityLogs({
    logs,
    users,
    actions,
    subjects,
    filters,
}: Props) {
    const [viewing, setViewing] = useState<ActivityLog | null>(null);

    const fields = viewing
        ? [
              ...new Set([
                  ...Object.keys(viewing.properties?.old ?? {}),
                  ...Object.keys(viewing.properties?.new ?? {}),
              ]),
          ]
        : [];

    return (
        <>
            <Head title="Activity log" />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    title="Activity log"
                    description="An audit trail of the actions users take in the app"
                />

                <Filters action={index.url()}>
                    <FormField
                        label="Search"
                        name="search"
                        placeholder="Description or IP address"
                        defaultValue={filters.search}
                    />
                    <SelectField
                        label="Users"
                        name="users"
                        placeholder="All users"
                        options={users}
                        defaultValue={filters.users}
                        isClearable
                        isMultiple
                    />
                    <SelectField
                        label="Actions"
                        name="actions"
                        placeholder="All actions"
                        options={actions}
                        defaultValue={filters.actions}
                        isClearable
                        isMultiple
                    />
                    <SelectField
                        label="Records"
                        name="subjects"
                        placeholder="All records"
                        options={subjects}
                        defaultValue={filters.subjects}
                        isClearable
                        isMultiple
                    />
                    <DatePickerField
                        label="From"
                        name="from"
                        defaultValue={filters.from as string | undefined}
                    />
                    <DatePickerField
                        label="To"
                        name="to"
                        defaultValue={filters.to as string | undefined}
                    />
                </Filters>

                <Table>
                    <Table.ScrollContainer>
                        <Table.Content aria-label="Activity log">
                            <Table.Header>
                                <Table.Column isRowHeader>When</Table.Column>
                                <Table.Column>User</Table.Column>
                                <Table.Column>Action</Table.Column>
                                <Table.Column>Description</Table.Column>
                                <Table.Column>IP address</Table.Column>
                                <Table.Column className="text-end">
                                    Details
                                </Table.Column>
                            </Table.Header>
                            <Table.Body
                                renderEmptyState={() => (
                                    <p className="p-4 text-center text-sm text-muted">
                                        No activity found.
                                    </p>
                                )}
                            >
                                {logs.data.map((log) => (
                                    <Table.Row key={log.id}>
                                        <Table.Cell className="whitespace-nowrap">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleString()}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {log.user?.name ?? (
                                                <span className="text-muted">
                                                    System
                                                </span>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Chip
                                                size="sm"
                                                color={
                                                    actionColors[log.action] ??
                                                    'default'
                                                }
                                            >
                                                {headline(log.action)}
                                            </Chip>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {log.description}
                                        </Table.Cell>
                                        <Table.Cell className="text-muted">
                                            {log.ip_address}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {log.properties && (
                                                <div className="flex justify-end">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="ghost"
                                                        aria-label="View details"
                                                        onPress={() =>
                                                            setViewing(log)
                                                        }
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>

                <Pagination paginator={logs} />
            </div>

            <Modal.Backdrop
                isOpen={viewing !== null}
                onOpenChange={(isOpen) => !isOpen && setViewing(null)}
            >
                <Modal.Container size="lg">
                    <Modal.Dialog>
                        <Modal.Header>
                            <Modal.Heading>
                                {viewing?.description}
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <Table>
                                <Table.ScrollContainer>
                                    <Table.Content aria-label="Details">
                                        <Table.Header>
                                            <Table.Column isRowHeader>
                                                Field
                                            </Table.Column>
                                            <Table.Column>Before</Table.Column>
                                            <Table.Column>After</Table.Column>
                                        </Table.Header>
                                        <Table.Body>
                                            {fields.map((field) => (
                                                <Table.Row key={field}>
                                                    <Table.Cell className="align-top font-medium">
                                                        {headline(field)}
                                                    </Table.Cell>
                                                    <Table.Cell className="align-top break-words whitespace-pre-wrap text-muted">
                                                        {display(
                                                            viewing?.properties
                                                                ?.old?.[field],
                                                        )}
                                                    </Table.Cell>
                                                    <Table.Cell className="align-top break-words whitespace-pre-wrap">
                                                        {display(
                                                            viewing?.properties
                                                                ?.new?.[field],
                                                        )}
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table.Content>
                                </Table.ScrollContainer>
                            </Table>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button slot="close" variant="tertiary">
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </>
    );
}

ActivityLogs.layout = {
    breadcrumbs: [
        {
            title: 'Activity log',
            href: index(),
        },
    ],
};
