<?php 
$isEdit = isset($invoice);
$action = $isEdit ? '/invoices/' . $invoice['id'] : '/invoices';
$clientId = $isEdit ? $invoice['client_id'] : '';
$issue = $isEdit ? $invoice['issue_date'] : date('Y-m-d');
$due = $isEdit ? $invoice['due_date'] : date('Y-m-d', strtotime('+30 days'));
$tax = $isEdit ? $invoice['tax_rate'] : TAX_RATE_DEFAULT;
$status = $isEdit ? $invoice['status'] : 'draft';
$items = $isEdit ? \App\Invoice::items($invoice['id']) : [];
$clients = \App\Client::all();

$content = '
<div class="row justify-content-center">
    <div class="col-md-10">
        <h2>' . ($isEdit ? 'Edit' : 'New') . ' Invoice</h2>
        <form method="POST" action="' . $action . '" id="invoiceForm">
            <input type="hidden" name="csrf" value="' . csrf_token() . '">
            <div class="row">
                <div class="col-md-4 mb-3">
                    <label>Client *</label>
                    <select name="client_id" class="form-select" required>
                        <option value="">Select</option>
                        ' . array_reduce($clients, function($html, $c) use ($clientId) {
                            return $html . '<option value="' . $c['id'] . '" ' . ($clientId == $c['id'] ? 'selected' : '') . '>' . htmlspecialchars($c['name']) . '</option>';
                        }, '') . '
                    </select>
                </div>
                <div class="col-md-2 mb-3">
                    <label>Issue Date</label>
                    <input type="date" name="issue_date" value="' . $issue . '" class="form-control" required>
                </div>
                <div class="col-md-2 mb-3">
                    <label>Due Date</label>
                    <input type="date" name="due_date" value="' . $due . '" class="form-control" required>
                </div>
                <div class="col-md-2 mb-3">
                    <label>Tax Rate (%)</label>
                    <input type="number" step="0.01" name="tax_rate" value="' . $tax . '" class="form-control">
                </div>
                <div class="col-md-2 mb-3">
                    <label>Status</label>
                    <select name="status" class="form-select">
                        <option value="draft" ' . ($status === 'draft' ? 'selected' : '') . '>Draft</option>
                        <option value="sent" ' . ($status === 'sent' ? 'selected' : '') . '>Sent</option>
                        <option value="paid" ' . ($status === 'paid' ? 'selected' : '') . '>Paid</option>
                        <option value="overdue" ' . ($status === 'overdue' ? 'selected' : '') . '>Overdue</option>
                    </select>
                </div>
            </div>

            <h4 class="mt-4">Line Items</h4>
            <table class="table" id="itemsTable">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="width:80px">Qty</th>
                        <th style="width:120px">Unit Price</th>
                        <th style="width:120px">Total</th>
                        <th style="width:50px"></th>
                    </tr>
                </thead>
                <tbody id="itemsBody">
                    ' . (empty($items) ? '
                    <tr>
                        <td><input name="description[]" class="form-control" placeholder="Description"></td>
                        <td><input name="quantity[]" type="number" class="form-control qty" value="1" min="1"></td>
                        <td><input name="unit_price[]" type="number" step="0.01" class="form-control price" value="0.00"></td>
                        <td><span class="item-total">0.00</span></td>
                        <td><button type="button" class="btn btn-sm btn-danger remove-item">×</button></td>
                    </tr>
                    ' : '') . '
                    ' . array_reduce($items, function($html, $item) {
                        return $html . '
                        <tr>
                            <td><input name="description[]" class="form-control" placeholder="Description" value="' . htmlspecialchars($item['description']) . '"></td>
                            <td><input name="quantity[]" type="number" class="form-control qty" value="' . $item['quantity'] . '" min="1"></td>
                            <td><input name="unit_price[]" type="number" step="0.01" class="form-control price" value="' . $item['unit_price'] . '"></td>
                            <td><span class="item-total">' . number_format($item['total'], 2) . '</span></td>
                            <td><button type="button" class="btn btn-sm btn-danger remove-item">×</button></td>
                        </tr>';
                    }, '') . '
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5">
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="addItem">+ Add Item</button>
                        </td>
                    </tr>
                </tfoot>
            </table>

            <button class="btn btn-primary">Save Invoice</button>
            <a href="/invoices" class="btn btn-secondary">Cancel</a>
        </form>
    </div>
</div>

<script>
document.addEventListener(\'DOMContentLoaded\', function() {
    function updateRowTotal(row) {
        const qty = parseFloat(row.querySelector(\'.qty\').value) || 0;
        const price = parseFloat(row.querySelector(\'.price\').value) || 0;
        const total = qty * price;
        row.querySelector(\'.item-total\').textContent = total.toFixed(2);
    }

    document.getElementById(\'addItem\').addEventListener(\'click\', function() {
        const tbody = document.getElementById(\'itemsBody\');
        const row = document.createElement(\'tr\');
        row.innerHTML = `
            <td><input name="description[]" class="form-control" placeholder="Description"></td>
            <td><input name="quantity[]" type="number" class="form-control qty" value="1" min="1"></td>
            <td><input name="unit_price[]" type="number" step="0.01" class="form-control price" value="0.00"></td>
            <td><span class="item-total">0.00</span></td>
            <td><button type="button" class="btn btn-sm btn-danger remove-item">×</button></td>
        `;
        tbody.appendChild(row);
        attachEvents(row);
    });

    function attachEvents(row) {
        row.querySelector(\'.qty\').addEventListener(\'input\', function() { updateRowTotal(row); });
        row.querySelector(\'.price\').addEventListener(\'input\', function() { updateRowTotal(row); });
        row.querySelector(\'.remove-item\').addEventListener(\'click\', function() {
            if (document.querySelectorAll(\'#itemsBody tr\').length > 1) {
                row.remove();
            }
        });
    }

    document.querySelectorAll(\'#itemsBody tr\').forEach(row => attachEvents(row));
    document.querySelectorAll(\'#itemsBody tr\').forEach(row => updateRowTotal(row));
});
</script>
'; require __DIR__ . '/layout.php'; ?>
