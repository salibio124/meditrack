const express = require('express');
const router = express.Router();
const { createMedicalRecord, getAllMedicalRecords } = require('../controllers/medicalController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.get('/', getAllMedicalRecords);
router.post('/', requireRole('Administrator', 'BHW'), createMedicalRecord);

module.exports = router;