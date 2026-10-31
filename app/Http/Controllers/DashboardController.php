<?php

namespace App\Http\Controllers;

use App\Enums\RevisionStage;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProjectRevision;
use App\Models\ProjectRevisionItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard with project statistics based on each project's latest revision.
     */
    public function __invoke(Request $request): Response
    {
        if (! $request->user()?->can('projects.view')) {
            return Inertia::render('dashboard', ['stats' => null]);
        }

        $revisions = $this->latestRevisions()
            ->with(['project:id,reference,name,client_name,inquiry_received_at,salesperson_id', 'project.salesperson:id,name'])
            ->withSum('items', 'total_price')
            ->withSum('items', 'total_cost')
            ->get();

        $value = fn ($revisions) => round((float) $revisions->sum('items_sum_total_price'), 2);
        $issued = $revisions->whereNotNull('issued_at');
        $open = $revisions->whereNull('issued_at');
        $totalPrice = $value($revisions);

        return Inertia::render('dashboard', [
            'stats' => [
                'totals' => [
                    'projects' => $revisions->count(),
                    'open' => $open->count(),
                    'issued' => $issued->count(),
                    'pipeline_value' => $value($open),
                    'issued_value' => $value($issued),
                    'margin' => $totalPrice > 0 ? round(($totalPrice - (float) $revisions->sum('items_sum_total_cost')) / $totalPrice * 100, 1) : null,
                    'brands' => Brand::count(),
                    'products' => Product::count(),
                ],
                'stages' => collect(RevisionStage::cases())->map(fn (RevisionStage $stage) => [
                    'id' => $stage->value,
                    'name' => $stage->label(),
                    'count' => $revisions->filter(fn (ProjectRevision $revision) => $revision->currentStage() === $stage)->count(),
                ]),
                'months' => collect(range(11, 0))->map(function (int $ago) use ($revisions, $value) {
                    $month = now()->startOfMonth()->subMonths($ago);
                    $inMonth = $revisions->filter(fn (ProjectRevision $revision) => $revision->project->inquiry_received_at->isSameMonth($month));

                    return ['month' => $month->format('M Y'), 'enquiries' => $inMonth->count(), 'value' => $value($inMonth)];
                }),
                'brands' => ProjectRevisionItem::query()
                    ->whereIn('project_revision_id', $this->latestRevisions()->select('id'))
                    ->selectRaw('brand_name as name, sum(total_price) as value')
                    ->groupBy('brand_name')
                    ->orderByDesc('value')
                    ->limit(6)
                    ->toBase()
                    ->get()
                    ->map(fn (object $brand) => ['name' => $brand->name, 'value' => round((float) $brand->value, 2)]),
                'salespeople' => $revisions
                    ->groupBy(fn (ProjectRevision $revision) => $revision->project->salesperson->name ?? __('Unassigned'))
                    ->map(fn ($revisions, $name) => [
                        'name' => $name,
                        'projects' => $revisions->count(),
                        'issued' => $revisions->whereNotNull('issued_at')->count(),
                        'value' => $value($revisions),
                    ])
                    ->sortByDesc('value')
                    ->take(6)
                    ->values(),
                'attention' => $open
                    ->filter(fn (ProjectRevision $revision) => in_array($revision->currentStage(), [RevisionStage::PendingApproval, RevisionStage::Rejected, RevisionStage::PriceChanged, RevisionStage::ReadyToIssue]))
                    ->sortByDesc('created_at')
                    ->take(6)
                    ->map(fn (ProjectRevision $revision) => [
                        'id' => $revision->id,
                        'project_id' => $revision->project_id,
                        'project' => $revision->project->name,
                        'client' => $revision->project->client_name,
                        'quote_number' => $revision->quoteNumber(),
                        'stage' => $revision->stage,
                        'stage_label' => $revision->stage_label,
                        'value' => round((float) $revision->getAttribute('items_sum_total_price'), 2),
                    ])
                    ->values(),
            ],
        ]);
    }

    /**
     * Each project's newest revision.
     *
     * @return Builder<ProjectRevision>
     */
    private function latestRevisions(): Builder
    {
        return ProjectRevision::query()->whereNotExists(fn ($query) => $query
            ->from('project_revisions as newer')
            ->whereColumn('newer.project_id', 'project_revisions.project_id')
            ->whereColumn('newer.number', '>', 'project_revisions.number'));
    }
}
