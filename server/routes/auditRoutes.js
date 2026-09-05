const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.get('/', requireRole('Administrator'), getAuditLogs);

module.exports = router;