const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../services/auditService');

const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide credentials.' });
    }

    const [users] = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE (u.username = ? OR u.email = ?)`,
      [usernameOrEmail, usernameOrEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role_name },
      process.env.JWT_SECRET || 'meditrack_ph_super_secure_jwt_secret_key_2026_barangay',
      { expiresIn: '24h' }
    );

    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      module: 'AUTH',
      recordId: user.id,
      details: `User ${user.username} logged in`,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role_name,
        contactNumber: user.contact_number
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Authentication failed.' });
  }
};

const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.full_name,
      role: req.user.role_name,
      contactNumber: req.user.contact_number
    }
  });
};

module.exports = { login, getMe };