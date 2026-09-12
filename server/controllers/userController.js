const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { logAudit } = require("../services/auditService");
const { sendEmailOTP } = require("../services/emailService");

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_-])[A-Za-z\d@$!%*?&#^_-]{8,}$/;

const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.contact_number, u.is_active, u.created_at, r.name as role_name
       FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.full_name ASC`
    );
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

const getRoles = async (req, res) => {
  try {
    const [roles] = await db.query("SELECT * FROM roles ORDER BY id ASC");
    return res.json({ success: true, data: roles });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch roles." });
  }
};

const requestEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "This email is already registered." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await db.query(
      "INSERT INTO email_otp_verifications (email, otp_code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))",
      [email.trim().toLowerCase(), otpCode]
    );

    await sendEmailOTP(email.trim().toLowerCase(), otpCode);

    return res.json({ success: true, message: "Verification OTP code dispatched to " + email });
  } catch (error) {
    console.error("Error sending Email OTP:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP email." });
  }
};

const createUser = async (req, res) => {
  try {
    const { roleId, username, email, password, fullName, contactNumber, otpCode } = req.body;

    if (!roleId || !username || !email || !password || !fullName || !otpCode) {
      return res.status(400).json({ success: false, message: "All fields including Email OTP are required." });
    }

    const [otpRecords] = await db.query(
      "SELECT * FROM email_otp_verifications WHERE email = ? AND otp_code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email.trim().toLowerCase(), otpCode.trim()]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP code." });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters with uppercase, lowercase, number, and symbol."
      });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE username = ?", [username.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Username already taken." });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      "INSERT INTO users (role_id, username, email, password_hash, full_name, contact_number) VALUES (?, ?, ?, ?, ?, ?)",
      [roleId, username.trim(), email.trim().toLowerCase(), hash, fullName.trim(), contactNumber || null]
    );

    await db.query("DELETE FROM email_otp_verifications WHERE email = ?", [email.trim().toLowerCase()]);

    return res.status(201).json({ success: true, message: "Staff account created successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "User registration failed." });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    if (parseInt(userId, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: "Security rule: You cannot deactivate your own account." });
    }

    const [rows] = await db.query("SELECT is_active, username FROM users WHERE id = ?", [userId]);
    if (!rows.length) return res.status(404).json({ success: false, message: "User not found." });

    const newStatus = rows[0].is_active === 1 ? 0 : 1;
    await db.query("UPDATE users SET is_active = ? WHERE id = ?", [newStatus, userId]);

    return res.json({ success: true, message: "Staff status updated." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Status toggle failed." });
  }
};

module.exports = { getUsers, getRoles, createUser, toggleUserStatus, requestEmailOTP };
