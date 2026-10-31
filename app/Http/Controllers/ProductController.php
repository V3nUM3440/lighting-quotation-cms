<?php

namespace App\Http\Controllers;

use App\Exports\ProductsExport;
use App\Exports\ProductsTemplateExport;
use App\Http\Requests\ProductRequest;
use App\Imports\ProductsImport;
use App\Models\ActivityLog;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Validators\Failure;
use Maatwebsite\Excel\Validators\ValidationException as SpreadsheetValidationException;
use PhpOffice\PhpSpreadsheet\Exception as SpreadsheetException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProductController extends Controller
{
    /**
     * Show the list of all products.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'brands']);

        return Inertia::render('products/index', [
            'products' => Product::query()
                ->with('brand:id,name')
                ->filter($filters)
                ->orderBy(Brand::select('name')->whereColumn('brands.id', 'products.brand_id'))
                ->orderBy('code')
                ->paginate(50)
                ->withQueryString(),
            'brands' => Brand::query()->orderBy('name')->get(['id', 'name']),
            'filters' => $filters,
        ]);
    }

    /**
     * Search products across all brands for picking revision line items.
     */
    public function search(Request $request): JsonResponse
    {
        abort_unless($request->user()?->canAny(['projects.create', 'revisions.create']), 403);

        $search = $request->string('search')->toString();

        return response()->json(
            Product::query()
                ->with('brand:id,name')
                ->when($search, fn ($query) => $query->where(fn ($query) => $query
                    ->whereAny(['code', 'name', 'description'], 'like', "%{$search}%")
                    ->orWhereRelation('brand', 'name', 'like', "%{$search}%")))
                ->orderBy(Brand::select('name')->whereColumn('brands.id', 'products.brand_id'))
                ->orderBy('code')
                ->paginate(10)
                ->withQueryString(),
        );
    }

    /**
     * Download the products matching the list filters as a spreadsheet.
     */
    public function export(Request $request): BinaryFileResponse
    {
        ActivityLog::record('downloaded', 'Exported the products list', properties: ['new' => $request->only(['search', 'brands'])]);

        return (new ProductsExport($request->only(['search', 'brands'])))->download('products.xlsx');
    }

    /**
     * Create a product for the given brand.
     */
    public function store(ProductRequest $request, Brand $brand): RedirectResponse
    {
        $brand->products()->create($this->attributes($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product created.')]);

        return back();
    }

    /**
     * Update the given product.
     */
    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($this->attributes($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product updated.')]);

        return back();
    }

    /**
     * Delete the given product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product deleted.')]);

        return back();
    }

    /**
     * The product attributes from the request, including a newly uploaded image.
     *
     * @return array<string, mixed>
     */
    private function attributes(ProductRequest $request): array
    {
        $attributes = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $attributes['image_path'] = $request->file('image')?->store('products', 'public');
        }

        return $attributes;
    }

    /**
     * Download the products spreadsheet template, pre-filled with the brand's products.
     */
    public function template(Brand $brand): BinaryFileResponse
    {
        ActivityLog::record('downloaded', "Downloaded the products template of brand {$brand->name}", $brand);

        return (new ProductsTemplateExport($brand))->download(Str::slug($brand->name).'-products.xlsx');
    }

    /**
     * Create or update the brand's products from an uploaded spreadsheet.
     */
    public function import(Request $request, Brand $brand): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx', 'max:10240'],
        ]);

        try {
            (new ProductsImport($brand))->import($request->file('file'));
        } catch (SpreadsheetValidationException $e) {
            throw ValidationException::withMessages([
                'file' => collect($e->failures())
                    ->take(20)
                    ->map(fn (Failure $failure) => __('Row :row: :error', [
                        'row' => $failure->row(),
                        'error' => $failure->errors()[0] ?? '',
                    ]))
                    ->implode("\n"),
            ]);
        } catch (SpreadsheetException) {
            throw ValidationException::withMessages([
                'file' => __('The file could not be read. Upload the products template saved as an Excel (.xlsx) file.'),
            ]);
        }

        ActivityLog::record('imported', "Imported products for brand {$brand->name}", $brand, ['new' => ['file' => $request->file('file')?->getClientOriginalName()]]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Products imported.')]);

        return back();
    }
}
