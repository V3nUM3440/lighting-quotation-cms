<?php

namespace App\Exports;

use App\Models\ProjectRevision;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CostingSheetExport implements FromView, WithColumnFormatting, WithColumnWidths, WithStyles, WithTitle
{
    use Exportable;

    public const FIRST_ITEM_ROW = 9;

    public function __construct(private ProjectRevision $revision) {}

    public function view(): View
    {
        return view('exports.costing-sheet', [
            'revision' => $this->revision->load(['project', 'items' => fn ($query) => $query->orderBy('id')]),
            'firstRow' => self::FIRST_ITEM_ROW,
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function columnFormats(): array
    {
        $money = '#,##0.00';

        return [
            'E' => '#,##0.##',
            'H' => $money,
            'I' => '0.00',
            'J' => '0.00',
            'K' => '0.00',
            'L' => '0.0000',
            'M' => $money,
            'N' => $money,
            'O' => $money,
            'P' => '0.00',
            'Q' => $money,
            'R' => $money,
            'S' => $money,
            'U' => $money,
            'V' => '0.00',
        ];
    }

    /**
     * @return array<string, int>
     */
    public function columnWidths(): array
    {
        return [
            'A' => 22, 'B' => 22, 'C' => 48, 'D' => 14, 'E' => 8, 'F' => 8, 'G' => 10,
            'H' => 14, 'I' => 11, 'J' => 11, 'K' => 11, 'L' => 10, 'M' => 13, 'N' => 13,
            'O' => 15, 'P' => 10, 'Q' => 14, 'R' => 15, 'S' => 15, 'T' => 3, 'U' => 13, 'V' => 10,
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        $lastRow = self::FIRST_ITEM_ROW + max($this->revision->items->count(), 1) - 1;
        $input = ['fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFF00']]];

        return [
            'A1' => ['font' => ['bold' => true, 'size' => 14]],
            'A2:A5' => ['font' => ['bold' => true]],
            'U7' => ['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'A8:V8' => ['font' => ['bold' => true], 'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER]],
            'C'.self::FIRST_ITEM_ROW.":C{$lastRow}" => ['alignment' => ['wrapText' => true]],
            'A'.self::FIRST_ITEM_ROW.":V{$lastRow}" => ['alignment' => ['vertical' => Alignment::VERTICAL_TOP]],
            'H'.self::FIRST_ITEM_ROW.":H{$lastRow}" => $input,
            'P'.self::FIRST_ITEM_ROW.":P{$lastRow}" => $input,
        ];
    }

    public function title(): string
    {
        return "R{$this->revision->number}";
    }
}
