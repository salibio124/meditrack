USE `meditrack`;

-- Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Administrator', 'Full access to all system features, user management, and logs'),
(2, 'BHW', 'Barangay Health Worker: Patient care, dispensing, records, appointments'),
(3, 'Health Officer', 'Read-only access to health analytics, reports, and indicators');

-- Users
-- Password hash for 'Password123!' generated with bcrypt (10 rounds):
-- $2a$10$779l0H5Vb2e67V2zQnK76ed9xLg5e6l8lM5hA8Wk/bH2hT2XGq6dC
INSERT INTO `users` (`id`, `role_id`, `username`, `email`, `password_hash`, `full_name`, `contact_number`) VALUES
(1, 1, 'admin', 'admin@meditrack.ph', '$2a$10$779l0H5Vb2e67V2zQnK76ed9xLg5e6l8lM5hA8Wk/bH2hT2XGq6dC', 'Juana Dela Cruz (Admin)', '09171234567'),
(2, 2, 'maria_bhw', 'maria@meditrack.ph', '$2a$10$779l0H5Vb2e67V2zQnK76ed9xLg5e6l8lM5hA8Wk/bH2hT2XGq6dC', 'Maria Santos (BHW Lead)', '09181234568'),
(3, 2, 'ana_bhw', 'ana@meditrack.ph', '$2a$10$779l0H5Vb2e67V2zQnK76ed9xLg5e6l8lM5hA8Wk/bH2hT2XGq6dC', 'Ana Reyes (BHW Staff)', '09191234569'),
(4, 3, 'dr_santos', 'drsantos@meditrack.ph', '$2a$10$779l0H5Vb2e67V2zQnK76ed9xLg5e6l8lM5hA8Wk/bH2hT2XGq6dC', 'Dr. Roberto Santos, MHO', '09201234570');

