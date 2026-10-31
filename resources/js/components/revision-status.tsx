import {
    Button,
    Chip,
    FieldError,
    Label,
    Modal,
    TextArea,
    TextField,
} from '@heroui/react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Check, Send, X } from 'lucide-react';
import { useState } from 'react';
import RevisionStatusController from '@/actions/App/Http/Controllers/RevisionStatusController';
import SelectField from '@/components/select-field';
import { stageColors } from '@/lib/revisions';
import type { ProjectRevision } from '@/types';

const validationOptions = [
    { id: 'pending', name: 'Pending' },
    { id: 'validated', name: 'Validated' },
    { id: 'price_changed', name: 'Price changed' },
];

type Props = {
    projectId: number;
    revision: ProjectRevision;
    isLatest: boolean;
};

const date = (value: string) => new Date(value).toLocaleDateString();

export default function RevisionStatus({
    projectId,
    revision,
    isLatest,
}: Props) {
    const { auth } = usePage().props;
    const [modal, setModal] = useState<'decision' | 'issue' | null>(null);
    const form = useForm({ note: '' });

    const can = (permission: string) => auth.permissions.includes(permission);
    const args = { project: projectId, revision: revision.id };
    const isOpen = isLatest && !revision.issued_at;
    const isOverride = revision.supplier_validation === 'pending';
    const canIssue =
        isOpen &&
        ['not_required', 'approved'].includes(revision.approval_status) &&
        revision.supplier_validation !== 'price_changed' &&
        can(isOverride ? 'revisions.issue-override' : 'revisions.issue');

    const totals = revision.items.reduce(
        (sum, item) => ({
            price: sum.price + Number(item.total_price),
            cost: sum.cost + Number(item.total_cost),
        }),
        { price: 0, cost: 0 },
    );
    const margin = totals.price
        ? ((totals.price - totals.cost) / totals.price) * 100
        : 0;

    const openModal = (name: 'decision' | 'issue') => {
        form.reset();
        form.clearErrors();
        setModal(name);
    };

    const submit = (url: string) =>
        form.post(url, {
            preserveScroll: true,
            onSuccess: () => setModal(null),
        });

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Chip color={stageColors[revision.stage]}>
                    {revision.stage_label}
                </Chip>
                {!isLatest && <Chip>Superseded</Chip>}
                <span className="text-sm text-muted">
                    Margin {margin.toFixed(2)}% (floor{' '}
                    {Number(revision.margin_floor)}%)
                </span>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                    <dt className="text-muted">Approval</dt>
                    <dd className="font-medium">{revision.approval_label}</dd>
                    {revision.approved_by && revision.approved_at && (
                        <dd className="text-xs text-muted">
                            by {revision.approved_by.name} on{' '}
                            {date(revision.approved_at)}
                        </dd>
                    )}
                    {revision.approval_note && (
                        <dd className="text-xs">{revision.approval_note}</dd>
                    )}
                </div>
                <div>
                    {isOpen && can('revisions.validate') ? (
                        <SelectField
                            label="Supplier validation"
                            name="supplier_validation"
                            options={validationOptions}
                            value={revision.supplier_validation}
                            onChange={(value) =>
                                router.patch(
                                    RevisionStatusController.validateSupplier.url(
                                        args,
                                    ),
                                    { supplier_validation: value },
                                    { preserveScroll: true },
                                )
                            }
                        />
                    ) : (
                        <>
                            <dt className="text-muted">Supplier validation</dt>
                            <dd className="font-medium">
                                {revision.supplier_validation_label}
                            </dd>
                        </>
                    )}
                </div>
                <div>
                    <dt className="text-muted">Quotation</dt>
                    <dd className="font-medium">
                        {revision.issued_at
                            ? `Issued ${date(revision.issued_at)}`
                            : 'Not issued'}
                    </dd>
                    {revision.issued_by && (
                        <dd className="text-xs text-muted">
                            by {revision.issued_by.name}
                        </dd>
                    )}
                    {revision.issue_note && (
                        <dd className="text-xs">{revision.issue_note}</dd>
                    )}
                </div>
            </dl>

            {isOpen && (
                <div className="flex flex-wrap gap-2">
                    {revision.approval_status === 'pending' &&
                        can('revisions.approve') && (
                            <Button
                                size="sm"
                                variant="secondary"
                                onPress={() => openModal('decision')}
                            >
                                <Check className="size-4" />
                                Approve or reject
                            </Button>
                        )}
                    {canIssue && (
                        <Button size="sm" onPress={() => openModal('issue')}>
                            <Send className="size-4" />
                            Issue quotation
                        </Button>
                    )}
                </div>
            )}

            <Modal.Backdrop
                isOpen={modal !== null}
                onOpenChange={(open) => !open && setModal(null)}
            >
                <Modal.Container>
                    <Modal.Dialog>
                        <Modal.Header>
                            <Modal.Heading>
                                {modal === 'decision'
                                    ? `Approve revision ${revision.number}?`
                                    : `Issue quotation for revision ${revision.number}?`}
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="space-y-4">
                            <p className="text-sm">
                                {modal === 'decision'
                                    ? `The margin is ${margin.toFixed(2)}%, below the ${Number(revision.margin_floor)}% floor. A note is required to reject.`
                                    : isOverride
                                      ? 'The supplier has not validated the prices yet. Issuing now is an override and needs a note explaining why.'
                                      : 'The quotation will be marked as issued. Its statuses cannot change afterwards.'}
                            </p>
                            <TextField
                                fullWidth
                                value={form.data.note}
                                onChange={(note) => form.setData('note', note)}
                                validationBehavior="aria"
                                isInvalid={!!form.errors.note}
                            >
                                <Label>Note</Label>
                                <TextArea rows={3} />
                                <FieldError>{form.errors.note}</FieldError>
                            </TextField>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button slot="close" variant="tertiary">
                                Cancel
                            </Button>
                            {modal === 'decision' ? (
                                <>
                                    <Button
                                        variant="danger"
                                        isPending={form.processing}
                                        onPress={() =>
                                            submit(
                                                RevisionStatusController.reject.url(
                                                    args,
                                                ),
                                            )
                                        }
                                    >
                                        <X className="size-4" />
                                        Reject
                                    </Button>
                                    <Button
                                        isPending={form.processing}
                                        onPress={() =>
                                            submit(
                                                RevisionStatusController.approve.url(
                                                    args,
                                                ),
                                            )
                                        }
                                    >
                                        <Check className="size-4" />
                                        Approve
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    isPending={form.processing}
                                    onPress={() =>
                                        submit(
                                            RevisionStatusController.issue.url(
                                                args,
                                            ),
                                        )
                                    }
                                >
                                    <Send className="size-4" />
                                    Issue quotation
                                </Button>
                            )}
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </div>
    );
}
