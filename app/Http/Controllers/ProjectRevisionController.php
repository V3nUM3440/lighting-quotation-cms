<?php

namespace App\Http\Controllers;

use App\Exports\CostingSheetExport;
use App\Http\Requests\RevisionRequest;
use App\Models\ActivityLog;
use App\Models\Brand;
use App\Models\Project;
use App\Models\ProjectRevision;
use App\Models\ProjectRevisionItem;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Number;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProjectRevisionController extends Controller
{
    /**
     * Add a new revision to the given project.
     */
    public function store(RevisionRequest $request, Project $project): RedirectResponse
    {
        DB::transaction(fn () => $project->addRevision($request->validated(), $request->user()));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Revision added.')]);

        return back();
    }

    /**
     * Download the revision's costing sheet.
     */
    public function costingSheet(Project $project, ProjectRevision $revision): BinaryFileResponse
    {
        ActivityLog::record('downloaded', "Downloaded the costing sheet of {$revision->quoteNumber()}", $revision);

        return (new CostingSheetExport($revision))->download($this->filename($project, $revision, 'costing-sheet').'.xlsx');
    }

    /**
     * Download the revision's quotation.
     */
    public function quotation(Project $project, ProjectRevision $revision): Response
    {
        $revision->load(['project.salesperson', 'preparedBy', 'items' => fn ($query) => $query->orderBy('id')]);

        $pdf = Pdf::loadView('pdf.quotation', [
            'revision' => $revision,
            'partners' => Brand::query()->where('is_partner', true)->orderBy('name')->get(),
        ])->setOption('isFontSubsettingEnabled', true);

        $pdf->render();
        $canvas = $pdf->getDomPDF()->getCanvas();
        $font = $pdf->getDomPDF()->getFontMetrics()->getFont('DejaVu Sans') ?? '';
        $canvas->page_text($canvas->get_width() / 2 - 22, $canvas->get_height() - 30, 'Page {PAGE_NUM} of {PAGE_COUNT}', $font, 7);

        ActivityLog::record('downloaded', "Downloaded the quotation {$revision->quoteNumber()}", $revision);

        return $pdf->download($this->filename($project, $revision, 'quotation').'.pdf');
    }

    /**
     * Open a draft email asking a brand to validate the prices considered in the revision.
     */
    public function validationEmail(Request $request, Project $project, ProjectRevision $revision): RedirectResponse
    {
        abort_unless($revision->isLatest() && ! $revision->issued_at, 403);

        $brandName = $request->string('brand')->toString();
        $items = $revision->items()->where('brand_name', $brandName)->orderBy('id')->get();

        abort_if($items->isEmpty(), 404);

        $brand = Brand::query()
            ->with('contacts')
            ->whereIn('id', $items->load('product')->pluck('product.brand_id')->filter())
            ->orWhere('name', $brandName)
            ->first();

        $lines = $items->values()->map(function (ProjectRevisionItem $item, int $index) {
            $price = round((float) $item->manufacturer_price * (1 - (float) $item->discount / 100), 2);
            $considered = "{$item->currency} ".Number::format($price, 2);

            if ((float) $item->discount > 0) {
                $considered .= " ({$item->currency} ".Number::format((float) $item->manufacturer_price, 2).' less '.Number::format((float) $item->discount).'% discount)';
            }

            return implode("\n", array_filter([
                ($index + 1).". {$item->product_code} - {$item->product_name}",
                $item->description ? '   '.Str::squish($item->description) : null,
                '   Qty: '.Number::format((float) $item->quantity)." {$item->uom} | Unit price considered: {$considered}",
            ]));
        });

        $body = implode("\n\n", [
            "Dear {$brandName} team,",
            'We have an enquiry for the project below and are quoting the following products. Please validate the unit prices considered and confirm price validity and availability.',
            "Project: {$project->name}\nOur reference: {$revision->quoteNumber()}",
            $lines->implode("\n\n"),
            'If any price differs, please send your revised price. Please also register this enquiry against our reference.',
            'Regards,'."\n".implode("\n", array_filter([
                $project->salesperson?->name,
                $project->salesperson?->phone,
                Setting::get('company.name'),
            ])),
        ]);

        ActivityLog::record('emailed', "Opened the price validation email to {$brandName} for {$revision->quoteNumber()}", $revision);

        return redirect()->away('mailto:'.$brand?->contacts->pluck('email')->filter()->implode(',').'?'.http_build_query([
            'subject' => "Price validation request - {$revision->quoteNumber()} - {$project->name}",
            'body' => str_replace("\n", "\r\n", $body),
        ], '', '&', PHP_QUERY_RFC3986));
    }

    private function filename(Project $project, ProjectRevision $revision, string $document): string
    {
        return Str::slug("{$project->name} rev {$revision->number} {$document}");
    }
}
