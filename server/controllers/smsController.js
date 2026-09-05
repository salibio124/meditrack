const db = require('../config/db');
const { sendSMS } = require('../services/smsService');

const getSmsLogs = async (req, res) => {
  try {
    const [logs] = await db.query(
      `SELECT s.*, u.full_name as sent_by_name FROM sms_logs s LEFT JOIN users u ON s.sent_by = u.id ORDER BY s.created_at DESC LIMIT 100`
    );
    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch SMS logs.' });
  }
};

const sendCustomSms = async (req, res) => {
  try {
    const { recipientPhone, message, smsType } = req.body;
    const result = await sendSMS({ recipientPhone, message, smsType: smsType || 'General Announcement', sentBy: req.user.id });
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send SMS.' });
  }
};

module.exports = { getSmsLogs, sendCustomSms };