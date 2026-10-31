<?php

namespace App\Http\Controllers;

use App\Enums\RevisionStage;
use App\Http\Requests\ProjectRequest;
use App\Models\Project;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Show the list of projects.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'salespeople', 'stages']);

        return Inertia::render('projects/index', [
            'projects' => Project::query()
                ->with(['salesperson:id,name', 'latestRevision'])
                ->withCount('revisions')
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->whereAny(['name', 'client_name'], 'like', "%{$search}%"))
                ->when($filters['salespeople'] ?? null, fn ($query, $salespeople) => $query->whereIn('salesperson_id', (array) $salespeople))
                ->when($filters['stages'] ?? null, fn ($query, $stages) => $query->whereHas('latestRevision', fn ($query) => $query->where(function ($query) use ($stages) {
                    foreach (array_filter(array_map(RevisionStage::tryFrom(...), (array) $stages)) as $stage) {
                        $query->orWhere(fn ($query) => $stage->apply($query));
                    }
                })))
                ->latest('inquiry_received_at')
                ->latest('id')
                ->paginate(25)
                ->withQueryString(),
            'users' => $this->users(),
            'stages' => collect(RevisionStage::cases())->map(fn (RevisionStage $stage) => ['id' => $stage->value, 'name' => $stage->label()]),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a project.
     */
    public function create(): Response
    {
        return Inertia::render('projects/create', [
            'users' => $this->users(),
            'defaults' => $this->revisionDefaults(),
        ]);
    }

    /**
     * Create a project with its initial revisions.
     */
    public function store(ProjectRequest $request): RedirectResponse
    {
        $project = DB::transaction(function () use ($request) {
            $project = Project::create($request->safe()->except('revisions'));

            foreach ($request->validated('revisions') as $revision) {
                $project->addRevision($revision, $request->user());
            }

            return $project;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Project created.')]);

        return to_route('projects.show', $project);
    }

    /**
     * Show the given project with its revisions.
     */
    public function show(Project $project): Response
    {
        return Inertia::render('projects/show', [
            'project' => $project->load([
                'salesperson:id,name',
                'revisions' => fn ($query) => $query->orderByDesc('number'),
                'revisions.preparedBy:id,name',
                'revisions.approvedBy:id,name',
                'revisions.issuedBy:id,name',
                'revisions.events' => fn ($query) => $query->with('user:id,name')->latest('id'),
                'revisions.items' => fn ($query) => $query->orderBy('id'),
            ]),
            'users' => $this->users(),
            'defaults' => $this->revisionDefaults(),
        ]);
    }

    /**
     * Update the project's general information.
     */
    public function update(ProjectRequest $request, Project $project): RedirectResponse
    {
        $project->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Project updated.')]);

        return back();
    }

    /**
     * The values new revisions and their lines start with.
     *
     * @return array<string, mixed>
     */
    private function revisionDefaults(): array
    {
        return [
            'vatRate' => Setting::get('vat_rate'),
            'marginFloor' => Setting::get('margin_floor'),
            'exchangeRates' => Setting::get('exchange_rates'),
            ...Setting::get('defaults'),
        ];
    }

    /**
     * The users that can be assigned as salesperson.
     *
     * @return Collection<int, User>
     */
    private function users(): Collection
    {
        return User::query()->orderBy('name')->get(['id', 'name']);
    }
}
