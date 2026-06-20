<?php namespace App;

use Dompdf\Dompdf;
use Dompdf\Options;

class InvoicePDF {
    public static function generate($invoiceId) {
        $invoice = Invoice::find($invoiceId);
        if (!$invoice) throw new \Exception('Invoice not found');
        $items = Invoice::items($invoiceId);
        $totals = Invoice::total($invoiceId);

        // Build HTML content
        $html = '<!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Invoice ' . $invoice['invoice_number'] . '</title>
        <style>
            body { font-family: DejaVu Sans, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #333; }
            .client-info { margin-bottom: 30px; }
            .client-info strong { display: block; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f8f9fa; text-align: left; padding: 8px; border-bottom: 2px solid #dee2e6; }
            td { padding: 8px; border-bottom: 1px solid #dee2e6; }
            .text-right { text-align: right; }
            .totals { margin-top: 20px; text-align: right; }
            .totals div { padding: 4px 0; }
            .grand-total { font-size: 1.2em; font-weight: bold; border-top: 2px solid #333; padding-top: 8px; }
            .footer { margin-top: 50px; font-size: 0.9em; color: #666; text-align: center; }
        </style>
        </head><body>
        <div class="header">
            <h1>INVOICE</h1>
            <p>' . $invoice['invoice_number'] . '</p>
        </div>
        <div class="client-info">
            <strong>' . htmlspecialchars($invoice['client_name']) . '</strong>
            ' . nl2br(htmlspecialchars($invoice['address'] ?? '')) . '<br>
            ' . htmlspecialchars($invoice['email'] ?? '') . '<br>
            ' . htmlspecialchars($invoice['phone'] ?? '') . '
        </div>
        <div>
            <strong>Issue Date:</strong> ' . $invoice['issue_date'] . '<br>
            <strong>Due Date:</strong> ' . $invoice['due_date'] . '<br>
            <strong>Status:</strong> ' . ucfirst($invoice['status']) . '
        </div>
        <table>
            <thead><tr><th>Description</th><th class="text-right">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Total</th></tr></thead>
            <tbody>';
        foreach ($items as $item) {
            $html .= '<tr>
                <td>' . htmlspecialchars($item['description']) . '</td>
                <td class="text-right">' . $item['quantity'] . '</td>
                <td class="text-right">$' . number_format($item['unit_price'], 2) . '</td>
                <td class="text-right">$' . number_format($item['total'], 2) . '</td>
            </tr>';
        }
        $html .= '</tbody></table>
        <div class="totals">
            <div>Subtotal: $' . number_format($totals['subtotal'], 2) . '</div>
            <div>Tax (' . $invoice['tax_rate'] . '%): $' . number_format($totals['tax'], 2) . '</div>
            <div class="grand-total">Grand Total: $' . number_format($totals['grand_total'], 2) . '</div>
        </div>
        <div class="footer">Thank you for your business.</div>
        </body></html>';

        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        return $dompdf->output();
    }
}
