<?php
/**
 * register.php — handles client account creation.
 *
 * Expects a POST (FormData or x-www-form-urlencoded) with:
 *   csrf_token, first-name, last-name, other-name (optional),
 *   email, phone, password, confirm-password
 *
 * Responds with JSON: { success: bool, message: string }
 */

require_once __DIR__ . '/session_bootstrap.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

function respond(bool $success, string $message, int $httpCode = 200): void
{
    http_response_code($httpCode);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.', 405);
}

// ---- CSRF check ----
if (!csrf_verify($_POST['csrf_token'] ?? null)) {
    respond(false, 'Your session expired. Please refresh the page and try again.', 403);
}

// ---- Collect + trim inputs ----
$firstName       = trim($_POST['first-name'] ?? '');
$lastName        = trim($_POST['last-name'] ?? '');
$otherName       = trim($_POST['other-name'] ?? '');
$email           = trim($_POST['email'] ?? '');
$phone           = trim($_POST['phone'] ?? '');
$password        = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirm-password'] ?? '';

// ---- Validation ----
if ($firstName === '' || $lastName === '' || $email === '' || $phone === '' || $password === '') {
    respond(false, 'Please fill in all required fields.', 422);
}

if (mb_strlen($firstName) > 100 || mb_strlen($lastName) > 100 || mb_strlen($otherName) > 100) {
    respond(false, 'Name fields must be under 100 characters.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 255) {
    respond(false, 'Please enter a valid email address.', 422);
}

// Loose phone check: digits, spaces, +, -, parentheses, 7-20 chars long.
if (!preg_match('/^[0-9+\-\s()]{7,20}$/', $phone)) {
    respond(false, 'Please enter a valid phone number.', 422);
}

if ($password !== $confirmPassword) {
    respond(false, 'Passwords do not match.', 422);
}

// Password strength: at least 8 chars, one letter and one number.
if (strlen($password) < 8 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    respond(false, 'Password must be at least 8 characters and include both letters and numbers.', 422);
}

// Account type is whitelisted server-side — a client can only ever register
// as "client" or "owner". "admin"/"staff" can never come from this public
// endpoint, no matter what the request sends.
$allowedTypes = ['client', 'owner'];
$requestedType = $_POST['account_type'] ?? 'client';
$accountType = in_array($requestedType, $allowedTypes, true) ? $requestedType : 'client';

// ---- Check for existing account ----
$check = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$check->bind_param('s', $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    $check->close();
    // Deliberately vague — avoids confirming which emails are registered.
    respond(false, 'Unable to complete registration with the provided details.', 409);
}
$check->close();

// ---- Create the account ----
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$insert = $conn->prepare(
    'INSERT INTO users (first_name, last_name, other_name, email, phone, password_hash, account_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)'
);
$insert->bind_param(
    'sssssss',
    $firstName,
    $lastName,
    $otherName,
    $email,
    $phone,
    $passwordHash,
    $accountType
);

if ($insert->execute()) {
    $insert->close();
    respond(true, 'Registration successful. You can now log in.');
} else {
    error_log('Registration insert failed: ' . $conn->error);
    $insert->close();
    respond(false, 'Something went wrong. Please try again.', 500);
}