-- 20 Realistic Filipino Patients
INSERT INTO `patients` (`id`, `patient_code`, `first_name`, `middle_name`, `last_name`, `suffix`, `date_of_birth`, `sex`, `civil_status`, `address`, `barangay`, `contact_number`, `emergency_contact_name`, `emergency_contact_number`) VALUES
(1, 'PT-2026-0001', 'Juan', 'Mercado', 'Reyes', NULL, '1985-04-12', 'Male', 'Married', 'Purok 1, Riverside', 'Brgy. San Jose', '09151112201', 'Elena Reyes', '09151112202'),
(2, 'PT-2026-0002', 'Maria Teresa', 'Alcantara', 'Gonzales', NULL, '1990-08-23', 'Female', 'Married', 'Block 3 Lot 8, Maharlika St.', 'Brgy. San Jose', '09151112203', 'Carlo Gonzales', '09151112204'),
(3, 'PT-2026-0003', 'Angelica', 'Flores', 'Bautista', NULL, '2023-05-15', 'Female', 'Child', 'Purok 4, Ilaya', 'Brgy. San Jose', '09151112205', 'Carmela Bautista', '09151112205'),
(4, 'PT-2026-0004', 'Rodrigo', 'Tan', 'Dela Rosa', 'Jr.', '1962-11-30', 'Male', 'Married', 'Purok 2, Centro', 'Brgy. San Jose', '09151112206', 'Corazon Dela Rosa', '09151112207'),
(5, 'PT-2026-0005', 'Lourdes', 'Santos', 'Villanueva', NULL, '1955-02-14', 'Female', 'Widowed', 'Sitio Balite', 'Brgy. San Jose', '09151112208', 'Mark Villanueva', '09151112209'),
(6, 'PT-2026-0006', 'Jayson', 'Diaz', 'Navarro', NULL, '1998-09-03', 'Male', 'Single', 'Purok 6, Sampaguita', 'Brgy. San Jose', '09151112210', 'Lydia Navarro', '09151112211'),
(7, 'PT-2026-0007', 'Baby Boy', 'Cruz', 'Mendoza', NULL, '2026-01-10', 'Male', 'Child', 'Purok 3, Kawayan', 'Brgy. San Jose', '09151112212', 'Arlene Mendoza', '09151112212'),
(8, 'PT-2026-0008', 'Cristina', 'Valdez', 'Aquino', NULL, '2001-07-19', 'Female', 'Single', 'Sitio Ibaba', 'Brgy. San Jose', '09151112213', 'Rosanna Aquino', '09151112214'),
(9, 'PT-2026-0009', 'Eduardo', 'Lim', 'Castillo', NULL, '1976-12-05', 'Male', 'Married', 'Purok 1, Tabing Ilog', 'Brgy. San Jose', '09151112215', 'Susan Castillo', '09151112216'),
(10, 'PT-2026-0010', 'Fatima', 'Ramos', 'Morales', NULL, '1994-03-25', 'Female', 'Married', 'Block 12 Lot 4, Pag-asa', 'Brgy. San Jose', '09151112217', 'Gilbert Morales', '09151112218'),
(11, 'PT-2026-0011', 'Gabriel', 'Castro', 'Pascual', NULL, '2019-10-14', 'Male', 'Child', 'Purok 5, Bukid', 'Brgy. San Jose', '09151112219', 'Teresa Pascual', '09151112219'),
(12, 'PT-2026-0012', 'Helen', 'Soriano', 'Tolentino', NULL, '1968-06-08', 'Female', 'Married', 'Purok 2, Centro', 'Brgy. San Jose', '09151112220', 'Ramon Tolentino', '09151112221'),
(13, 'PT-2026-0013', 'Ian', 'Salazar', 'Rivera', NULL, '2003-01-28', 'Male', 'Single', 'Sitio Ilaya', 'Brgy. San Jose', '09151112222', 'Norma Rivera', '09151112223'),
(14, 'PT-2026-0014', 'Jocelyn', 'Estrada', 'Magno', NULL, '1988-11-17', 'Female', 'Single', 'Purok 3, Crossing', 'Brgy. San Jose', '09151112224', 'Luz Magno', '09151112225'),
(15, 'PT-2026-0015', 'Kenneth', 'Bernardo', 'De Guzman', NULL, '1992-05-30', 'Male', 'Married', 'Purok 7, Mangga', 'Brgy. San Jose', '09151112226', 'Grace De Guzman', '09151112227'),
(16, 'PT-2026-0016', 'Liza', 'Pineda', 'Manalo', NULL, '1970-04-02', 'Female', 'Widowed', 'Sitio Aplaya', 'Brgy. San Jose', '09151112228', 'Dennis Manalo', '09151112229'),
(17, 'PT-2026-0017', 'Manuel', 'Ortega', 'Domingo', NULL, '1958-08-20', 'Male', 'Married', 'Purok 4, Riverside', 'Brgy. San Jose', '09151112230', 'Rosa Domingo', '09151112231'),
(18, 'PT-2026-0018', 'Noemi', 'Villanueva', 'Santiago', NULL, '1996-02-11', 'Female', 'Married', 'Purok 2, Centro', 'Brgy. San Jose', '09151112232', 'Bryan Santiago', '09151112233'),
(19, 'PT-2026-0019', 'Oscar', 'Gutierrez', 'Padilla', 'III', '2015-09-09', 'Male', 'Child', 'Purok 1, Looban', 'Brgy. San Jose', '09151112234', 'Oscar Padilla Jr.', '09151112234'),
(20, 'PT-2026-0020', 'Patricia', 'Hernandez', 'Cabrera', NULL, '2000-12-22', 'Female', 'Single', 'Sitio Gumamela', 'Brgy. San Jose', '09151112235', 'Alicia Cabrera', '09151112236');

-- 10 Medicines Master List
INSERT INTO `medicines` (`id`, `item_code`, `generic_name`, `brand_name`, `dosage`, `form`, `unit`, `category`, `min_stock_level`, `description`) VALUES
(1, 'MED-001', 'Paracetamol', 'Biogesic', '500mg', 'Tablet', 'pcs', 'Analgesic / Antipyretic', 100, 'For relief of mild to moderate fever and pain'),
(2, 'MED-002', 'Amoxicillin', 'Amoxil', '500mg', 'Capsule', 'pcs', 'Antibiotic', 80, 'For bacterial infections'),
(3, 'MED-003', 'Ibuprofen', 'Medicol', '200mg', 'Tablet', 'pcs', 'NSAID / Anti-inflammatory', 50, 'Relief of pain and inflammation'),
(4, 'MED-004', 'Oral Rehydration Salts (ORS)', 'Hydrite', 'Standard sachet', 'Powder', 'sachet', 'Electrolytes', 60, 'Treatment of dehydration from acute diarrhea'),
(5, 'MED-005', 'Ferrous Sulfate + Folic Acid', 'Fersulfate', '60mg / 400mcg', 'Tablet', 'pcs', 'Antianemic / Maternal', 100, 'Iron supplement for pregnant mothers and anemics'),
(6, 'MED-006', 'Amlodipine', 'Norvasc', '5mg', 'Tablet', 'pcs', 'Antihypertensive', 70, 'Maintenance medication for high blood pressure'),
(7, 'MED-007', 'Metformin', 'Glucophage', '500mg', 'Tablet', 'pcs', 'Antidiabetic', 70, 'Oral blood-glucose lowering maintenance medicine'),
(8, 'MED-008', 'Cetirizine', 'Alnix', '10mg', 'Tablet', 'pcs', 'Antihistamine', 50, 'For allergic rhinitis, hives, and pruritus'),
(9, 'MED-009', 'Salbutamol', 'Ventolin', '2mg/5mL', 'Syrup', 'bottles', 'Bronchodilator', 30, 'For asthma and reversible airway obstruction'),
(10, 'MED-010', 'Co-Amoxiclav', 'Augmentin', '625mg', 'Tablet', 'pcs', 'Antibiotic', 40, 'Broad spectrum antibiotic');

