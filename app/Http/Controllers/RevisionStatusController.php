<?php

namespace App\Http\Controllers;

use App\Enums\ApprovalStatus;
use App\Enums\SupplierValidation;
use App\Models\Project;
use App\Models\ProjectRevision;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RevisionStatusController extends Controller
{
    /**
     * Approve a revision that is below the margin floor.
     */
    public function approve(Request $request, Project $project, ProjectRevision $revision): RedirectResponse
    {
        return $this->decide($request, $revision, ApprovalStatus::Approved);
    }

    /**
     * Reject a revision that is below the margin floor. A note is required.
     */
    public function reject(Request $request, Project $project, ProjectRevision $revision): RedirectResponse
    {
        return $this->decide($request, $revision, ApprovalStatus::Rejected);
    }

    /**
     * Record the supplier's validation of the revision's prices.
     */
    public function validateSupplier(Request $request, Project $project, ProjectRevision $revision): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_validation' => ['required', Rule::enum(SupplierValidation::class)],
        ]);

        if ($error = $this->openRevisionError($revision)) {
            return $this->fail($error);
        }

        $status = SupplierValidation::from($validated['supplier_validation']);

        if ($status !== $revision->supplier_validation) {
            $revision->update(['supplier_validation' => $status]);
            $revision->record($request->user(), "Supplier validation set to {$status->label()}");
        }

        return $this->done('Supplier validation updated.');
    }

    /**
     * Issue the revision's quotation. Issuing before supplier validation needs the
     * override permission and a note.
     */
    public function issue(Request $request, Project $project, ProjectRevision $revision): RedirectResponse
    {
        $validated = $request->validate(['note' => ['nullable', 'string', 'max:2000']]);
        $note = $validated['note'] ?? null;

        if ($error = $this->openRevisionError($revision)) {
            return $this->fail($error);
        }

        if (in_array($revision->approval_status, [ApprovalStatus::Pending, ApprovalStatus::Rejected], true)) {
            return $this->fail("The revision is {$revision->approval_status->label()}. It must be approved before its quotation can be issued.");
        }

        if ($revision->supplier_validation === SupplierValidation::PriceChanged) {
            return $this->fail('The supplier reported a price change. Create a new revision instead.');
        }

        $override = $revision->supplier_validation === SupplierValidation::Pending;

        Gate::authorize($override ? 'revisions.issue-override' : 'revisions.issue');

        if ($override && ! $note) {
            return $this->fail('A note is required to issue a quotation before supplier validation.');
        }

        $revision->update(['issued_at' => now(), 'issued_by_id' => $request->user()?->id, 'issue_note' => $note]);
        $revision->record($request->user(), $override ? 'Quotation issued before supplier validation (override)' : 'Quotation issued', $note);

        return $this->done('Quotation issued.');
    }

    private function decide(Request $request, ProjectRevision $revision, ApprovalStatus $decision): RedirectResponse
    {
        $validated = $request->validate([
            'note' => [$decision === ApprovalStatus::Rejected ? 'required' : 'nullable', 'string', 'max:2000'],
        ]);
        $note = $validated['note'] ?? null;

        if ($error = $this->openRevisionError($revision)) {
            return $this->fail($error);
        }

        if ($revision->approval_status !== ApprovalStatus::Pending) {
            return $this->fail('This revision is not waiting for approval.');
        }

        $revision->update([
            'approval_status' => $decision,
            'approval_note' => $note,
            'approved_by_id' => $request->user()?->id,
            'approved_at' => now(),
        ]);
        $revision->record($request->user(), $decision->label(), $note);

        return $this->done("Revision {$decision->label()}.");
    }

    /**
     * Statuses can only change on the latest revision, until its quotation is issued.
     */
    private function openRevisionError(ProjectRevision $revision): ?string
    {
        return match (true) {
            ! $revision->isLatest() => 'This revision has been superseded by a newer revision.',
            $revision->issued_at !== null => 'The quotation for this revision has already been issued.',
            default => null,
        };
    }

    private function fail(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'danger', 'message' => $message]);

        return back();
    }

    private function done(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }
}
