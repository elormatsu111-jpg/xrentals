<?php
/**
 * properties_create.php — creates a property listing for the logged-in owner.
 *
 *   title, description, price, listing_type, property_type,
 *   bedrooms, bathrooms, city, address, images[] (0-8 files, optional)
 *
 */

require_once __DIR__ . '/session_bootstrap.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/require_role.php';
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

// Only logged-in property owners may create listings.
$ownerId = require_role('owner');

if (!csrf_verify($_POST['csrf_token'] ?? null)) {
    respond(false, 'Your session expired. Please refresh the page and try again.', 403);
}

// ---- Collect + trim inputs ----
$title        = trim($_POST['title'] ?? '');
$description  = trim($_POST['description'] ?? '');
$price        = $_POST['price'] ?? '';
$listingType  = $_POST['listing_type'] ?? '';
$propertyType = trim($_POST['property_type'] ?? '');
$bedrooms     = $_POST['bedrooms'] ?? '';
$bathrooms    = $_POST['bathrooms'] ?? '';
$city         = trim($_POST['city'] ?? '');
$address      = trim($_POST['address'] ?? '');

// ---- Validation ----
if ($title === '' || mb_strlen($title) > 150) {
    respond(false, 'Please enter a title (up to 150 characters).', 422);
}
if (mb_strlen($description) < 20 || mb_strlen($description) > 5000) {
    respond(false, 'Description must be between 20 and 5000 characters.', 422);
}
if (!is_numeric($price) || (float) $price <= 0 || (float) $price > 999999999) {
    respond(false, 'Please enter a valid price.', 422);
}
if (!in_array($listingType, ['rent', 'sale'], true)) {
    respond(false, 'Please choose a valid listing type.', 422);
}
$allowedPropertyTypes = ['Apartment', 'House', 'Villa', 'Studio', 'Cottage', 'Mansion', 'Townhouse', 'Land'];
if (!in_array($propertyType, $allowedPropertyTypes, true)) {
    respond(false, 'Please choose a valid property type.', 422);
}
if (!ctype_digit((string) $bedrooms) || (int) $bedrooms > 50) {
    respond(false, 'Please enter a valid number of bedrooms.', 422);
}
if (!ctype_digit((string) $bathrooms) || (int) $bathrooms > 50) {
    respond(false, 'Please enter a valid number of bathrooms.', 422);
}
if ($city === '' || mb_strlen($city) > 100) {
    respond(false, 'Please enter a city.', 422);
}
if ($address === '' || mb_strlen($address) > 255) {
    respond(false, 'Please enter an address.', 422);
}

// ---- Insert the property row ----
$stmt = $conn->prepare(
    'INSERT INTO properties (owner_id, title, description, price, listing_type, property_type, bedrooms, bathrooms, city, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$priceFloat = (float) $price;
$bedroomsInt = (int) $bedrooms;
$bathroomsInt = (int) $bathrooms;
$stmt->bind_param(
    'issdssiiss',
    $ownerId,
    $title,
    $description,
    $priceFloat,
    $listingType,
    $propertyType,
    $bedroomsInt,
    $bathroomsInt,
    $city,
    $address
);

if (!$stmt->execute()) {
    error_log('Property insert failed: ' . $conn->error);
    $stmt->close();
    respond(false, 'Something went wrong creating the listing. Please try again.', 500);
}
$propertyId = $stmt->insert_id;
$stmt->close();

// ---- Handle image uploads (optional, up to 8 files) ----
$allowedMime = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$maxFileSize = 5 * 1024 * 1024; // 5MB per image
$uploadDir   = __DIR__ . '/../uploads/properties/';
$uploaded    = 0;

if (!empty($_FILES['images']) && is_array($_FILES['images']['tmp_name'])) {
    $fileCount = count($_FILES['images']['tmp_name']);

    if ($fileCount > 8) {
        respond(false, 'You can upload up to 8 images.', 422);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);

    for ($i = 0; $i < $fileCount; $i++) {
        if ($_FILES['images']['error'][$i] === UPLOAD_ERR_NO_FILE) {
            continue; // empty slot, skip silently
        }
        if ($_FILES['images']['error'][$i] !== UPLOAD_ERR_OK) {
            continue; // skip files that failed to upload rather than aborting the whole listing
        }
        if ($_FILES['images']['size'][$i] > $maxFileSize) {
            continue; // skip oversized files
        }

        $tmpPath = $_FILES['images']['tmp_name'][$i];
        $realMime = $finfo->file($tmpPath); // check actual file content, not the client-supplied name/type

        if (!isset($allowedMime[$realMime])) {
            continue; // not a real jpg/png/webp — skip
        }

        $ext = $allowedMime[$realMime];
        $randomName = bin2hex(random_bytes(16)) . '.' . $ext;
        $destination = $uploadDir . $randomName;

        if (move_uploaded_file($tmpPath, $destination)) {
            $isPrimary = ($uploaded === 0) ? 1 : 0; // first successfully uploaded image is the thumbnail
            $imgStmt = $conn->prepare(
                'INSERT INTO property_images (property_id, file_path, is_primary, sort_order) VALUES (?, ?, ?, ?)'
            );
            $relativePath = 'uploads/properties/' . $randomName;
            $imgStmt->bind_param('isii', $propertyId, $relativePath, $isPrimary, $uploaded);
            $imgStmt->execute();
            $imgStmt->close();
            $uploaded++;
        }
    }
}

respond(true, 'Property listed successfully.', 201, ['propertyId' => $propertyId, 'imagesUploaded' => $uploaded]);
