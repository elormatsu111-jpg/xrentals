<?php
/**
 * require_role.php — include after session_bootstrap.php to gate an
 * endpoint to logged-in users of a specific account_type.
 *
 * Usage:
 *   require_once __DIR__ . '/require_role.php';
 *   $ownerId = require_role('owner'); // exits with 401/403 JSON if not allowed
 */

function require_role(string $role): int
{
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Please log in to continue.']);
        exit;
    }

    if (($_SESSION['account_type'] ?? '') !== $role) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'You do not have permission to do that.']);
        exit;
    }

    return (int) $_SESSION['user_id'];
}
