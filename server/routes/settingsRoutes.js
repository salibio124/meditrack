const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  updateProfile,
  changePassword,
  backupDatabase,
  restoreDatabase,
  exportSystemData
} = require('../controllers/settingsController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

// Read settings & profile (All roles)
router.get('/', getSettings);

// Update personal profile & change password (All roles)
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Clinic Information, Notifications, Security, Preferences (Admin Only)
router.put('/', requireRole('Administrator'), updateSettings);

// Data & Backup (Admin Only)
router.get('/backup', requireRole('Administrator'), backupDatabase);
router.post('/restore', requireRole('Administrator'), restoreDatabase);
router.get('/export', requireRole('Administrator'), exportSystemData);

module.exports = router;