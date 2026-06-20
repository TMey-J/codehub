<?php $content = '
<div class="d-flex justify-content-between mb-3">
    <h2>Invoice #' . htmlspecialchars($invoice['invoice_number']) . '</h2>
    <div>
        <a href="/invoices/' . $invoice['id'] . '/pdf" class="btn btn-success">Download PDF</a>
        <a href="/invoices" class="btn btn-secondary">Back</a>
    </div>
</div>
<div class="card">
    <div class="card-body">
        <div class="row">
            <div class="col-md-6">
                <h5>Client</h5>
                <strong>' . htmlspecialchars($invoice['client_name']) . '</strong><br>
                ' . nl2br(htmlspecialchars($invoice['address'] ?? '')) . '<br>
                ' . htmlspecialchars($invoice['email'] ?? '') . '<br>
                ' . htmlspecialchars($invoice['phone'] ?? '') . '
            </div>
            <div class="col-md-6 text-end">
                <p><strong>Issue Date:</strong> ' . $invoice['issue_date'] . '</p>
                <p><strong>Due Date:</strong> ' . $invoice['due_date'] . '</p>
                <p><strong>Status:</strong> <span class="badge bg-' . ($invoice['status'] === 'paid' ? 'success' : ($invoice['status'] === 'overdue' ? 'danger' : 'secondary')) . '">' . ucfirst($invoice['status']) . '</span></p>
            </div>
        </div>

        <table class="table table-bordered mt-4">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-end">Qty</th>
                    <th class="text-end">Unit Price</th>
                    <th class="text-end">Total</th>
                </tr>
            </thead>
            <tbody>
                ' . (empty($items) ? '<tr><td colspan="4" class="text-center">No items.</td></tr>' : '') . '
                ' . array_reduce($items, function($html, $item) {
                    return $html . '
                    <tr>
                        <td>' . htmlspecialchars($item['description']) . '</td>
                        <td class="text-end">' . $item['quantity'] . '</td>
                        <td class="text-end">$' . number_format($item['unit_price'], 2) . '</td>
                        <td class="text-end">$' . number_format($item['total'], 2) . '</td>
                    </tr>';
                }, '') . '
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="3" class="text-end">Subtotal</th>
                    <td class="text-end">$' . number_format($totals['subtotal'], 2) . '</td>
                </tr>
                <tr>
                    <th colspan="3" class="text-end">Tax (' . $invoice['tax_rate'] . '%)</th>
                    <td class="text-end">$' . number_format($totals['tax'], 2) . '</td>
                </tr>
                <tr>
                    <th colspan="3" class="text-end">Grand Total</th>
                    <th class="text-end">$' . number_format($totals['grand_total'], 2) . '</th>
                </tr>
            </tfoot>
        </table>
    </div>
</div>
'; require __DIR__ . '/layout.php'; ?>
