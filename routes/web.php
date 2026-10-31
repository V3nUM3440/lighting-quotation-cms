<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectRevisionController;
use App\Http\Controllers\RevisionStatusController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('projects', [ProjectController::class, 'index'])->can('projects.view')->name('projects.index');
    Route::get('projects/create', [ProjectController::class, 'create'])->can('projects.create')->name('projects.create');
    Route::post('projects', [ProjectController::class, 'store'])->can('projects.create')->name('projects.store');
    Route::get('projects/{project}', [ProjectController::class, 'show'])->can('projects.view')->name('projects.show');
    Route::patch('projects/{project}', [ProjectController::class, 'update'])->can('projects.update')->name('projects.update');

    Route::scopeBindings()->group(function () {
        Route::post('projects/{project}/revisions', [ProjectRevisionController::class, 'store'])->can('revisions.create')->name('revisions.store');
        Route::get('projects/{project}/revisions/{revision}/costing-sheet', [ProjectRevisionController::class, 'costingSheet'])->can('revisions.costing-sheet')->name('revisions.costing-sheet');
        Route::get('projects/{project}/revisions/{revision}/quotation', [ProjectRevisionController::class, 'quotation'])->can('revisions.quotation')->name('revisions.quotation');
        Route::get('projects/{project}/revisions/{revision}/validation-email', [ProjectRevisionController::class, 'validationEmail'])->can('revisions.validation-email')->name('revisions.validation-email');
        Route::post('projects/{project}/revisions/{revision}/approve', [RevisionStatusController::class, 'approve'])->can('revisions.approve')->name('revisions.approve');
        Route::post('projects/{project}/revisions/{revision}/reject', [RevisionStatusController::class, 'reject'])->can('revisions.approve')->name('revisions.reject');
        Route::patch('projects/{project}/revisions/{revision}/supplier-validation', [RevisionStatusController::class, 'validateSupplier'])->can('revisions.validate')->name('revisions.supplier-validation');
        Route::post('projects/{project}/revisions/{revision}/issue', [RevisionStatusController::class, 'issue'])->name('revisions.issue');
    });

    Route::get('users', [UserController::class, 'index'])->can('users.view')->name('users.index');
    Route::post('users', [UserController::class, 'store'])->can('users.create')->name('users.store');
    Route::patch('users/{user}', [UserController::class, 'update'])->can('users.update')->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->can('users.delete')->name('users.destroy');

    Route::prefix('directory')->group(function () {
        Route::get('/', fn (Request $request) => to_route($request->user()?->can('brands.view') ? 'brands.index' : 'products.index'))->name('directory');

        Route::get('brands', [BrandController::class, 'index'])->can('brands.view')->name('brands.index');
        Route::get('brands/create', [BrandController::class, 'create'])->can('brands.create')->name('brands.create');
        Route::post('brands', [BrandController::class, 'store'])->can('brands.create')->name('brands.store');
        Route::get('brands/{brand}', [BrandController::class, 'show'])->can('brands.view')->name('brands.show');
        Route::get('brands/{brand}/edit', [BrandController::class, 'edit'])->can('brands.update')->name('brands.edit');
        Route::patch('brands/{brand}', [BrandController::class, 'update'])->can('brands.update')->name('brands.update');
        Route::delete('brands/{brand}', [BrandController::class, 'destroy'])->can('brands.delete')->name('brands.destroy');

        Route::get('products', [ProductController::class, 'index'])->can('products.view')->name('products.index');
        Route::get('products/search', [ProductController::class, 'search'])->name('products.search');
        Route::get('products/export', [ProductController::class, 'export'])->can('products.export')->name('products.export');
        Route::post('brands/{brand}/products', [ProductController::class, 'store'])->can('products.create')->name('products.store');
        Route::patch('products/{product}', [ProductController::class, 'update'])->can('products.update')->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->can('products.delete')->name('products.destroy');
        Route::get('brands/{brand}/products/template', [ProductController::class, 'template'])->can('products.export')->name('products.template');
        Route::post('brands/{brand}/products/import', [ProductController::class, 'import'])->can('products.import')->name('products.import');
    });

    Route::get('activity-logs', [ActivityLogController::class, 'index'])->can('activity-logs.view')->name('activity-logs.index');

    Route::get('roles', [RoleController::class, 'index'])->can('roles.view')->name('roles.index');
    Route::post('roles', [RoleController::class, 'store'])->can('roles.create')->name('roles.store');
    Route::patch('roles/{role}', [RoleController::class, 'update'])->can('roles.update')->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->can('roles.delete')->name('roles.destroy');
});

require __DIR__.'/settings.php';
