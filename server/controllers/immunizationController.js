const db = require('../config/db');
const { sendSMS } = require('../services/smsService');

const getVaccines = async (req, res) => {
  try {
    const [vaccines] = await db.query(`SELECT * FROM vaccines ORDER BY id ASC`);
    return res.json({ success: true, data: vaccines });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not fetch vaccines.' });
  }
};

const getImmunizations = async (req, res) => {
  try {
    const [records] = await db.query(
      `SELECT imm.*, v.name as vaccine_name, v.target_disease,
              p.first_name, p.last_name, p.patient_code, p.contact_number,
              u.full_name as administered_by_name
       FROM immunizations imm
       JOIN vaccines v ON imm.vaccine_id = v.id
       JOIN patients p ON imm.patient_id = p.id
       JOIN users u ON imm.administered_by = u.id
       ORDER BY imm.date_administered DESC`
    );
    return res.json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not fetch immunizations.' });
  }
};

const recordImmunization = async (req, res) => {
  try {
    const { patientId, vaccineId, doseNumber, dateAdministered, nextScheduledDate, notes } = req.body;
    await db.query(
      `INSERT INTO immunizations (patient_id, vaccine_id, dose_number, date_administered, next_scheduled_date, administered_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patientId, vaccineId, doseNumber, dateAdministered, nextScheduledDate || null, req.user.id, notes || null]
    );
    return res.status(201).json({ success: true, message: 'Immunization recorded.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to record.' });
  }
};

const sendImmunizationReminder = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT imm.*, v.name as vaccine_name, p.first_name, p.contact_number
       FROM immunizations imm
       JOIN vaccines v ON imm.vaccine_id = v.id
       JOIN patients p ON imm.patient_id = p.id
       WHERE imm.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Record not found.' });

    const entry = rows[0];
    const msg = `MediTrack Reminder: Scheduled immunization for ${entry.first_name} (${entry.vaccine_name}) is on ${entry.next_scheduled_date}. Please bring baby book.`;
    await sendSMS({ recipientPhone: entry.contact_number, message: msg, smsType: 'Immunization Reminder', sentBy: req.user.id });
    await db.query(`UPDATE immunizations SET reminder_sent = 1 WHERE id = ?`, [req.params.id]);

    return res.json({ success: true, message: 'Immunization reminder sent.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send SMS.' });
  }
};

module.exports = { getVaccines, getImmunizations, recordImmunization, sendImmunizationReminder };