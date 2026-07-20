<?php
/**
 * db.php — single source of truth for the database connection.
 *
 * All backend scripts should `require_once` this file (not the old
 * Assets/config/database.php, which has been removed to avoid two
 * conflicting connections existing at once).
 *
 * Credentials are read from environment variables so nothing sensitive
 * is hardcoded or committed to git. For local development, copy
 * .env.example to .env and fill in your values.
 */

// ---- Minimal .env loader (no external dependency) ----
// If a .env file exists at the project root, load its KEY=VALUE pairs
// into the environment. In production, prefer setting real environment
// variables on the server (Apache SetEnv, php-fpm pool config, etc.)
// instead of shipping a .env file.
$envPath = __DIR__ . '/../../.env';
if (is_readable($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if (getenv($key) === false) {
            putenv("$key=$value");
        }
    }
}

$appEnv = getenv('APP_ENV') ?: 'development';

// ---- Error visibility ----
// Never leak stack traces / DB errors to the browser in production.
if ($appEnv === 'production') {
    ini_set('display_errors', '0');
    error_reporting(0);
} else {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}

$host   = getenv('DB_HOST') ?: '127.0.0.1';
$dbName = getenv('DB_NAME') ?: 'xrentals';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '';
$dbPort = getenv('DB_PORT') ?: 3306;

mysqli_report(MYSQLI_REPORT_OFF); // we handle errors ourselves below

$conn = mysqli_init();
$connected = @$conn->real_connect($host, $dbUser, $dbPass, $dbName, (int) $dbPort);

if (!$connected) {
    // Log the real error server-side for debugging...
    error_log('Database connection failed: ' . mysqli_connect_error());

    // ...but never show DB details to the client.
    http_response_code(500);
    if ($appEnv === 'production') {
        die('Service temporarily unavailable. Please try again later.');
    } else {
        die('Connection failed: ' . mysqli_connect_error());
    }
}

$conn->set_charset('utf8mb4');
