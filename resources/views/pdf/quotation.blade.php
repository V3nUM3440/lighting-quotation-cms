@php
    $project = $revision->project;
    $company = App\Models\Setting::get('company');
    $currency = App\Models\Setting::get('currency');
    $items = $revision->items;
    $total = (float) $items->sum('total_price');
    $vat = round($total * (float) $revision->vat_rate / 100, 2);
    $gross = $total + $vat;
    $money = fn ($value) => number_format((float) $value, 2);
    $quantity = fn ($value) => rtrim(rtrim(number_format((float) $value, 2), '0'), '.');
    $spellout = new NumberFormatter('en', NumberFormatter::SPELLOUT);
    $words = ucwords(str_replace('-', ' ', $spellout->format((int) floor($gross))));
    $fils = (int) round(($gross - floor($gross)) * 100);
    $image = fn (?string $path) => $path && Storage::disk('public')->exists($path) ? Storage::disk('public')->path($path) : null;
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $revision->quoteNumber() }}</title>
    <style>
        @page { margin: 48px 36px 44px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 9px; color: #111; }
        .page-header { position: fixed; top: -32px; left: 0; right: 0; text-align: center; font-size: 8px; }
        .draft { color: #c00000; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        .frame { border: 1px solid #000; }
        .navy { color: #1f3864; }
        .red { color: #c00000; }
        .company td { vertical-align: top; padding: 6px; }
        .company .name { font-size: 14px; font-weight: bold; }
        .logo { max-height: 48px; max-width: 220px; }
        .band { background: #8db3e2; text-align: center; font-weight: bold; font-size: 11px; padding: 4px; }
        .details td { padding: 3px 6px; vertical-align: top; }
        .details .label { width: 72px; font-weight: bold; }
        .details .boxed { border: 1px solid #000; }
        .intro { padding: 8px 6px; font-weight: bold; }
        .items th { border: 1px solid #000; padding: 6px 4px; text-align: center; font-weight: bold; }
        .items td { border: 1px solid #000; padding: 6px 4px; vertical-align: middle; text-align: center; }
        .items td.description { text-align: left; vertical-align: top; }
        .items img { max-width: 90px; max-height: 70px; }
        .totals td { border: 1px solid #000; padding: 5px 6px; text-align: right; }
        .totals .label { font-weight: bold; }
        .words td { border: 1px solid #000; padding: 6px; font-weight: bold; }
        .section { border: 1px solid #000; border-top: 0; padding: 6px; }
        .section h3 { margin: 0 0 4px; font-size: 10px; text-decoration: underline; }
        .section ul { margin: 2px 0; padding-left: 14px; }
        .section p { margin: 2px 0; }
        .section li p { margin: 0; }
        .payment { font-weight: bold; text-decoration: underline; }
        .signatures th { border: 1px solid #000; border-bottom: 0; padding: 6px; text-align: center; width: 33%; }
        .signatures td { border: 1px solid #000; border-top: 0; padding: 6px; height: 70px; vertical-align: middle; text-align: center; }
        .signature { height: 55px; }
        .partners td { text-align: center; vertical-align: middle; padding: 6px; }
        .partners img { max-height: 40px; max-width: 130px; }
        .partners .title { color: #e36c09; font-weight: bold; font-size: 11px; }
    </style>
</head>
<body>
    <div class="page-header">{{ $revision->quoteNumber() }}@if (! $revision->issued_at) &nbsp;<span class="draft">DRAFT</span>@endif</div>

    <table class="frame company">
        <tr>
            <td>
                <div class="name navy">{{ $company['name'] }}</div>
                <div class="navy">{{ $company['address'] }}</div>
                <div class="navy">Tel: {{ $company['phone'] }}</div>
                <div class="navy">Email: {{ $company['email'] }}</div>
                <div class="navy">Web: {{ $company['website'] }}</div>
            </td>
            <td style="text-align: right;">
                <img class="logo" src="{{ $image($company['logo_path']) ?? public_path('images/logo.png') }}" alt="{{ $company['name'] }}">
            </td>
        </tr>
    </table>

    <table class="frame">
        <tr><td class="band navy">{{ $revision->issued_at ? 'QUOTATION' : 'QUOTATION (DRAFT)' }}</td></tr>
    </table>

    <table class="frame details">
        <tr>
            <td class="label">Client :</td>
            <td><strong>{{ $project->client_name }}</strong><br>{{ $project->client_address }}</td>
            <td class="label">Quote No</td>
            <td>{{ $revision->quoteNumber() }}</td>
        </tr>
        <tr>
            <td class="label">Tel:</td>
            <td>{{ $project->client_phone }}</td>
            <td class="label">Quote Date</td>
            <td class="boxed">{{ ($revision->issued_at ?? $revision->created_at)->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td class="label">Mob:</td>
            <td>{{ $project->client_mobile }}</td>
            <td class="label">Contact</td>
            <td class="boxed">{{ $project->salesperson?->name }}</td>
        </tr>
        <tr>
            <td class="label">Attn &amp; CC</td>
            <td>{{ $project->attention }}</td>
            <td class="label">Mobile No.</td>
            <td class="boxed">{{ $project->salesperson?->phone }}</td>
        </tr>
        <tr>
            <td class="label">Ref No.:</td>
            <td>{{ $project->client_reference }}@if ($project->client_email) &nbsp; E-Mail: {{ $project->client_email }}@endif</td>
            <td class="label">E-mail:</td>
            <td>{{ $project->salesperson?->email }}</td>
        </tr>
        <tr>
            <td class="label">Project :</td>
            <td class="red">{{ $project->name }}</td>
            <td class="label">Validity</td>
            <td>{{ $revision->validity_days }} Days Only</td>
        </tr>
        <tr>
            <td colspan="4" class="intro">We are pleased to submit our lowest price for the following items</td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th style="width: 6%;">SL NO.</th>
                <th style="width: 9%;">Type</th>
                <th style="width: 10%;">Brand</th>
                <th>Product description</th>
                <th style="width: 15%;">Images</th>
                <th style="width: 8%;">QTY/Pcs MTS</th>
                <th style="width: 9%;">Rate</th>
                <th style="width: 12%;">Value {{ $currency }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($items as $item)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ $item->type }}</td>
                    <td>{{ $item->brand_name }}</td>
                    <td class="description">
                        <strong>{{ $item->product_name }}</strong>
                        @foreach (collect(preg_split('/\R/', (string) $item->description))->merge(collect($item->specs ?? [])->map(fn ($value, $label) => "{$label}: {$value}"))->filter() as $line)
                            <br>{{ $line }}
                        @endforeach
                    </td>
                    <td>
                        @if ($path = $image($item->image_path))
                            <img src="{{ $path }}" alt="">
                        @endif
                    </td>
                    <td>{{ $quantity($item->quantity) }}<br><span style="font-size: 7px;">{{ $item->uom }}</span></td>
                    <td>{{ $money($item->unit_price) }}</td>
                    <td>{{ $money($item->total_price) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr><td class="label navy">Total</td><td style="width: 18%;">{{ $currency }} {{ $money($total) }}</td></tr>
        <tr><td class="label navy">Vat {{ (float) $revision->vat_rate }}%</td><td>{{ $currency }} {{ $money($vat) }}</td></tr>
        <tr><td class="label navy">GROSS TOTAL</td><td><strong>{{ $currency }} {{ $money($gross) }}</strong></td></tr>
    </table>

    <table class="words">
        <tr>
            <td class="navy" style="width: 28%;">AMOUNT IN WORDS({{ $currency }})</td>
            <td class="navy">{{ $words }} {{ sprintf('%02d', $fils) }}/100 Only</td>
        </tr>
    </table>

    @if ($revision->terms)
        <div class="section">
            <h3 class="navy">Terms and Conditions</h3>
            {!! $revision->terms !!}
        </div>
    @endif

    @if ($revision->payment_terms)
        <div class="section">
            <p class="payment navy">Payment Terms: {{ $revision->payment_terms }}</p>
        </div>
    @endif

    <table class="signatures" style="page-break-inside: avoid;">
        <tr>
            <th>Buyer Signature</th>
            <th>Prepared by</th>
            <th>Authorized Signature</th>
        </tr>
        <tr>
            <td></td>
            <td>{{ $revision->preparedBy?->name }}</td>
            <td>
                @if ($stamp = $image($company['stamp_path']))
                    <img class="signature" src="{{ $stamp }}" alt="">
                @endif
                @if ($signature = $image($company['signature_path']))
                    <img class="signature" src="{{ $signature }}" alt="">
                @endif
            </td>
        </tr>
    </table>

    @if ($partners->isNotEmpty())
        <table class="frame partners" style="page-break-inside: avoid;">
            <tr><td colspan="{{ $partners->count() }}" class="title">" Our Excellence Partners "</td></tr>
            <tr>
                @foreach ($partners as $partner)
                    <td>
                        @if ($path = $image($partner->logo_path))
                            <img src="{{ $path }}" alt="{{ $partner->name }}"><br>
                        @else
                            <strong>{{ $partner->name }}</strong><br>
                        @endif
                        <span class="navy">{{ $partner->website }}</span>
                    </td>
                @endforeach
            </tr>
        </table>
    @endif
</body>
</html>
