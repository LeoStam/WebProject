CREATE DATABASE IF NOT EXISTS garage_db;
USE garage_db;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'mechanic', 'secretary') NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
    user_id INT PRIMARY KEY,
    afm VARCHAR(9) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mechanics Table
CREATE TABLE mechanics (
    user_id INT PRIMARY KEY,
    specialty VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Πίνακας αυτοκινήτων
CREATE TABLE IF NOT EXISTS cars (
  vin VARCHAR(17) PRIMARY KEY,
  owner_id INT NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  vehicle_type ENUM('passenger', 'truck', 'bus', 'motorcycle') NOT NULL,
  fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid', 'lpg') NOT NULL,
  production_year INT NOT NULL,
  doors_count TINYINT UNSIGNED,
  wheels_count TINYINT UNSIGNED DEFAULT 4,
  color VARCHAR(30),
  plate_number VARCHAR(20) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_year CHECK (production_year BETWEEN 1900 AND YEAR(CURRENT_DATE) + 1),
  CONSTRAINT chk_doors CHECK (doors_count BETWEEN 1 AND 10),
  CONSTRAINT chk_wheels CHECK (wheels_count BETWEEN 2 AND 12)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Δείκτης για γρήγορη αναζήτηση με βάση τον ιδιοκτήτη
CREATE INDEX idx_car_owner ON cars(owner_id);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  status ENUM('created', 'in_progress', 'completed', 'cancelled') DEFAULT 'created',
  reason ENUM('service', 'repair') NOT NULL,
  problem_description TEXT,
  cost DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  customer_id INT NOT NULL,
  mechanic_id INT NOT NULL,
  car_vin VARCHAR(17) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_vin) REFERENCES cars(vin) ON DELETE CASCADE
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description TEXT NOT NULL,
  materials_used TEXT,
  hours_worked DECIMAL(4, 2),
  cost DECIMAL(10, 2) NOT NULL,
  appointment_id INT NOT NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);