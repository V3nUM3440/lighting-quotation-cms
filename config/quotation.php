<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Company
    |--------------------------------------------------------------------------
    |
    | The company details printed in the quotation header. Every value in this
    | file is a default: admins change them under Settings -> Company, which
    | saves them to the `settings` table (see App\Models\Setting).
    |
    */

    'company' => [
        'name' => 'Rura Lighting FZE',
        'address' => 'Sharjah, U.A.E',
        'phone' => '',
        'email' => 'info@ruralighting.com',
        'website' => 'www.ruralighting.com',
        'logo_path' => null,
        'stamp_path' => null,
        'signature_path' => null,
    ],

    /*
    |--------------------------------------------------------------------------
    | Currency, VAT and Exchange Rates
    |--------------------------------------------------------------------------
    |
    | Quotations are priced in the company currency. Manufacturer prices in
    | other currencies are converted with these rates (1 unit = rate in the
    | company currency). Each revision line stores the rate it was priced at.
    |
    */

    'currency' => env('CURRENCY', 'AED'),

    'vat_rate' => (float) env('VAT_RATE', 5),

    /*
    | Revisions whose overall margin (total profit / total price) is below this
    | percentage need approval before their quotation can be issued.
    */

    'margin_floor' => 20,

    'exchange_rates' => [
        'AED' => 1,
        'USD' => 3.7,
        'EUR' => 4.3,
        'GBP' => 5.0,
    ],

    /*
    |--------------------------------------------------------------------------
    | Revision Defaults
    |--------------------------------------------------------------------------
    |
    | The values new revision lines and new revisions start with. They can be
    | changed per line or per revision before it is saved.
    |
    */

    'defaults' => [
        'freight' => 15,
        'customs' => 5,
        'validity_days' => 15,
        'payment_terms' => '50% advance along with PO, 50% upon materials delivery.',
        'terms' => '<ul>'
            .'<li><p>This offer is based on the bill of quantities and the specifications received, changes in either may result in a revised offer.</p></li>'
            .'<li><p>Any spare parts or extra items have to be clearly mentioned in the bill of quantities or else will not be considered, even if it is indicated in the consultant specifications.</p></li>'
            .'<li><p>All fixtures are rated for 220-240V/50Hz operation, unless otherwise stated.</p></li>'
            .'<li><p>No additional accessories are included in the above quoted rates other than proposed.</p></li>'
            .'<li><p>Any samples provided will be deducted from the total ordered quantity or invoiced separately.</p></li>'
            .'<li><p>Technical submittal and samples can be arranged on receipt of letter of intent.</p></li>'
            .'<li><p>Warranty is 5 years for light fittings unless stated otherwise.</p></li>'
            .'<li><p>Country of origin:</p></li>'
            .'<li><p>Any municipality approval and charges should be in the scope of the customer.</p></li>'
            .'<li><p>Rura Lighting FZE is not responsible for cradle/rope access/scaffolding.</p></li>'
            .'<li><p>Scope of conduits and wiring belongs to the customer.</p></li>'
            .'<li><p>PO (sea freight or local production) cancellation after 10 days (air freight 6 days) will be charged 20% of the proforma invoice or quotation value.</p></li>'
            .'</ul>'
            .'<p><strong><u>Special note:</u></strong> This estimated MOQ is based on the provided 3D visuals and electrical drawings. Final quantities and materials will be adjusted based on actual size, measurements and execution.</p>'
            .'<p><strong><u>Terms of delivery:</u></strong></p>'
            .'<ul>'
            .'<li><p>Delivery items are available within 15-18 days from the date of official order confirmation along with PO and advance payment.</p></li>'
            .'<li><p>This offer is based on sea freight basis, in case you wish to change to air freight/courier basis, all charges will be handled by your side as per actual.</p></li>'
            .'<li><p>Prices are ex-works Dubai.</p></li>'
            .'</ul>',
    ],

];
