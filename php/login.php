<?php
/**
 * login.php — authenticates a client account.
 *
 * Expects a POST with: csrf_token, email, password
 * Responds with JSON: { success: bool, message: string, redirect?: string }
 */

require_once __DIR__ . '/session_bootstrap.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

function respond(bool $success, string $message, int $httpCode = 200, array $extra = []): void
{
    http_response_code($httpCode);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.', 405);
}

if (!csrf_verify($_POST['csrf_token'] ?? null)) {
    respond(false, 'Your session expired. Please refresh the page and try again.', 403);
}

$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

if ($email === '' || $password === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email and password.', 422);
}

// ---- Rate limiting: max 5 failed attempts per email+IP in 15 minutes ----
const MAX_ATTEMPTS  = 5;
const WINDOW_MINUTES = 15;

$attemptsStmt = $conn->prepare(
    'SELECT COUNT(*) AS attempts FROM login_attempts
     WHERE email = ? AND ip_address = ? AND success = 0
       AND attempted_at > (NOW() - INTERVAL ' . WINDOW_MINUTES . ' MINUTE)'
);
$attemptsStmt->bind_param('ss', $email, $ip);
$attemptsStmt->execute();
$attempts = $attemptsStmt->get_result()->fetch_assoc()['attempts'] ?? 0;
$attemptsStmt->close();

if ($attempts >= MAX_ATTEMPTS) {
    respond(false, 'Too many failed login attempts. Please try again in ' . WINDOW_MINUTES . ' minutes.', 429);
}

// ---- Look up user ----
$stmt = $conn->prepare('SELECT id, email, password_hash, account_type, first_name FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

$loginOk = $user && password_verify($password, $user['password_hash']);

// ---- Record the attempt (success or failure) for rate limiting / auditing ----
$log = $conn->prepare('INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)');
$successFlag = $loginOk ? 1 : 0;
$log->bind_param('ssi', $email, $ip, $successFlag);
$log->execute();
$log->close();

if (!$loginOk) {
    // Same generic message whether the email doesn't exist or the password
    // is wrong — avoids leaking which emails are registered.
    respond(false, 'Invalid email or password.', 401);
}

// ---- Success: rotate the session ID to prevent session fixation ----
session_regenerate_id(true);
$_SESSION['user_id']      = $user['id'];
$_SESSION['email']        = $user['email'];
$_SESSION['account_type'] = $user['account_type'];
$_SESSION['first_name']   = $user['first_name'];

// Issue a fresh CSRF token for the now-authenticated session.
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

$dashboards = [
    'client' => '../Dashboard/clientDashboard.html',
    'owner'  => '../Dashboard/propertyOwnerDashboard.html',
];
$redirect = $dashboards[$user['account_type']] ?? '../Dashboard/clientDashboard.html';

respond(true, 'Login successful.', 200, ['redirect' => $redirect]);
