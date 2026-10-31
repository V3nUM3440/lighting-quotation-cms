<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Show the activity log.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'users', 'actions', 'subjects', 'from', 'to']);

        return Inertia::render('activity-logs/index', [
            'logs' => ActivityLog::query()
                ->with('user:id,name')
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->whereAny(['description', 'ip_address'], 'like', "%{$search}%"))
                ->when($filters['users'] ?? null, fn ($query, $users) => $query->whereIn('user_id', (array) $users))
                ->when($filters['actions'] ?? null, fn ($query, $actions) => $query->whereIn('action', (array) $actions))
                ->when($filters['subjects'] ?? null, fn ($query, $subjects) => $query->whereIn('subject_type', (array) $subjects))
                ->when($filters['from'] ?? null, fn ($query, $from) => $query->whereDate('created_at', '>=', $from))
                ->when($filters['to'] ?? null, fn ($query, $to) => $query->whereDate('created_at', '<=', $to))
                ->latest('id')
                ->paginate(50)
                ->withQueryString(),
            'users' => User::query()->orderBy('name')->get(['id', 'name']),
            'actions' => $this->options('action'),
            'subjects' => $this->options('subject_type'),
            'filters' => $filters,
        ]);
    }

    /**
     * The logged values of a column as filter options.
     *
     * @return array<int, array{id: string, name: string}>
     */
    private function options(string $column): array
    {
        return ActivityLog::query()
            ->whereNotNull($column)
            ->distinct()
            ->orderBy($column)
            ->pluck($column)
            ->map(fn (string $value) => ['id' => $value, 'name' => Str::headline($value)])
            ->all();
    }
}
