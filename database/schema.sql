-- MediTrack Database Schema
-- Barangay Health Center Management and Medicine Inventory System

CREATE DATABASE IF NOT EXISTS `meditrack` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `meditrack`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `research_evaluations`;
DROP TABLE IF EXISTS `research_transactions`;
DROP TABLE IF EXISTS `inventory_counts`;
DROP TABLE IF EXISTS `sms_logs`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `immunizations`;
DROP TABLE IF EXISTS `vaccines`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `medicine_dispensations`;
DROP TABLE IF EXISTS `inventory_transactions`;
DROP TABLE IF EXISTS `medical_records`;
DROP TABLE IF EXISTS `medicine_batches`;
DROP TABLE IF EXISTS `medicines`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. ROLES TABLE
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `contact_number` VARCHAR(20) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. PATIENTS TABLE
CREATE TABLE `patients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_code` VARCHAR(30) NOT NULL UNIQUE,
  `first_name` VARCHAR(50) NOT NULL,
  `middle_name` VARCHAR(50) NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `suffix` VARCHAR(10) NULL,
  `date_of_birth` DATE NOT NULL,
  `sex` ENUM('Male', 'Female') NOT NULL,
  `civil_status` ENUM('Single', 'Married', 'Widowed', 'Separated', 'Child') DEFAULT 'Single',
  `address` TEXT NOT NULL,
  `barangay` VARCHAR(100) NOT NULL DEFAULT 'Barangay Health Center Zone',
  `contact_number` VARCHAR(20) NOT NULL,
  `emergency_contact_name` VARCHAR(100) NULL,
  `emergency_contact_number` VARCHAR(20) NULL,
  `is_archived` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_patient_name` (`last_name`, `first_name`),
  INDEX `idx_patient_contact` (`contact_number`)
) ENGINE=InnoDB;

-- 4. MEDICINES TABLE (Master List)
CREATE TABLE `medicines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_code` VARCHAR(50) NOT NULL UNIQUE,
  `generic_name` VARCHAR(100) NOT NULL,
  `brand_name` VARCHAR(100) NULL,
  `dosage` VARCHAR(50) NOT NULL,
  `form` VARCHAR(50) NOT NULL, -- Tablet, Syrup, Capsule, Ampule, Drops, etc.
  `unit` VARCHAR(30) NOT NULL, -- pcs, bottles, boxes, strips
  `category` VARCHAR(50) NOT NULL, -- Antibiotic, Analgesic, Vitamin, Antihypertensive, etc.
  `min_stock_level` INT NOT NULL DEFAULT 50,
  `description` TEXT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_generic_name` (`generic_name`)
) ENGINE=InnoDB;

-- 5. MEDICINE BATCHES TABLE (FIFO Support)
CREATE TABLE `medicine_batches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `medicine_id` INT NOT NULL,
  `batch_number` VARCHAR(50) NOT NULL,
  `quantity_received` INT NOT NULL,
  `current_quantity` INT NOT NULL,
  `unit_cost` DECIMAL(10, 2) DEFAULT 0.00,
  `supplier` VARCHAR(150) NULL,
  `date_received` DATE NOT NULL,
  `expiration_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_batches_medicine` FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE,
  INDEX `idx_expiry` (`expiration_date`),
  INDEX `idx_batch_med` (`medicine_id`, `expiration_date`)
) ENGINE=InnoDB;

-- 6. MEDICAL RECORDS TABLE
CREATE TABLE `medical_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `bhw_id` INT NOT NULL,
  `visit_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `visit_type` ENUM('Consultation', 'Follow-up', 'Prenatal', 'Postnatal', 'Immunization', 'Emergency') NOT NULL,
  `chief_complaint` TEXT NOT NULL,
  `blood_pressure` VARCHAR(15) NULL,
  `temperature` DECIMAL(4, 2) NULL, -- in Celsius
  `weight` DECIMAL(5, 2) NULL, -- in kg
  `height` DECIMAL(5, 2) NULL, -- in cm
  `pulse_rate` INT NULL,
  `respiratory_rate` INT NULL,
  `diagnosis` VARCHAR(255) NOT NULL,
  `treatment` TEXT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_mr_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mr_bhw` FOREIGN KEY (`bhw_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_mr_date` (`visit_date`),
  INDEX `idx_mr_diagnosis` (`diagnosis`)
) ENGINE=InnoDB;

-- 7. MEDICINE DISPENSATIONS TABLE
CREATE TABLE `medicine_dispensations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `medical_record_id` INT NULL,
  `dispensed_by` INT NOT NULL,
  `dispense_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `instructions` VARCHAR(255) NULL,
  `total_items` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_dispense_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dispense_mr` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_dispense_user` FOREIGN KEY (`dispensed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. INVENTORY TRANSACTIONS TABLE
CREATE TABLE `inventory_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `medicine_id` INT NOT NULL,
  `batch_id` INT NOT NULL,
  `dispensation_id` INT NULL,
  `transaction_type` ENUM('RECEIVE', 'DISPENSE', 'ADJUSTMENT_ADD', 'ADJUSTMENT_SUB', 'EXPIRED_DISCARD') NOT NULL,
  `quantity` INT NOT NULL,
  `balance_after` INT NOT NULL,
  `user_id` INT NOT NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_trans_medicine` FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_trans_batch` FOREIGN KEY (`batch_id`) REFERENCES `medicine_batches`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_trans_disp` FOREIGN KEY (`dispensation_id`) REFERENCES `medicine_dispensations`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_trans_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 9. APPOINTMENTS TABLE
CREATE TABLE `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `appointment_date` DATE NOT NULL,
  `appointment_time` TIME NOT NULL,
  `purpose` VARCHAR(255) NOT NULL,
  `status` ENUM('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Missed') DEFAULT 'Scheduled',
  `notes` TEXT NULL,
  `reminder_sent` TINYINT(1) DEFAULT 0,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_app_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_app_creator` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_app_date` (`appointment_date`)
) ENGINE=InnoDB;

-- 10. VACCINES MASTER LIST
CREATE TABLE `vaccines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `target_disease` VARCHAR(255) NOT NULL,
  `recommended_age` VARCHAR(100) NOT NULL,
  `doses_required` INT NOT NULL DEFAULT 1,
  `description` TEXT NULL
) ENGINE=InnoDB;

-- 11. IMMUNIZATION RECORDS TABLE
CREATE TABLE `immunizations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `vaccine_id` INT NOT NULL,
  `dose_number` INT NOT NULL,
  `date_administered` DATE NOT NULL,
  `next_scheduled_date` DATE NULL,
  `administered_by` INT NOT NULL,
  `notes` VARCHAR(255) NULL,
  `reminder_sent` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_imm_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_imm_vaccine` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_imm_admin` FOREIGN KEY (`administered_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 12. PHYSICAL INVENTORY COUNTS & DISCREPANCIES
CREATE TABLE `inventory_counts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `batch_id` INT NOT NU