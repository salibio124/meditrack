const db = require('../config/db');
const { logAudit } = require('../services/auditService');

const createMedicalRecord = async (req, res) => {
  try {
    const { patientId, visitType, chiefComplaint, bloodPressure, temperature, weight, height, pulseRate, respiratoryRate, diagnosis, treatment, notes } = req.body;

    if (!patientId || !visitType || !chiefComplaint || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Please fill in required medical fields.' });
    }

    const [result] = await db.query(
      `INSERT INTO medical_records
       (patient_id, bhw_id, visit_type, chief_complaint, blood_pressure, temperature, weight, height, pulse_rate, respiratory_rate, diagnosis, treatment, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, req.user.id, visitType, chiefComplaint, bloodPressure || null, temperature || null, weight || null, height || null, pulseRate || null, respiratoryRate || null, diagnosis, treatment || null, notes || null]
    );

    await logAudit({
      userId: req.user.id,
      action: 'CONSULTATION_CREATE',
      module: 'MEDICAL_RECORDS',
      recordId: result.insertId,
      details: `Recorded consultation for patient #${patientId}: ${diagnosis}`,
      ipAddress: req.ip
    });

    return res.status(201).json({ success: true, message: 'Medical record created.', data: { recordId: result.insertId } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to create record.' });
  }
};

const getAllMedicalRecords = async (req, res) => {
  try {
    const [records] = await db.query(
      `SELECT mr.*, p.patient_code, p.first_name, p.last_name, u.full_name as attending_bhw
       FROM medical_records mr
       JOIN patients p ON mr.patient_id = p.id
       JOIN users u ON mr.bhw_id = u.id
       ORDER BY mr.visit_date DESC LIMIT 100`
    );
    return res.json({ success: true, data: records });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Could not fetch records.' });
  }
};

module.exports = { createMedicalRecord, getAllMedicalRecords };