<?php namespace App;

use App\Database;

class Client {
    public static function all() {
        $stmt = Database::get()->query('SELECT * FROM clients ORDER BY name');
        return $stmt->fetchAll();
    }
    public static function find($id) {
        $stmt = Database::get()->prepare('SELECT * FROM clients WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    public static function create($data) {
        $stmt = Database::get()->prepare('INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)');
        $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['address']]);
        return Database::get()->lastInsertId();
    }
    public static function update($id, $data) {
        $stmt = Database::get()->prepare('UPDATE clients SET name=?, email=?, phone=?, address=? WHERE id=?');
        return $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['address'], $id]);
    }
    public static function delete($id) {
        $stmt = Database::get()->prepare('DELETE FROM clients WHERE id=?');
        return $stmt->execute([$id]);
    }
}

class Invoice {
    public static function all() {
        $stmt = Database::get()->query('SELECT i.*, c.name as client_name FROM invoices i JOIN clients c ON i.client_id = c.id ORDER BY i.id DESC');
        return $stmt->fetchAll();
    }
    public static function find($id) {
        $stmt = Database::get()->prepare('SELECT i.*, c.name as client_name, c.email, c.phone, c.address FROM invoices i JOIN clients c ON i.client_id = c.id WHERE i.id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    public static function create($data) {
        // Insert invoice without invoice_number (we'll generate after getting the ID)
        $stmt = Database::get()->prepare('INSERT INTO invoices (client_id, issue_date, due_date, tax_rate, status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$data['client_id'], $data['issue_date'], $data['due_date'], $data['tax_rate'], $data['status']]);
        $id = Database::get()->lastInsertId();
        // Generate invoice number: INV-YYYY-XXXX (padded to 4 digits)
        $number = 'INV-' . date('Y') . '-' . str_pad($id, 4, '0', STR_PAD_LEFT);
        $stmt2 = Database::get()->prepare('UPDATE invoices SET invoice_number = ? WHERE id = ?');
        $stmt2->execute([$number, $id]);
        return $id;
    }
    public static function update($id, $data) {
        $stmt = Database::get()->prepare('UPDATE invoices SET client_id=?, issue_date=?, due_date=?, tax_rate=?, status=? WHERE id=?');
        return $stmt->execute([$data['client_id'], $data['issue_date'], $data['due_date'], $data['tax_rate'], $data['status'], $id]);
    }
    public static function delete($id) {
        $stmt = Database::get()->prepare('DELETE FROM invoices WHERE id=?');
        return $stmt->execute([$id]);
    }
    public static function items($invoiceId) {
        $stmt = Database::get()->prepare('SELECT * FROM invoice_items WHERE invoice_id = ?');
        $stmt->execute([$invoiceId]);
        return $stmt->fetchAll();
    }
    public static function total($invoiceId) {
        $stmt = Database::get()->prepare('SELECT SUM(total) as subtotal FROM invoice_items WHERE invoice_id = ?');
        $stmt->execute([$invoiceId]);
        $subtotal = (float) $stmt->fetchColumn();
        $invoice = self::find($invoiceId);
        $tax = $subtotal * ($invoice['tax_rate'] / 100);
        return ['subtotal' => $subtotal, 'tax' => $tax, 'grand_total' => $subtotal + $tax];
    }
    // Update status to overdue if due_date < today and status != 'paid'
    public static function markOverdue() {
        $stmt = Database::get()->prepare('UPDATE invoices SET status = "overdue" WHERE due_date < CURDATE() AND status != "paid"');
        $stmt->execute();
    }
}

class InvoiceItem {
    public static function create($invoiceId, $data) {
        $stmt = Database::get()->prepare('INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)');
        $total = $data['quantity'] * $data['unit_price'];
        return $stmt->execute([$invoiceId, $data['description'], $data['quantity'], $data['unit_price'], $total]);
    }
    public static function delete($id) {
        $stmt = Database::get()->prepare('DELETE FROM invoice_items WHERE id=?');
        return $stmt->execute([$id]);
    }
    // Optionally update items (not required for MVP)
}