-- Batches for FIFO Testing:
-- Notice: Paracetamol has Batch A (expires in 2027, 50 pcs) and Batch B (expires in 2027, 100 pcs)
-- Also batch 5 has an intentionally near-expiry item (within 20 days) and batch 6 an expired item for system alerts.
INSERT INTO `medicine_batches` (`id`, `medicine_id`, `batch_number`, `quantity_received`, `current_quantity`, `unit_cost`, `supplier`, `date_received`, `expiration_date`) VALUES
(1, 1, 'BATCH-PARA-01', 100, 50, 1.20, 'DOH Central Supply', '2026-01-05', '2027-01-15'),
(2, 1, 'BATCH-PARA-02', 150, 100, 1.25, 'DOH Central Supply', '2026-02-10', '2027-03-20'),
(3, 2, 'BATCH-AMOX-01', 200, 95, 2.50, 'Zuellig Pharma', '2026-01-10', '2027-05-15'),
(4, 3, 'BATCH-IBU-01', 100, 20, 1.80, 'Metro Drug Inc.', '2026-01-15', '2026-11-30'), -- Note: 20 pcs is LOW STOCK (< 50)
(5, 4, 'BATCH-ORS-NEAR', 100, 45, 3.00, 'DOH Regional', '2025-10-01', DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY)), -- Near Expiry (< 30 days)
(6, 5, 'BATCH-FERR-EXP', 80, 40, 1.50, 'DOH Regional', '2024-01-01', DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY)), -- Expired (< today)
(7, 5, 'BATCH-FERR-GOOD', 200, 150, 1.50, 'DOH Central Supply', '2026-01-20', '2027-12-31'),
(8, 6, 'BATCH-AMLO-01', 300, 210, 1.10, 'DOH Non-Comm Program', '2026-02-01', '2027-09-10'),
(9, 7, 'BATCH-MET-01', 250, 180, 1.30, 'DOH Non-Comm Program', '2026-02-01', '2027-09-10'),
(10, 8, 'BATCH-CET-01', 150, 60, 1.75, 'Metro Drug Inc.', '2026-01-25', '2027-04-12');

-- Vaccines
INSERT INTO `vaccines` (`id`, `name`, `target_disease`, `recommended_age`, `doses_required`, `description`) VALUES
(1, 'BCG', 'Tuberculosis', 'At birth', 1, 'Bacillus Calmette-Guerin against childhood TB meningitis'),
(2, 'Hepatitis B', 'Hepatitis B infection', 'Within 24 hours of birth', 1, 'Monovalent HepB birth dose'),
(3, 'Pentavalent (DTP-HepB-Hib)', 'Diphtheria, Tetanus, Pertussis, HepB, Haemophilus influenzae B', '6, 10, 14 weeks', 3, '5-in-1 combo vaccine'),
(4, 'Oral Polio Vaccine (OPV)', 'Poliomyelitis', '6, 10, 14 weeks', 3, 'Trivalent oral drops'),
(5, 'Inactivated Polio Vaccine (IPV)', 'Poliomyelitis', '14 weeks, 9 months', 2, 'Injectable polio vaccine'),
(6, 'Pneumococcal Conjugate Vaccine (PCV)', 'Pneumonia and meningitis', '6, 10, 14 weeks', 3, 'Protects against Streptococcus pneumoniae'),
(7, 'Measles, Mumps, Rubella (MMR)', 'Measles, Mumps, German Measles', '9 months and 12 months', 2, 'Subcutaneous live-attenuated vaccine');

