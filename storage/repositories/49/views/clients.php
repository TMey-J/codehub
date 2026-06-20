<?php $content = '
<div class="d-flex justify-content-between mb-3">
    <h2>Clients</h2>
    <a href="/clients/create" class="btn btn-primary">+ New Client</a>
</div>
<table class="table table-bordered">
    <thead>
        <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        ' . (empty($clients) ? '<tr><td colspan="4" class="text-center">No clients yet.</td></tr>' : '') . '
        ' . array_reduce($clients, function($html, $c) {
            return $html . '
            <tr>
                <td>' . htmlspecialchars($c['name']) . '</td>
                <td>' . htmlspecialchars($c['email']) . '</td>
                <td>' . htmlspecialchars($c['phone']) . '</td>
                <td>
                    <a href="/clients/' . $c['id'] . '/edit" class="btn btn-sm btn-warning">Edit</a>
                    <form method="POST" action="/clients/' . $c['id'] . '/delete" class="d-inline">
                        <input type="hidden" name="csrf" value="' . csrf_token() . '">
                        <button class="btn btn-sm btn-danger" onclick="return confirm(\'Delete?\')">Delete</button>
                    </form>
                </td>
            </tr>';
        }, '') . '
    </tbody>
</table>
'; require __DIR__ . '/layout.php'; ?>
