import { buttonVariants, Chip, Table } from '@heroui/react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Filters from '@/components/filters';
import FormField from '@/components/form-field';
import Heading from '@/components/heading';
import Pagination from '@/components/pagination';
import SelectField from '@/components/select-field';
import { stageColors } from '@/lib/revisions';
import { create, index, show } from '@/routes/projects';
import type {
    Filters as FilterValues,
    Paginated,
    Project,
    User,
} from '@/types';

type Props = {
    projects: Paginated<Project>;
    users: Pick<User, 'id' | 'name'>[];
    stages: { id: string; name: string }[];
    filters: FilterValues;
};

export default function Projects({ projects, users, stages, filters }: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Projects" />

            <div className="space-y-6 px-4 py-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Projects"
                        description="Client enquiries and their quotation revisions"
                    />
                    {auth.permissions.includes('projects.create') && (
                        <Link href={create()} className={buttonVariants()}>
                            <Plus className="size-4" />
                            New project
                        </Link>
                    )}
                </div>

                <Filters action={index.url()}>
                    <FormField
                        label="Search"
                        name="search"
                        placeholder="Project or client"
                        defaultValue={filters.search}
                    />
                    <SelectField
                        label="Salespeople"
                        name="salespeople"
                        placeholder="All salespeople"
                        options={users}
                        defaultValue={filters.salespeople}
                        isClearable
                        isMultiple
                    />
                    <SelectField
                        label="Status"
                        name="stages"
                        placeholder="Any status"
                        options={stages}
                        defaultValue={filters.stages}
                        isClearable
                        isMultiple
                    />
                </Filters>

                <Table>
                    <Table.ScrollContainer>
                        <Table.Content aria-label="Projects">
                            <Table.Header>
                                <Table.Column isRowHeader>Project</Table.Column>
                                <Table.Column>Client</Table.Column>
                                <Table.Column>Salesperson</Table.Column>
                                <Table.Column>Inquiry received</Table.Column>
                                <Table.Column className="text-end">
                                    Revisions
                                </Table.Column>
                                <Table.Column>Status</Table.Column>
                            </Table.Header>
                            <Table.Body
                                renderEmptyState={() => (
                                    <p className="p-4 text-center text-sm text-muted">
                                        No projects found.
                                    </p>
                                )}
                            >
                                {projects.data.map((project) => (
                                    <Table.Row key={project.id}>
                                        <Table.Cell>
                                            <Link
                                                href={show(project.id)}
                                                className="font-medium hover:underline"
                                            >
                                                {project.name}
                                            </Link>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {project.client_name}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {project.salesperson?.name}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {project.inquiry_received_at}
                                        </Table.Cell>
                                        <Table.Cell className="text-end">
                                            {project.revisions_count}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {project.latest_revision && (
                                                <Chip
                                                    size="sm"
                                                    color={
                                                        stageColors[
                                                            project
                                                                .latest_revision
                                                                .stage
                                                        ]
                                                    }
                                                >
                                                    {
                                                        project.latest_revision
                                                            .stage_label
                                                    }
                                                </Chip>
                                            )}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>

                <Pagination paginator={projects} />
            </div>
        </>
    );
}

Projects.layout = {
    breadcrumbs: [
        {
            title: 'Projects',
            href: index(),
        },
    ],
};
