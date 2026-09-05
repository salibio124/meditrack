const express = require('express');
const router = express.Router();
const { getSmsLogs, sendCustomSms } = require('../controllers/smsController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.get('/logs', requireRole('Administrator'), getSmsLogs);
router.post('/send', requireRole('Administrator'), sendCustomSms);

module.exports = router;