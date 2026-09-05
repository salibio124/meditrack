const db = require('../config/db');

const getAuditLogs = async (req, res) => {
  try {
    const [logs] = await db.query(
      `SELECT a.*, u.username, u.full_name, r.name as role_name
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY a.created_at DESC LIMIT 100`
    );
    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
};

module.exports = { getAuditLogs };