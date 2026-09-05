const db = require('../config/db');
const { logAudit } = require('../services/auditService');

const getAllPatients = async (req, res) => {
  try {
    const { search = '', barangay = '', includeArchived = 'false' } = req.query;
    let query = `
      SELECT id, patient_code, first_name, middle_name, last_name, suffix,
             date_of_birth, TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) AS age,
             sex, civil_status, address, barangay, contact_number,
             emergency_contact_name, emergency_contact_number, is_archived, created_at
      FROM patients WHERE 1=1
    `;
    const params = [];

    if (includeArchived !== 'true') query += ' AND is_archived = 0';

    if (search.trim()) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR patient_code LIKE ? OR contact_number LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (barangay.trim()) {
      query += ' AND barangay = ?';
      params.push(barangay.trim());
    }

    query += ' ORDER BY last_name ASC, first_name ASC';
    const [patients] = await db.query(query, params);
    return res.json({ success: true, data: patients });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch patients.' });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patientId = req.params.id;
    const [patient] = await db.query(
      `SELECT *, TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) AS age FROM patients WHERE id = ?`,
      [patientId]
    );

    if (patient.length === 0) return res.status(404).json({ success: false, message: 'Patient not found.' });

    const [medicalRecords] = await db.query(
      `SELECT mr.*, u.full_name as attending_bhw
       FROM medical_records mr
       JOIN users u ON mr.bhw_id = u.id
       WHERE mr.patient_id = ? ORDER BY mr.visit_date DESC`,
      [patientId]
    );

    const [appointments] = await db.query(
      `SELECT a.*, u.full_name as creator_name
       FROM appointments a
       JOIN users u ON a.created_by = u.id
       WHERE a.patient_id = ? ORDER BY a.appointment_date DESC`,
      [patientId]
    );

    const [immunizations] = await db.query(
      `SELECT imm.*, v.name as vaccine_name, v.target_disease, u.full_name as administered_by_name
       FROM immunizations imm
       JOIN vaccines v ON imm.vaccine_id = v.id
       JOIN users u ON imm.administered_by = u.id
       WHERE imm.patient_id = ? ORDER BY imm.date_administered DESC`,
      [patientId]
    );

    const [dispensations] = await db.query(
      `SELECT md.*, u.full_name as dispensed_by_name,
              it.medicine_id, m.generic_name, m.brand_name, m.dosage, it.quantity, b.batch_number
       FROM medicine_dispensations md
       JOIN users u ON md.dispensed_by = u.id
       LEFT JOIN inventory_transactions it ON md.id = it.dispensation_id
       LEFT JOIN medicines m ON it.medicine_id = m.id
       LEFT JOIN medicine_batches b ON it.batch_id = b.id
       WHERE md.patient_id = ? ORDER BY md.dispense_date DESC`,
      [patientId]
    );

    return res.json({
      success: true,
      data: { profile: patient[0], medicalRecords, appointments, immunizations, dispensations }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch patient profile.' });
  }
};

const createPatient = async (req, res) => {
  try {
    const { firstName, middleName, lastName, suffix, dateOfBirth, sex, civilStatus, address, barangay, contactNumber, emergencyContactName, emergencyContactNumber } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !sex || !address || !contactNumber) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM patients`);
    const nextSeq = String(countRows[0].total + 1).padStart(4, '0');
    const patientCode = `PT-${new Date().getFullYear()}-${nextSeq}`;

    const [result] = await db.query(
      `INSERT INTO patients 
       (patient_code, first_name, middle_name, last_name, suffix, date_of_birth, sex, civil_status, address, barangay, contact_number, emergency_contact_name, emergency_contact_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientCode, firstName.trim(), middleName ? middleName.trim() : null, lastName.trim(), suffix || null, dateOfBirth, sex, civilStatus || 'Single', address.trim(), barangay || 'Barangay Health Center Zone', contactNumber.trim(), emergencyContactName || null, emergencyContactNumber || null]
    );

    await logAudit({
      userId: req.user.id,
      action: 'PATIENT_CREATE',
      module: 'PATIENTS',
      recordId: result.insertId,
      details: `Registered patient ${patientCode}`,
      ipAddress: req.ip
    });

    return res.status(201).json({ success: true, message: 'Patient registered.', data: { id: result.insertId, patientCode } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { firstName, middleName, lastName, suffix, dateOfBirth, sex, civilStatus, address, barangay, contactNumber, emergencyContactName, emergencyContactNumber } = req.body;

    await db.query(
      `UPDATE patients SET 
       first_name = ?, middle_name = ?, last_name = ?, suffix = ?, date_of_birth = ?,
       sex = ?, civil_status = ?, address = ?, barangay = ?, contact_number = ?,
       emergency_contact_name = ?, emergency_contact_number = ?
       WHERE id = ?`,
      [firstName, middleName || null, lastName, suffix || null, dateOfBirth, sex, civilStatus, address, barangay, contactNumber, emergencyContactName || null, emergencyContactNumber || null, patientId]
    );

    await logAudit({
      userId: req.user.id,
      action: 'PATIENT_UPDATE',
      module: 'PATIENTS',
      recordId: patientId,
      details: `Updated patient #${patientId}`,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Patient updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Update failed.' });
  }
};

const toggleArchivePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const [patient] = await db.query(`SELECT is_archived FROM patients WHERE id = ?`, [patientId]);
    if (patient.length === 0) return res.status(404).json({ success: false, message: 'Patient not found.' });

    const newStatus = patient[0].is_archived === 1 ? 0 : 1;
    await db.query(`UPDATE patients SET is_archived = ? WHERE id = ?`, [newStatus, patientId]);

    return res.json({ success: true, message: `Patient ${newStatus === 1 ? 'archived' : 'restored'}.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Archive failed.' });
  }
};

const deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const [patient] = await db.query(`SELECT patient_code, first_name, last_name FROM patients WHERE id = ?`, [patientId]);
    if (patient.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    await db.query(`DELETE FROM patients WHERE id = ?`, [patientId]);

    await logAudit({
      userId: req.user.id,
      action: 'PATIENT_DELETE',
      module: 'PATIENTS',
      recordId: patientId,
      details: `Deleted patient ${patient[0].patient_code} (${patient[0].first_name} ${patient[0].last_name})`,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Patient deleted successfully.' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete patient.' });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  toggleArchivePatient,
  deletePatient
};