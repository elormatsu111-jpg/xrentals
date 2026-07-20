<?php
/**
 * properties_delete.php — deletes a property owned by the logged-in user.
 *
 * Expects a POST with: csrf_token, property_id
 * The DELETE query includes "AND owner_id = ?" so an owner can never
 * delete a listing that isn't theirs, even by guessing another property's ID.
 *
 * Responds with JSON: { success: bool, message: string }
 */

require_once __DIR__ . '/session_bootstrap.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/require_role.php';
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

$ownerId = require_role('owner');

if (!csrf_verify($_POST['csrf_token'] ?? null)) {
    respond(false, 'Your session expired. Please refresh the page and try again.', 403);
}

$propertyId = $_POST['property_id'] ?? '';
if (!ctype_digit((string) $propertyId)) {
    respond(false, 'Invalid property.', 422);
}

// ---- Delete image files from disk before removing the DB rows ----
$imgStmt = $conn->prepare('SELECT file_path FROM property_images WHERE property_id = ?');
$imgStmt->bind_param('i', $propertyId);
$imgStmt->execute();
$images = $imgStmt->get_result();
$uploadRoot = realpath(__DIR__ . '/../uploads/properties/');

while ($img = $images->fetch_assoc()) {
    $fullPath = realpath(__DIR__ . '/../' . $img['file_path']);
    // Only unlink if the resolved path is actually inside the uploads
    // directory — guards against a malformed file_path ever deleting
    // something outside the intended folder.
    if ($fullPath && $uploadRoot && str_starts_with($fullPath, $uploadRoot) && is_file($fullPath)) {
        @unlink($fullPath);
    }
}
$imgStmt->close();

// ---- Delete the property (owner_id check prevents deleting someone else's listing) ----
$stmt = $conn->prepare('DELETE FROM properties WHERE id = ? AND owner_id = ?');
$stmt->bind_param('ii', $propertyId, $ownerId);
$stmt->execute();
$deleted = $stmt->affected_rows > 0;
$stmt->close();

if ($deleted) {
    respond(true, 'Property deleted.');
} else {
    respond(false, 'Property not found.', 404);
}