-- Appointments
INSERT INTO `appointments` (`id`, `patient_id`, `appointment_date`, `appointment_time`, `purpose`, `status`, `reminder_sent`, `created_by`) VALUES
(1, 1, CURRENT_DATE, '09:00:00', 'Hypertension BP checkup', 'Scheduled', 1, 2),
(2, 2, CURRENT_DATE, '10:30:00', 'Prenatal 2nd Trimester Consultation', 'Scheduled', 1, 2),
(3, 3, DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), '09:00:00', 'Pentavalent 3rd Dose', 'Scheduled', 0, 2),
(4, 4, DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), '14:00:00', 'Maintenance refill and glucose check', 'Scheduled', 0, 3),
(5, 5, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), '08:30:00', 'Senior Citizen wellness check', 'Completed', 1, 2);

-- Sample Medical Visit Records
INSERT INTO `medical_records` (`id`, `patient_id`, `bhw_id`, `visit_date`, `visit_type`, `chief_complaint`, `blood_pressure`, `temperature`, `weight`, `height`, `pulse_rate`, `respiratory_rate`, `diagnosis`, `treatment`, `notes`) VALUES
(1, 1, 2, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 DAY), 'Consultation', 'Sakit ng ulo at pagkahilo', '140/90', 36.8, 72.5, 168.0, 84, 19, 'Hypertension Stage 1', 'Prescribed Amlodipine 5mg OD, low-salt diet recommended', 'Advised to return in 2 weeks for follow-up BP check'),
(2, 6, 3, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY), 'Consultation', 'Mataas na lagnat at ubo 3 araw na', '110/70', 38.6, 60.0, 165.0, 92, 21, 'Acute Upper Respiratory Tract Infection (URTI)', 'Paracetamol 500mg q4h PRN, oral hydration, rest', 'Monitor temperature; seek medical doctor if fever persists > 48h'),
(3, 2, 2, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), 'Prenatal', 'Routine prenatal checkup (24 weeks)', '115/75', 36.5, 58.2, 155.0, 78, 18, 'Normal Pregnancy 24 weeks', 'Ferrous Sulfate + Folic Acid 1 tablet OD', 'Fetal heart tone clear (142 bpm). Advised balanced maternal nutrition');

-- Research Transactions (Mock Data for Pre vs Post turnaround time study)
INSERT INTO `research_transactions` (`phase`, `transaction_type`, `patient_id`, `start_time`, `end_time`, `duration_minutes`, `recorded_by`) VALUES
('PRE_IMPLEMENTATION', 'Manual Patient Record Retrieval & Visit', 1, '2026-01-10 08:00:00', '2026-01-10 08:24:00', 24.00, 2),
('PRE_IMPLEMENTATION', 'Manual Patient Record Retrieval & Visit', 2, '2026-01-10 08:30:00', '2026-01-10 08:52:00', 22.00, 2),
('PRE_IMPLEMENTATION', 'Manual Medicine Inventory Physical Log', NULL, '2026-01-10 13:00:00', '2026-01-10 13:38:00', 38.00, 2),
('POST_IMPLEMENTATION', 'Automated Search & Electronic Visit', 1, '2026-02-15 09:00:00', '2026-02-15 09:06:30', 6.50, 2),
('POST_IMPLEMENTATION', 'Automated Search & Electronic Visit', 6, '2026-02-15 09:10:00', '2026-02-15 09:15:45', 5.75, 3),
('POST_IMPLEMENTATION', 'Automated FIFO Medicine Dispense', 2, '2026-02-15 10:00:00', '2026-02-15 10:03:10', 3.17, 2);

-- Usability Evaluations (ISO 25010 5-point Likert Scale)
INSERT INTO `research_evaluations` (`user_id`, `functional_suitability`, `performance_efficiency`, `usability`, `reliability`, `security_rating`, `overall_satisfaction`, `feedback`) VALUES
(2, 5, 5, 5, 4, 5, 5, 'Mas mabilis maghanap ng pasyente kaysa magbuklat ng makakapal na logbook.'),
(3, 4, 5, 5, 4, 4, 4, 'Very helpful ang FIFO auto-dispense; hindi na kami nanghuhula ng batch.'),
(4, 5, 4, 4, 5, 5, 5, 'The morbidity and demographic reporting matches DOH monthly summary needs.');