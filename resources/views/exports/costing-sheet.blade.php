@php
    $project = $revision->project;
    $lastRow = $firstRow + $revision->items->count() - 1;
    $totalRow = $lastRow + 2;
@endphp
<table>
    <tr><td colspan="19">COSTING SHEET</td></tr>
    <tr><td>PROJECT NAME:</td><td colspan="3">{{ $project->name }}</td></tr>
    <tr><td>QUOTATION TO:</td><td colspan="3">{{ $project->client_name }}</td></tr>
    <tr><td>REFERENCE NUMBER:</td><td colspan="3">{{ $revision->quoteNumber() }}</td></tr>
    <tr><td>DATE:</td><td colspan="3">{{ $revision->created_at->format('m-d-y') }}</td></tr>
    <tr><td></td></tr>
    <tr>
        <td colspan="20"></td>
        <td colspan="2">NEGOTIATION SUPPORT</td>
    </tr>
    <tr>
        <td>SNO.</td>
        <td>REFERENCE</td>
        <td>DESCRIPTION</td>
        <td>MAKE</td>
        <td>QTY</td>
        <td>UOM</td>
        <td>CURRENCY</td>
        <td>MANUFACTURE PRICE</td>
        <td>DISCOUNT %</td>
        <td>FREIGHT %</td>
        <td>CUSTOMS %</td>
        <td>EXCHANGE RATE</td>
        <td>UNIT COST</td>
        <td>ACCESSORIES</td>
        <td>TOTAL UNIT COST</td>
        <td>MARGIN</td>
        <td>UNIT PRICE</td>
        <td>TOTAL COST</td>
        <td>TOTAL PRICE</td>
        <td></td>
        <td>TARGET</td>
        <td>MARGIN</td>
    </tr>
    @foreach ($revision->items as $item)
        @php
            $row = $firstRow + $loop->index;
            $description = collect([$item->product_name, $item->description])
                ->merge(collect($item->specs ?? [])->map(fn ($value, $label) => "{$label}: {$value}"))
                ->filter()
                ->implode("\n");
        @endphp
        <tr>
            <td>{{ $loop->iteration }}</td>
            <td>{{ $item->product_code }}</td>
            <td>{!! nl2br(e($description)) !!}</td>
            <td>{{ $item->brand_name }}</td>
            <td>{{ (float) $item->quantity }}</td>
            <td>{{ $item->uom }}</td>
            <td>{{ $item->currency }}</td>
            <td>{{ $item->manufacturer_price }}</td>
            <td>{{ (float) $item->discount }}</td>
            <td>{{ (float) $item->freight }}</td>
            <td>{{ (float) $item->customs }}</td>
            <td>{{ (float) $item->exchange_rate }}</td>
            <td>=ROUND(H{{ $row }}*(1-(I{{ $row }}/100))*(1+(J{{ $row }}/100))*(1+(K{{ $row }}/100))*L{{ $row }},2)</td>
            <td>{{ $item->accessories }}</td>
            <td>=ROUND(M{{ $row }}+N{{ $row }},2)</td>
            <td>{{ (float) $item->margin }}</td>
            <td>=ROUND(O{{ $row }}/(1-P{{ $row }}/100),2)</td>
            <td>=ROUND(O{{ $row }}*E{{ $row }},2)</td>
            <td>=ROUND(Q{{ $row }}*E{{ $row }},2)</td>
            <td></td>
            <td>{{ $item->target_price }}</td>
            <td>{{ $item->target_price ? "=-((O{$row}/U{$row})-1)*100" : '' }}</td>
        </tr>
    @endforeach
    <tr><td></td></tr>
    <tr>
        <td colspan="16"></td>
        <td>TOTAL</td>
        <td>=SUM(R{{ $firstRow }}:R{{ $lastRow }})</td>
        <td>=SUM(S{{ $firstRow }}:S{{ $lastRow }})</td>
    </tr>
    <tr>
        <td colspan="16"></td>
        <td>VAT {{ (float) $revision->vat_rate }}%</td>
        <td></td>
        <td>=ROUND(S{{ $totalRow }}*{{ (float) $revision->vat_rate }}/100,2)</td>
    </tr>
    <tr>
        <td colspan="16"></td>
        <td>GROSS TOTAL</td>
        <td></td>
        <td>=S{{ $totalRow }}+S{{ $totalRow + 1 }}</td>
    </tr>
</table>
