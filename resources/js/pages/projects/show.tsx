import { Button, buttonVariants, Card, Dropdown } from '@heroui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import { Copy, FileSpreadsheet, FileText, Mail, Plus } from 'lucide-react';
import { useState } from 'react';
import ProjectController from '@/actions/App/Http/Controllers/ProjectController';
import ProjectRevisionController from '@/actions/App/Http/Controllers/ProjectRevisionController';
import Heading from '@/components/heading';
import ProjectFields from '@/components/project-fields';
import RevisionEditor from '@/components/revision-editor';
import RevisionItemsTable from '@/components/revision-items-table';
import RevisionStatus from '@/components/revision-status';
import RichTextEditor from '@/components/rich-text-editor';
import { newDraft } from '@/lib/revisions';
import { index } from '@/routes/projects';
import type {
    Project,
    ProjectRevision,
    RevisionDefaults,
    RevisionDraft,
    User,
} from '@/types';

type Props = {
    project: Project & { revisions: ProjectRevision[] };
    users: Pick<User, 'id' | 'name'>[];
    defaults: RevisionDefaults;
};

export default function ShowProject({ project, users, defaults }: Props) {
    const { auth } = usePage().props;
    const [draft, setDraft] = useState<RevisionDraft | null>(null);

    const can = (permission: string) => auth.permissions.includes(permission);

    const duplicate = (revision: ProjectRevision) => {
        setDraft(newDraft(defaults, revision));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Head title={project.name} />

            <div className="space-y-6 px-4 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title={project.name}
                        description={`${project.reference} · ${project.client_name} · ${project.revisions.length} revisions`}
                    />
                    {can('revisions.create') && draft === null && (
                        <Button onPress={() => setDraft(newDraft(defaults))}>
                            <Plus className="size-4" />
                            New revision
                        </Button>
                    )}
                </div>

                <Card>
                    <Card.Header>
                        <Card.Title>General information</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <Form
                            {...ProjectController.update.form(project.id)}
                            options={{ preserveScroll: true }}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <fieldset
                                    disabled={!can('projects.update')}
                                    className="space-y-4"
                                >
                                    <ProjectFields
                                        project={project}
                                        users={users}
                                        errors={errors}
                                    />
                                    {can('projects.update') && (
                                        <Button
                                            type="submit"
                                            isPending={processing}
                                        >
                                            Save
                                        </Button>
                                    )}
                                </fieldset>
                            )}
                        </Form>
                    </Card.Content>
                </Card>

                {draft !== null && (
                    <Card>
                        <Card.Header>
                            <Card.Title>
                                New revision ({project.revisions.length + 1})
                            </Card.Title>
                            <Card.Description>
                                Revisions can't be changed once saved.
                            </Card.Description>
                        </Card.Header>
                        <Card.Content>
                            <Form
                                key={draft.key}
                                {...ProjectRevisionController.store.form(
                                    project.id,
                                )}
                                onSuccess={() => setDraft(null)}
                                className="space-y-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <RevisionEditor
                                            draft={draft}
                                            onChange={setDraft}
                                            errors={errors}
                                            defaults={defaults}
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                type="submit"
                                                isPending={processing}
                                            >
                                                Save revision
                                            </Button>
                                            <Button
                                                variant="tertiary"
                                                onPress={() => setDraft(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </Card.Content>
                    </Card>
                )}

                {project.revisions.map((revision, index) => (
                    <Card key={revision.id}>
                        <Card.Header className="flex-row flex-wrap items-center justify-between gap-2">
                            <div>
                                <Card.Title>
                                    Revision {revision.number} ·{' '}
                                    {project.reference} R{revision.number}
                                </Card.Title>
                                <Card.Description>
                                    {new Date(
                                        revision.created_at,
                                    ).toLocaleDateString()}
                                    {revision.prepared_by &&
                                        ` · Prepared by ${revision.prepared_by.name}`}
                                    {` · Valid for ${revision.validity_days} days`}
                                </Card.Description>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {can('revisions.costing-sheet') && (
                                    <a
                                        href={ProjectRevisionController.costingSheet.url(
                                            {
                                                project: project.id,
                                                revision: revision.id,
                                            },
                                        )}
                                        className={buttonVariants({
                                            size: 'sm',
                                            variant: 'secondary',
                                        })}
                                    >
                                        <FileSpreadsheet className="size-4" />
                                        Costing sheet
                                    </a>
                                )}
                                {can('revisions.quotation') && (
                                    <a
                                        href={ProjectRevisionController.quotation.url(
                                            {
                                                project: project.id,
                                                revision: revision.id,
                                            },
                                        )}
                                        className={buttonVariants({
                                            size: 'sm',
                                            variant: 'secondary',
                                        })}
                                    >
                                        <FileText className="size-4" />
                                        {revision.issued_at
                                            ? 'Quotation'
                                            : 'Draft quotation'}
                                    </a>
                                )}
                                {can('revisions.validation-email') &&
                                    index === 0 &&
                                    !revision.issued_at && (
                                        <Dropdown>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                            >
                                                <Mail className="size-4" />
                                                Email brands
                                            </Button>
                                            <Dropdown.Popover>
                                                <Dropdown.Menu
                                                    aria-label="Brands"
                                                    onAction={(brand) =>
                                                        window.location.assign(
                                                            ProjectRevisionController.validationEmail.url(
                                                                {
                                                                    project:
                                                                        project.id,
                                                                    revision:
                                                                        revision.id,
                                                                },
                                                                {
                                                                    query: {
                                                                        brand: String(
                                                                            brand,
                                                                        ),
                                                                    },
                                                                },
                                                            ),
                                                        )
                                                    }
                                                >
                                                    {[
                                                        ...new Set(
                                                            revision.items.map(
                                                                (item) =>
                                                                    item.brand_name,
                                                            ),
                                                        ),
                                                    ].map((brand) => (
                                                        <Dropdown.Item
                                                            key={brand}
                                                            id={brand}
                                                            textValue={brand}
                                                        >
                                                            {brand}
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown.Popover>
                                        </Dropdown>
                                    )}
                                {can('revisions.create') && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onPress={() => duplicate(revision)}
                                    >
                                        <Copy className="size-4" />
                                        Duplicate
                                    </Button>
                                )}
                            </div>
                        </Card.Header>
                        <Card.Content className="space-y-6">
                            <RevisionStatus
                                projectId={project.id}
                                revision={revision}
                                isLatest={index === 0}
                            />
                            <RevisionItemsTable revision={revision} />
                            {revision.payment_terms && (
                                <p className="text-sm">
                                    <span className="font-medium">
                                        Payment terms:
                                    </span>{' '}
                                    {revision.payment_terms}
                                </p>
                            )}
                            {revision.terms && (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Terms and conditions
                                    </p>
                                    <RichTextEditor value={revision.terms} />
                                </div>
                            )}
                            {revision.events && revision.events.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Activity
                                    </p>
                                    <ul className="space-y-1 text-sm">
                                        {revision.events.map((event) => (
                                            <li key={event.id}>
                                                <span className="text-muted">
                                                    {new Date(
                                                        event.created_at,
                                                    ).toLocaleString()}
                                                </span>{' '}
                                                {event.action}
                                                {event.user &&
                                                    ` by ${event.user.name}`}
                                                {event.note && (
                                                    <span className="text-muted">
                                                        {' '}
                                                        - {event.note}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card.Content>
                    </Card>
                ))}
            </div>
        </>
    );
}

ShowProject.layout = {
    breadcrumbs: [
        {
            title: 'Projects',
            href: index(),
        },
    ],
};
