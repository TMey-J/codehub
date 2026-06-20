<?php 
$isEdit = isset($client);
$action = $isEdit ? '/clients/' . $client['id'] : '/clients';
$name = $isEdit ? htmlspecialchars($client['name']) : '';
$email = $isEdit ? htmlspecialchars($client['email']) : '';
$phone = $isEdit ? htmlspecialchars($client['phone']) : '';
$address = $isEdit ? htmlspecialchars($client['address']) : '';

$content = '
<div class="row justify-content-center">
    <div class="col-md-6">
        <h2>' . ($isEdit ? 'Edit' : 'New') . ' Client</h2>
        <form method="POST" action="' . $action . '">
            <input type="hidden" name="csrf" value="' . csrf_token() . '">
            <div class="mb-3">
                <label>Name *</label>
                <input name="name" value="' . $name . '" class="form-control" required>
            </div>
            <div class="mb-3">
                <label>Email *</label>
                <input name="email" type="email" value="' . $email . '" class="form-control" required>
            </div>
            <div class="mb-3">
                <label>Phone</label>
                <input name="phone" value="' . $phone . '" class="form-control">
            </div>
            <div class="mb-3">
                <label>Address</label>
                <textarea name="address" class="form-control" rows="3">' . $address . '</textarea>
            </div>
            <button class="btn btn-primary">Save</button>
            <a href="/clients" class="btn btn-secondary">Cancel</a>
        </form>
    </div>
</div>
'; require __DIR__ . '/layout.php'; ?>
