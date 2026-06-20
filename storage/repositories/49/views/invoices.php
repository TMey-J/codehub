<?php $content = '
<div class="d-flex justify-content-between mb-3">
    <h2>Invoices</h2>
    <a href="/invoices/create" class="btn btn-primary">+ New Invoice</a>
</div>
<table class="table table-bordered">
    <thead>
        <tr>
            <th>#</th>
            <th>Client</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        ' . (empty($invoices) ? '<tr><td colspan="7" class="text-center">No invoices yet.</td></tr>' : '') . '
        ' . array_reduce($invoices, function($html, $inv) {
            $tot = \App\Invoice::total($inv['id']);
            return $html . '
            <tr>
                <td>' . htmlspecialchars($inv['invoice_number']) . '</td>
                <td>' . htmlspecialchars($inv['client_name']) . '</td>
                <td>' . $inv['issue_date'] . '</td>
                <td>' . $inv['due_date'] . '</td>
                <td><span class="badge bg-' . ($inv['status'] === 'paid' ? 'success' : ($inv['status'] === 'overdue' ? 'danger' : 'secondary')) . '">' . ucfirst($inv['status']) . '</span></td>
                <td>$' . number_format($tot['grand_total'], 2) . '</td>
                <td>
                    <a href="/invoices/' . $inv['id'] . '" class="btn btn-sm btn-info">View</a>
                    <a href="/invoices/' . $inv['id'] . '/edit" class="btn btn-sm btn-warning">Edit</a>
                    <form method="POST" action="/invoices/' . $inv['id'] . '/delete" class="d-inline">
                        <input type="hidden" name="csrf" value="' . csrf_token() . '">
                        <button class="btn btn-sm btn-danger" onclick="return confirm(\'Delete?\')">Delete</button>
                    </form>
                </td>
            </tr>';
        }, '') . '
    </tbody>
</table>
'; require __DIR__ . '/layout.php'; ?>
