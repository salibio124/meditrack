const db = require('../config/db');

const logAudit = async ({ userId = null, action, module, recordId = null, details = null, ipAddress = null }) => {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
    await db.query(
      `INSERT INTO audit_logs (user_id, action, module, record_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, action, module, recordId ? String(recordId) : null, detailsStr, ipAddress]
    );
  } catch (err) {
    console.error('Audit Log failure:', err.message);
  }
};

module.exports = { logAudit };