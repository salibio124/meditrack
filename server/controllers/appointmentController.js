const db = require('../config/db');
const { sendSMS } = require('../services/smsService');

const getAppointments = async (req, res) => {
  try {
    const [appointments] = await db.query(
      `SELECT a.*, p.patient_code, p.first_name, p.last_name, p.contact_number, u.full_name as creator_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON a.created_by = u.id
       ORDER BY a.appointment_date ASC, a.appointment_time ASC`
    );
    return res.json({ success: true, data: appointments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Could not fetch appointments.' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patientId, appointmentDate, appointmentTime, purpose, notes } = req.body;
    await db.query(
      `INSERT INTO appointments (patient_id, appointment_date, appointment_time, purpose, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patientId, appointmentDate, appointmentTime, purpose, notes || null, req.user.id]
    );
    return res.status(201).json({ success: true, message: 'Appointment booked.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Booking failed.' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    await db.query(`UPDATE appointments SET status = ? WHERE id = ?`, [req.body.status, req.params.id]);
    return res.json({ success: true, message: 'Status updated.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

const sendAppointmentReminder = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, p.first_name, p.contact_number FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    const appt = rows[0];
    const msg = `MediTrack Barangay Health Reminder: Kumusta ${appt.first_name}, may schedule po kayong appointment bukas para sa "${appt.purpose}". Salamat!`;
    await sendSMS({ recipientPhone: appt.contact_number, message: msg, smsType: 'Appointment Reminder', sentBy: req.user.id });
    await db.query(`UPDATE appointments SET reminder_sent = 1 WHERE id = ?`, [req.params.id]);

    return res.json({ success: true, message: 'SMS reminder sent.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to send reminder.' });
  }
};

module.exports = { getAppointments, createAppointment, updateAppointmentStatus, sendAppointmentReminder };