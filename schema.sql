-- Xrentals auth schema
-- Import with: mysql -u root -p xrentals < schema.sql

CREATE DATABASE IF NOT EXISTS xrentals CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE xrentals;

CREATE TABLE IF NOT EXISTS users (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    other_name     VARCHAR(100) NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    phone          VARCHAR(20)  NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    account_type   ENUM('client', 'owner', 'admin', 'staff') NOT NULL DEFAULT 'client',
    status         ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tracks every login attempt (success and failure) so login.php can
-- rate-limit brute-force attempts per email+IP.
CREATE TABLE IF NOT EXISTS login_attempts (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    ip_address    VARCHAR(45)  NOT NULL, -- IPv6-safe length
    success       TINYINT(1)   NOT NULL DEFAULT 0,
    attempted_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_ip_time (email, ip_address, attempted_at)
) ENGINE=InnoDB;

-- Property listings created by owner accounts.
CREATE TABLE IF NOT EXISTS properties (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id        INT UNSIGNED NOT NULL,
    title           VARCHAR(150) NOT NULL,
    description     TEXT NOT NULL,
    price           DECIMAL(12, 2) NOT NULL,
    listing_type    ENUM('rent', 'sale') NOT NULL DEFAULT 'rent',
    property_type   VARCHAR(50) NOT NULL, -- e.g. Apartment, House, Villa, Studio
    bedrooms        TINYINT UNSIGNED NOT NULL DEFAULT 0,
    bathrooms       TINYINT UNSIGNED NOT NULL DEFAULT 0,
    city            VARCHAR(100) NOT NULL,
    address         VARCHAR(255) NOT NULL,
    status          ENUM('available', 'rented', 'sold') NOT NULL DEFAULT 'available',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Photos attached to a property. A property can have several; is_primary
-- marks the one used as the card thumbnail.
CREATE TABLE IF NOT EXISTS property_images (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id   INT UNSIGNED NOT NULL,
    file_path     VARCHAR(255) NOT NULL,
    is_primary    TINYINT(1) NOT NULL DEFAULT 0,
    sort_order    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property (property_id)
) ENGINE=InnoDB;

-- Stores "Send an Inquiry" contact form submissions.
CREATE TABLE IF NOT EXISTS contact_messages (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    subject       VARCHAR(200) NOT NULL,
    message       TEXT NOT NULL,
    ip_address    VARCHAR(45)  NOT NULL,
    is_read       TINYINT(1)   NOT NULL DEFAULT 0,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_time (ip_address, created_at)
) ENGINE=InnoDB;
