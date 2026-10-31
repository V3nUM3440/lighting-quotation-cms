import { Button, Card } from '@heroui/react';
import { Form, Head } from '@inertiajs/react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ProjectController from '@/actions/App/Http/Controllers/ProjectController';
import Heading from '@/components/heading';
import ProjectFields from '@/components/project-fields';
import RevisionEditor from '@/components/revision-editor';
import { copyDraft, newDraft } from '@/lib/revisions';
import { index } from '@/routes/projects';
import type { RevisionDefaults, RevisionDraft, User } from '@/types';

type Props = {
    users: Pick<User, 'id' | 'name'>[];
    defaults: RevisionDefaults;
};

export default function CreateProject({ users, defaults }: Props) {
    const [revisions, setRevisions] = useState<RevisionDraft[]>([
        newDraft(defaults),
    ]);

    const updateRevision = (draft: RevisionDraft) =>
        setRevisions(
            revisions.map((revision) =>
                revision.key === draft.key ? draft : revision,
            ),
        );

    const duplicate = (index: number) =>
        setRevisions([
            ...revisions.slice(0, index + 1),
            copyDraft(revisions[index]),
            ...revisions.slice(index + 1),
        ]);

    return (
        <>
            <Head title="New project" />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    title="New project"
                    description="General information and the first revision of the quotation"
                />

                <Form {...ProjectController.store.form()} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <Card>
                                <Card.Header>
                                    <Card.Title>General information</Card.Title>
                                </Card.Header>
                                <Card.Content>
                                    <ProjectFields
                                        users={users}
                                        errors={errors}
                                    />
                                </Card.Content>
                            </Card>

                            {revisions.map((revision, i) => (
                                <Card key={revision.key}>
                                    <Card.Header className="flex-row items-center justify-between">
                                        <Card.Title>
                                            Revision {i + 1}
                                        </Card.Title>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onPress={() => duplicate(i)}
                                            >
                                                <Copy className="size-4" />
                                                Duplicate
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                isDisabled={
                                                    revisions.length === 1
                                                }
                                                onPress={() =>
                                                    setRevisions(
                                                        revisions.filter(
                                                            (row) =>
                                                                row.key !==
                                                                revision.key,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Trash2 className="size-4 text-danger" />
                                                Remove
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Content>
                                        <RevisionEditor
                                            draft={revision}
                                            onChange={updateRevision}
                                            name={`revisions[${i}]`}
                                            errorPrefix={`revisions.${i}.`}
                                            errors={errors}
                                            defaults={defaults}
                                        />
                                    </Card.Content>
                                </Card>
                            ))}

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="secondary"
                                    onPress={() =>
                                        setRevisions([
                                            ...revisions,
                                            newDraft(defaults),
                                        ])
                                    }
                                >
                                    <Plus className="size-4" />
                                    Add revision
                                </Button>
                                <Button type="submit" isPending={processing}>
                                    Create project
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

CreateProject.layout = {
    breadcrumbs: [
        {
            title: 'Projects',
            href: index(),
        },
    ],
};
