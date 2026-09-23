const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { logAudit } = require('../services/auditService');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_-])[A-Za-z\d@$!%*?&#^_-]{8,}$/;

// 1. GET ALL SYSTEM SETTINGS & PROFILE
const getSettings = async (req, res) => {
  try {
    const [[settings]] = await db.query(`SELECT * FROM system_settings WHERE id = 1`);
    
    // Fetch fresh profile data for current user
    const [[userProfile]] = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.contact_number, r.name as role_name
       FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
      [req.user.id]
    );

    return res.json({
      success: true,
      data: {
        settings: settings || {},
        profile: userProfile || {}
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ success: false, message: 'Could not load system settings.' });
  }
};

// 2. UPDATE HEALTH STATION & SYSTEM PREFERENCES (ADMIN ONLY)
const updateSettings = async (req, res) => {
  try {
    const {
      clinicName,
      barangay,
      city,
      province,
      address,
      contactNumber,
      email,
      openingTime,
      closingTime,
      daysOpen,
      autoLogoutEnabled,
      inactivityTimeout,
      twoFactorAuth,
      smsEnabled,
      appointmentReminders,
      lowStockAlerts,
      expiryAlerts,
      immunizationReminders,
      systemNotifications,
      dateFormat,
      timeFormat,
      timezone,
      language,
      defaultDashboardView
    } = req.body;

    await db.query(
      `UPDATE system_settings SET 
       clinic_name = ?, barangay = ?, city = ?, province = ?, address = ?,
       contact_number = ?, email = ?, opening_time = ?, closing_time = ?, days_open = ?,
       auto_logout_enabled = ?, inactivity_timeout = ?, two_factor_auth = ?,
       sms_enabled = ?, appointment_reminders = ?, low_stock_alerts = ?,
       expiry_alerts = ?, immunization_reminders = ?, system_notifications = ?,
       date_format = ?, time_format = ?, timezone = ?, language = ?, default_dashboard_view = ?
       WHERE id = 1`,
      [
        clinicName,
        barangay,
        city,
        province,
        address,
        contactNumber,
        email,
        openingTime,
        closingTime,
        daysOpen,
        autoLogoutEnabled ? 1 : 0,
        parseInt(inactivityTimeout, 10) || 15,
        twoFactorAuth ? 1 : 0,
        smsEnabled ? 1 : 0,
        appointmentReminders ? 1 : 0,
        lowStockAlerts ? 1 : 0,
        expiryAlerts ? 1 : 0,
        immunizationReminders ? 1 : 0,
        systemNotifications ? 1 : 0,
        dateFormat || 'MM/DD/YYYY',
        timeFormat || '12-hour',
        timezone || 'Asia/Manila',
        language || 'English',
        defaultDashboardView || 'Standard'
      ]
    );

    await logAudit({
      userId: req.user.id,
      action: 'SYSTEM_SETTINGS_UPDATE',
      module: 'SETTINGS',
      details: 'Updated health station info & system preferences',
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return res.status(500).json({ success: false, message: 'Failed to update system settings.' });
  }
};

// 3. UPDATE PERSONAL PROFILE
const updateProfile = async (req, res) => {
  try {
    const { fullName, email, contactNumber } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ success: false, message: 'Full name and email are required.' });
    }

    // Check if email taken by someone else
    const [existing] = await db.query(
      `SELECT id FROM users WHERE email = ? AND id != ?`,
      [email.trim().toLowerCase(), req.user.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'This email is already in use by another staff member.' });
    }

    await db.query(
      `UPDATE users SET full_name = ?, email = ?, contact_number = ? WHERE id = ?`,
      [fullName.trim(), email.trim().toLowerCase(), contactNumber ? contactNumber.trim() : null, req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      action: 'PROFILE_UPDATED',
      module: 'SETTINGS',
      details: `User ${req.user.username} updated profile information`,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Profile saved successfully.' });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// 4. CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special character.'
      });
    }

    const [[user]] = await db.query(`SELECT password_hash FROM users WHERE id = ?`, [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [newHash, req.user.id]);

    await logAudit({
      userId: req.user.id,
      action: 'PASSWORD_CHANGED',
      module: 'SECURITY',
      details: 'User successfully updated account password',
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

// 5. BACKUP DATABASE (Dumps SQL Schema + Data for Admin Download)
const backupDatabase = async (req, res) => {
  try {
    const tables = [
      'roles', 'users', 'patients', 'medicines', 'medicine_batches',
      'medical_records', 'medicine_dispensations', 'inventory_transactions',
      'appointments', 'vaccines', 'immunizations', 'inventory_counts',
      'sms_logs', 'audit_logs', 'system_settings'
    ];

    let dumpContent = `-- MediTrack SQL Database Backup\n-- Generated on: ${new Date().toISOString()}\n-- Health Station: Brgy. San Jose\n\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;

    for (const table of tables) {
      const [rows] = await db.query(`SELECT * FROM ${table}`);
      if (rows.length > 0) {
        dumpContent += `-- Data for ${table}\n`;
        const keys = Object.keys(rows[0]).map(k => `\`${k}\``).join(', ');
        for (const row of rows) {
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            return `'${String(val).replace(/'/g, "\\'")}'`;
          }).join(', ');
          dumpContent += `INSERT INTO \`${table}\` (${keys}) VALUES (${values});\n`;
        }
        dumpContent += `\n`;
      }
    }

    dumpContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    await db.query(`UPDATE system_settings SET last_backup_date = NOW() WHERE id = 1`);

    await logAudit({
      userId: req.user.id,
      action: 'DATABASE_BACKUP_DOWNLOAD',
      module: 'BACKUP',
      details: 'Administrator downloaded full system SQL database backup',
      ipAddress: req.ip
    });

    const filename = `meditrack_backup_${new Date().toISOString().slice(0, 10)}.sql`;
    res.setHeader('Content-Type', 'text/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(dumpContent);
  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate database backup.' });
  }
};

