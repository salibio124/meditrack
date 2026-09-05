const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { logAudit } = require('../services/auditService');

const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.contact_number, u.is_active, u.created_at, r.name as role_name
       FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.full_name ASC`
    );
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

const getRoles = async (req, res) => {
  try {
    const [roles] = await db.query(`SELECT * FROM roles ORDER BY id ASC`);
    return res.json({ success: true, data: roles });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch roles.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { roleId, username, email, password, fullName, contactNumber } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      `INSERT INTO users (role_id, username, email, password_hash, full_name, contact_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [roleId, username, email, hash, fullName, contactNumber || null]
    );

    return res.status(201).json({ success: true, message: 'User created.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'User creation failed.' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT is_active FROM users WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    const newStatus = rows[0].is_active === 1 ? 0 : 1;
    await db.query(`UPDATE users SET is_active = ? WHERE id = ?`, [newStatus, req.params.id]);
    return res.json({ success: true, message: 'Status updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Toggle failed.' });
  }
};

module.exports = { getUsers, getRoles, createUser, toggleUserStatus };