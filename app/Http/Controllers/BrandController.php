<?php

namespace App\Http\Controllers;

use App\Http\Requests\BrandRequest;
use App\Models\Brand;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Show the list of brands.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'tags']);

        return Inertia::render('brands/index', [
            'brands' => Brand::query()
                ->withCount(['products', 'contacts'])
                ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
                ->when($filters['tags'] ?? null, fn ($query, $tags) => $query->where(function ($query) use ($tags) {
                    foreach ((array) $tags as $tag) {
                        $query->orWhereJsonContains('tags', $tag);
                    }
                }))
                ->orderBy('name')
                ->paginate(25)
                ->withQueryString(),
            'tags' => Brand::query()->pluck('tags')->flatten()->unique()->sort()->values(),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a brand.
     */
    public function create(): Response
    {
        return Inertia::render('brands/form');
    }

    /**
     * Create a brand.
     */
    public function store(BrandRequest $request): RedirectResponse
    {
        $brand = DB::transaction(function () use ($request) {
            $brand = Brand::create($this->attributes($request));

            $this->syncContacts($brand, $request);

            return $brand;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand created.')]);

        return to_route('brands.show', $brand);
    }

    /**
     * Show the given brand with its contacts and products.
     */
    public function show(Request $request, Brand $brand): Response
    {
        $filters = $request->only(['search']);

        return Inertia::render('brands/show', [
            'brand' => $brand->load('contacts'),
            'products' => $brand->products()
                ->filter($filters)
                ->orderBy('code')
                ->paginate(50)
                ->withQueryString(),
            'currencies' => array_keys(Setting::get('exchange_rates')),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for editing the given brand.
     */
    public function edit(Brand $brand): Response
    {
        return Inertia::render('brands/form', [
            'brand' => $brand->load('contacts'),
        ]);
    }

    /**
     * Update the given brand.
     */
    public function update(BrandRequest $request, Brand $brand): RedirectResponse
    {
        DB::transaction(function () use ($request, $brand) {
            $brand->update($this->attributes($request));

            $this->syncContacts($brand, $request);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand updated.')]);

        return to_route('brands.show', $brand);
    }

    /**
     * Delete the given brand with its contacts and products.
     */
    public function destroy(Brand $brand): RedirectResponse
    {
        $brand->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand deleted.')]);

        return to_route('brands.index');
    }

    /**
     * The brand attributes from the request, including a newly uploaded logo.
     *
     * @return array<string, mixed>
     */
    private function attributes(BrandRequest $request): array
    {
        $attributes = [
            'name' => $request->validated('name'),
            'tags' => $request->validated('tags', []),
            'website' => $request->validated('website'),
            'is_partner' => $request->boolean('is_partner'),
        ];

        if ($request->hasFile('logo')) {
            $attributes['logo_path'] = $request->file('logo')?->store('brands', 'public');
        }

        return $attributes;
    }

    /**
     * Update, create and remove the brand's contacts to match the request.
     */
    private function syncContacts(Brand $brand, BrandRequest $request): void
    {
        /** @var array<int, array<string, mixed>> $contacts */
        $contacts = $request->validated('contacts', []);

        $brand->contacts()->whereNotIn('id', array_filter(Arr::pluck($contacts, 'id')))->delete();

        foreach ($contacts as $contact) {
            $brand->contacts()->updateOrCreate(
                ['id' => $contact['id'] ?? null],
                Arr::only($contact, ['name', 'phone', 'email']),
            );
        }
    }
}
