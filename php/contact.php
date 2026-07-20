<?php
/**
 * contact.php — handles the "Send an Inquiry" contact form.
 *
 * Expects a POST with: csrf_token, name, email, subject, message, website (honeypot)
 * Responds with JSON: { success: bool, message: string }
 *
 * Messages are stored in the contact_messages table rather than emailed,
 * since no SMTP server is configured yet. Wiring up PHPMailer/SMTP later
 * is a drop-in addition at the bottom of this file.
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

if (!csrf_verify($_POST['csrf_token'] ?? null)) {
    respond(false, 'Your session expired. Please refresh the page and try again.', 403);
}

// ---- Honeypot: real visitors never see or fill this field. ----
// If it's filled, silently pretend success so bots don't learn to avoid it.
if (!empty($_POST['website'] ?? '')) {
    respond(true, 'Message sent.');
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');
$ip      = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// ---- Validation ----
if (mb_strlen($name) < 2 || mb_strlen($name) > 150) {
    respond(false, 'Please enter your full name.', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 255) {
    respond(false, 'Please enter a valid email address.', 422);
}
if ($subject === '' || mb_strlen($subject) > 200) {
    respond(false, 'Please enter a subject.', 422);
}
if (mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    respond(false, 'Message must be between 10 and 5000 characters.', 422);
}

// ---- Rate limiting: max 5 messages per IP per hour ----
$rateStmt = $conn->prepare(
    'SELECT COUNT(*) AS total FROM contact_messages
     WHERE ip_address = ? AND created_at > (NOW() - INTERVAL 1 HOUR)'
);
$rateStmt->bind_param('s', $ip);
$rateStmt->execute();
$total = $rateStmt->get_result()->fetch_assoc()['total'] ?? 0;
$rateStmt->close();

if ($total >= 5) {
    respond(false, "You've sent several messages recently. Please try again later.", 429);
}

// ---- Store the inquiry ----
$insert = $conn->prepare(
    'INSERT INTO contact_messages (name, email, subject, message, ip_address) VALUES (?, ?, ?, ?, ?)'
);
$insert->bind_param('sssss', $name, $email, $subject, $message, $ip);

if ($insert->execute()) {
    $insert->close();
    respond(true, "Message sent! We'll get back to you within 24 hours.");
} else {
    error_log('Contact message insert failed: ' . $conn->error);
    $insert->close();
    respond(false, 'Something went wrong. Please try again.', 500);
}
