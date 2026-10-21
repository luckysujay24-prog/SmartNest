-- ========================================================================
-- CommunityHub: Relational MySQL Schema (Migrated to MongoDB Compass)
-- Database: community_hub
-- All tables below have been migrated to collections in MongoDB Compass
-- ========================================================================

CREATE DATABASE IF NOT EXISTS community_hub;
USE community_hub;

-- 1. community
CREATE TABLE IF NOT EXISTS communities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. buildings
CREATE TABLE IF NOT EXISTS buildings (
    id VARCHAR(50) PRIMARY KEY,
    community_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_floors INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
);

-- 3. users (Indian residents, owners, workers, admins)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    role ENUM('ADMIN', 'OWNER', 'TENANT', 'WORKER') NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. flats
CREATE TABLE IF NOT EXISTS flats (
    id VARCHAR(50) PRIMARY KEY,
    building_id VARCHAR(50) NOT NULL,
    flat_number VARCHAR(50) NOT NULL,
    floor_number INT NOT NULL,
    flat_type VARCHAR(50) NOT NULL,
    area_sqft INT NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    maintenance_amount DECIMAL(10, 2) NOT NULL,
    occupancy_status ENUM('OCCUPIED', 'VACANT') DEFAULT 'VACANT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
);

-- 5. workers
CREATE TABLE IF NOT EXISTS workers (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    worker_type VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    availability ENUM('AVAILABLE', 'BUSY', 'ON_LEAVE') DEFAULT 'AVAILABLE',
    rating DECIMAL(2, 1) DEFAULT 5.0,
    completed_tasks_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. service_bookings (Free slots booking)
CREATE TABLE IF NOT EXISTS service_bookings (
    id VARCHAR(50) PRIMARY KEY,
    service_id VARCHAR(50) NOT NULL,
    worker_id VARCHAR(50),
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_phone VARCHAR(50) NOT NULL,
    flat_number VARCHAR(50) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    worker_name VARCHAR(255) NOT NULL,
    worker_phone VARCHAR(50) NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    issue_description TEXT,
    status ENUM('CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. private_messages (1-on-1 private chat)
CREATE TABLE IF NOT EXISTS private_messages (
    id VARCHAR(50) PRIMARY KEY,
    sender_id VARCHAR(50) NOT NULL,
    recipient_id VARCHAR(50) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    sender_avatar TEXT,
    message TEXT NOT NULL,
    tag VARCHAR(50) DEFAULT 'General',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);

-- 8. payments (UPI, Card, NetBanking ledger)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    bill_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_provider VARCHAR(100) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'SUCCESS',
    payment_method_title VARCHAR(100) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================================
-- End of MySQL Schema. MIGRATED TO MONGODB COMPASS DATABASE: community_hub
-- ========================================================================
