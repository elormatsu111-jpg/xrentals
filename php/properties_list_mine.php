<?php
/**
 * properties_list_mine.php — returns the logged-in owner's properties.
 *
 * The query is always scoped to the session's own user_id — an owner_id
 * is never accepted from the request, so there's no way to list someone
 * else's properties by tampering with a parameter.
 *
 * Responds with JSON: { success: true, properties: [...] }
 */

require_once __DIR__ . '/session_bootstrap.php';
require_once __DIR__ . '/require_role.php';
require_once __DIR__ . '/db.php';

header('Content-Type: application/json');

$ownerId = require_role('owner');

$stmt = $conn->prepare(
    'SELECT id, title, price, listing_type, property_type, bedrooms, bathrooms, city, address, status, created_at
     FROM properties
     WHERE owner_id = ?
     ORDER BY created_at DESC'
);
$stmt->bind_param('i', $ownerId);
$stmt->execute();
$result = $stmt->get_result();

$properties = [];
while ($row = $result->fetch_assoc()) {
    // Grab the primary thumbnail for each property (kept as a separate
    // small query per row for clarity — fine at this scale; swap for a
    // JOIN + GROUP BY if the listing count grows large).
    $imgStmt = $conn->prepare(
        'SELECT file_path FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, sort_order ASC LIMIT 1'
    );
    $imgStmt->bind_param('i', $row['id']);
    $imgStmt->execute();
    $imgRow = $imgStmt->get_result()->fetch_assoc();
    $imgStmt->close();

    $row['thumbnail'] = $imgRow['file_path'] ?? null;
    $row['id'] = (int) $row['id'];
    $row['price'] = (float) $row['price'];
    $row['bedrooms'] = (int) $row['bedrooms'];
    $row['bathrooms'] = (int) $row['bathrooms'];

    $properties[] = $row;
}
$stmt->close();

echo json_encode(['success' => true, 'properties' => $properties]);
