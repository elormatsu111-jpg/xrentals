<?php
/**
 * session_check.php — tells a protected page whether the visitor is
 * logged in, and if so, who they are. Dashboards call this on load
 * and redirect to login if it comes back logged out.
 *
 * Responds with JSON:
 *   logged in:  { loggedIn: true, firstName, email, accountType, csrfToken }
 *   logged out: { loggedIn: false }
 */

require_once __DIR__ . '/session_bootstrap.php';
require_once __DIR__ . '/csrf.php';

header('Content-Type: application/json');

if (empty($_SESSION['user_id'])) {
    echo json_encode(['loggedIn' => false]);
    exit;
}

echo json_encode([
    'loggedIn'    => true,
    'firstName'   => $_SESSION['first_name'] ?? '',
    'email'       => $_SESSION['email'] ?? '',
    'accountType' => $_SESSION['account_type'] ?? '',
    'csrfToken'   => csrf_token(),
]);
