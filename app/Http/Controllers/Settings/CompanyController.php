<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\CompanySettingsRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    private const IMAGES = ['logo', 'stamp', 'signature'];

    /**
     * Show the company settings page.
     */
    public function edit(): Response
    {
        /** @var array<string, mixed> $company */
        $company = Setting::get('company');

        foreach (self::IMAGES as $image) {
            $path = $company["{$image}_path"] ?? null;
            $company["{$image}_url"] = $path ? Storage::disk('public')->url($path) : null;
        }

        $company['logo_url'] ??= asset('images/logo.png');

        /** @var array<string, float> $rates */
        $rates = Setting::get('exchange_rates');

        return Inertia::render('settings/company', [
            'settings' => [
                'company' => $company,
                'currency' => Setting::get('currency'),
                'vat_rate' => Setting::get('vat_rate'),
                'margin_floor' => Setting::get('margin_floor'),
                'exchange_rates' => collect($rates)
                    ->map(fn ($rate, $code) => ['code' => $code, 'rate' => $rate])
                    ->values(),
                'defaults' => Setting::get('defaults'),
            ],
        ]);
    }

    /**
     * Save the company settings.
     */
    public function update(CompanySettingsRequest $request): RedirectResponse
    {
        /** @var array<string, mixed> $company */
        $company = [...Setting::get('company'), ...$request->validated('company')];

        foreach (self::IMAGES as $image) {
            if ($request->hasFile($image)) {
                $company["{$image}_path"] = $request->file($image)?->store('company', 'public');
            }
        }

        /** @var array<int, array{code: string, rate: string}> $rates */
        $rates = $request->validated('exchange_rates');

        Setting::store([
            'company' => $company,
            'currency' => $request->validated('currency'),
            'vat_rate' => (float) $request->validated('vat_rate'),
            'margin_floor' => (float) $request->validated('margin_floor'),
            'exchange_rates' => collect($rates)->mapWithKeys(fn (array $rate) => [$rate['code'] => (float) $rate['rate']])->all(),
            'defaults' => [
                ...$request->validated('defaults'),
                'freight' => (float) $request->validated('defaults.freight'),
                'customs' => (float) $request->validated('defaults.customs'),
                'validity_days' => (int) $request->validated('defaults.validity_days'),
            ],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Company settings saved.')]);

        return to_route('company.edit');
    }
}
