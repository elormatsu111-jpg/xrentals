<?php
/**
 * session_bootstrap.php — starts a session with hardened cookie settings.
 * require_once this BEFORE session_start() is called anywhere else.
 */

if (session_status() === PHP_SESSION_NONE) {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $isHttps,   // cookie only sent over HTTPS in production
        'httponly' => true,       // not accessible to JavaScript (mitigates XSS session theft)
        'samesite' => 'Lax',      // mitigates CSRF on cross-site navigations
    ]);

    session_start();
}
