<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../vendor/autoload.php';

use App\Database;
use App\Client;
use App\Invoice;
use App\InvoiceItem;
use App\InvoicePDF;

// Start session for flash messages and CSRF
session_start();

// CSRF token generation
function csrf_token() {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function csrf_check($token) {
    return isset($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $token);
}

// Helper for redirects with messages
function redirect($url, $msg = null, $type = 'success') {
    if ($msg) {
        $_SESSION['flash'] = ['msg' => $msg, 'type' => $type];
    }
    header('Location: ' . APP_URL . $url);
    exit;
}

// Get flash message
$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);

// Mark overdue invoices on every request
Invoice::markOverdue();

// Simple router
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$base = '/'; // adjust if subfolder
if (strpos($path, $base) === 0) $path = substr($path, strlen($base));
$path = trim($path, '/');

$method = $_SERVER['REQUEST_METHOD'];

// ---------- ROUTES ----------

// Dashboard
if ($path === '' || $path === 'dashboard') {
    $totalClients = count(Client::all());
    $invoices = Invoice::all();
    $totalInvoices = count($invoices);
    $totalRevenue = 0;
    $overdueCount = 0;
    foreach ($invoices as $inv) {
        if ($inv['status'] === 'paid') {
            $tot = Invoice::total($inv['id']);
            $totalRevenue += $tot['grand_total'];
        }
        if ($inv['status'] === 'overdue') $overdueCount++;
    }
    include __DIR__ . '/../views/dashboard.php';
    exit;
}

// Clients
if ($path === 'clients' && $method === 'GET') {
    $clients = Client::all();
    include __DIR__ . '/../views/clients.php';
    exit;
}
if ($path === 'clients/create' && $method === 'GET') {
    include __DIR__ . '/../views/client_form.php';
    exit;
}
if ($path === 'clients' && $method === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? '')) { http_response_code(403); die('CSRF'); }
    $data = [
        'name' => trim($_POST['name']),
        'email' => trim($_POST['email']),
        'phone' => trim($_POST['phone']),
        'address' => trim($_POST['address'])
    ];
    if (empty($data['name']) || empty($data['email'])) {
        redirect('/clients/create', 'Name and email are required.', 'danger');
    }
    Client::create($data);
    redirect('/clients', 'Client added successfully.');
}
if (preg_match('#^clients/(\d+)/edit$#', $path, $m) && $method === 'GET') {
    $client = Client::find($m[1]);
    if (!$client) { http_response_code(404); die('Client not found'); }
    include __DIR__ . '/../views/client_form.php';
    exit;
}
if (preg_match('#^clients/(\d+)$#', $path, $m) && $method === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? '')) { http_response_code(403); die('CSRF'); }
    $data = [
        'name' => trim($_POST['name']),
        'email' => trim($_POST['email']),
        'phone' => trim($_POST['phone']),
        'address' => trim($_POST['address'])
    ];
    if (empty($data['name']) || empty($data['email'])) {
        redirect('/clients/' . $m[1] . '/edit', 'Name and email are required.', 'danger');
    }
    Client::update($m[1], $data);
    redirect('/clients', 'Client updated.');
}
if (preg_match('#^clients/(\d+)/delete$#', $path, $m) && $method === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? '')) { http_response_code(403); die('CSRF'); }
    Client::delete($m[1]);
    redirect('/clients', 'Client deleted.');
}

// Invoices
if ($path === 'invoices' && $method === 'GET') {
    $invoices = Invoice::all();
    include __DIR__ . '/../views/invoices.php';
    exit;
}
if ($path === 'invoices/create' && $method === 'GET') {
    $clients = Client::all();
    include __DIR__ . '/../views/invoice_form.php';
    exit;
}
if ($path === 'invoices' && $method === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? '')) { http_response_code(403); die('CSRF'); }
    $data = [
        'client_id' => (int)$_POST['client_id'],
        'issue_date' => $_POST['issue_date'],
        'due_date' => $_POST['due_date'],
        'tax_rate' => (float)$_POST['tax_rate'],
        'status' => $_POST['status']
    ];
    if (empty($data['client_id']) || empty($data['issue_date']) || empty($data['due_date'])) {
        redirect('/invoices/create', 'All fields are required.', 'danger');
    }
    $invoiceId = Invoice::create($data);
    // Insert items (if any)
    $descs = $_POST['description'] ?? [];
    $qties = $_POST['quantity'] ?? [];
    $prices = $_POST['unit_price'] ?? [];
    for ($i = 0; $i < count($descs); $i++) {
        if (trim($descs[$i]) !== '' && (int)$qties[$i] > 0 && (float)$prices[$i] >= 0) {
            InvoiceItem::create($invoiceId, [
                'description' => trim($descs[$i]),
                'quantity' => (int)$qties[$i],
                'unit_price' => (float)$prices[$i]
            ]);
        }
    }
    redirect('/invoices', 'Invoice created successfully.');
}
if (preg_match('#^invoices/(\d+)/edit$#', $path, $m) && $method === 'GET') {
    $invoice = Invoice::find($m[1]);
    if (!$invoice) { http_response_code(404); die('Invoice not found'); }
    $items = Invoice::items($m[1]);
    $clients = Client::all();
    include __DIR__ . '/../views/invoice_form.php';
    exit;
}
if (preg_match('#^invoices/(\d+)$#', $path, $m) && $method === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? '')) { http_response_code(403); die('CSRF'); }
    $data = [
        'client_id' => (int)$_POST['client_id'],
        'issue_date' => $_POST['issue_date'],
        'due_date' => $_POST['due_date'],
        'tax_rate' => (float)$_POST['tax_rate'],
        'status' => $_POST['status']
    ];
    Invoice::update($m[1], $data);
    // Remove existing items and re-add
    $stmt = Database::get()->prepare('DELETE FROM invoice_items WHERE invoice_id = ?');
    $stmt->execute([$m[1]]);
    $descs = $_POST['description'] ?? [];
    $qties = $_POST['quantity'] ?? [];
    $prices = $_POST['unit_price'] ?? [];
    for ($i = 0; $i < count($descs); $i++) {
        if (trim($descs[$i]) !== '' && (int)$qties[$i] > 0 && (float)$prices[$i] >= 0) {
            InvoiceItem::create($m[1], [
                'description' => trim($descs[$i]),
                'quantity' => (int)$qties[$i],
                'unit_price' => (float)$prices[$i]
            ]);
        }
    }
    redirect('/invoices', 'Invoice updated.');
}
if (preg_match('#^invoices/(\d+)/delete$#', $path, $m) && $method === 'POST') {
    if (!csrf_check($_POST['csrf'] ?? '')) { http_response_code(403); die('CSRF'); }
    Invoice::delete($m[1]);
    redirect('/invoices', 'Invoice deleted.');
}

// View invoice (with PDF download)
if (preg_match('#^invoices/(\d+)$#', $path, $m) && $method === 'GET') {
    $invoice = Invoice::find($m[1]);
    if (!$invoice) { http_response_code(404); die('Invoice not found'); }
    $items = Invoice::items($m[1]);
    $totals = Invoice::total($m[1]);
    include __DIR__ . '/../views/invoice_view.php';
    exit;
}

// PDF Download
if (preg_match('#^invoices/(\d+)/pdf$#', $path, $m) && $method === 'GET') {
    try {
        $pdf = InvoicePDF::generate($m[1]);
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="invoice_' . $m[1] . '.pdf"');
        echo $pdf;
    } catch (\Exception $e) {
        http_response_code(404);
        echo 'Invoice not found.';
    }
    exit;
}

// 404
http_response_code(404);
echo 'Page not found.';
