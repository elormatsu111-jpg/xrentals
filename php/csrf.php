<?php
/**
 * csrf.php
 *
 * Two jobs:
 *  1. When included (require_once) by another script, it exposes
 *     csrf_token() and csrf_verify() helper functions.
 *  2. When hit directly via GET (fetch('php/csrf.php')), it returns
 *     a fresh token as JSON so the frontend can attach it to forms.
 */

require_once __DIR__ . '/session_bootstrap.php';

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_verify(?string $submittedToken): bool
{
    if (empty($_SESSION['csrf_token']) || empty($submittedToken)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $submittedToken);
}

// If this file was requested directly (not included by register.php/login.php),
// act as a small JSON endpoint that hands out a token.
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('Content-Type: application/json');
    echo json_encode(['csrfToken' => csrf_token()]);
    exit;
}