// 6. RESTORE DATABASE (Parses uploaded SQL and executes)
const restoreDatabase = async (req, res) => {
  try {
    const { sqlContent } = req.body;
    if (!sqlContent || !sqlContent.trim()) {
      return res.status(400).json({ success: false, message: 'No SQL backup content provided.' });
    }

    const conn = await db.getConnection();
    try {
      await conn.query('SET FOREIGN_KEY_CHECKS = 0');
      const queries = sqlContent.split(/;\s*$/m).filter(q => q.trim().length > 0);
      for (const query of queries) {
        await conn.query(query);
      }
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      conn.release();
    }

    await logAudit({
      userId: req.user.id,
      action: 'DATABASE_RESTORE_EXECUTED',
      module: 'BACKUP',
      details: 'Restored database from SQL backup file',
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Database restored successfully from backup.' });
  } catch (error) {
    console.error('Restore error:', error);
    return res.status(500).json({ success: false, message: 'Restore failed: ' + error.message });
  }
};

// 7. EXPORT CLINIC DATA IN JSON
const exportSystemData = async (req, res) => {
  try {
    const [patients] = await db.query(`SELECT * FROM patients WHERE is_archived = 0`);
    const [records] = await db.query(`SELECT * FROM medical_records`);
    const [medicines] = await db.query(`SELECT * FROM medicines`);
    const [batches] = await db.query(`SELECT * FROM medicine_batches`);
    const [appointments] = await db.query(`SELECT * FROM appointments`);
    const [immunizations] = await db.query(`SELECT * FROM immunizations`);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      clinic: 'Barangay Health Center',
      counts: {
        patients: patients.length,
        consultations: records.length,
        medicines: medicines.length,
        batches: batches.length,
        appointments: appointments.length,
        immunizations: immunizations.length
      },
      data: {
        patients,
        records,
        medicines,
        batches,
        appointments,
        immunizations
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="meditrack_data_export.json"');
    return res.send(JSON.stringify(exportPayload, null, 2));
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ success: false, message: 'Data export failed.' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateProfile,
  changePassword,
  backupDatabase,
  restoreDatabase,
  exportSystemData
};