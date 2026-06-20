<?php $content = '
<div class="row">
    <div class="col-md-3">
        <div class="card text-white bg-primary mb-3">
            <div class="card-body">
                <h5 class="card-title">Total Clients</h5>
                <p class="card-text display-6">' . $totalClients . '</p>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card text-white bg-success mb-3">
            <div class="card-body">
                <h5 class="card-title">Total Invoices</h5>
                <p class="card-text display-6">' . $totalInvoices . '</p>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card text-white bg-info mb-3">
            <div class="card-body">
                <h5 class="card-title">Revenue (Paid)</h5>
                <p class="card-text display-6">$' . number_format($totalRevenue, 2) . '</p>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card text-white bg-danger mb-3">
            <div class="card-body">
                <h5 class="card-title">Overdue Invoices</h5>
                <p class="card-text display-6">' . $overdueCount . '</p>
            </div>
        </div>
    </div>
</div>
'; require __DIR__ . '/layout.php'; ?>
