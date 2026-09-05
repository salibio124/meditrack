const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meditrack_ph_super_secure_jwt_secret_key_2026_barangay');

    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.role_id, r.name as role_name, u.is_active
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.is_active = 1`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token or inactive account.' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;