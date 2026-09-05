const express = require('express');
const router = express.Router();
const { getVaccines, getImmunizations, recordImmunization, sendImmunizationReminder } = require('../controllers/immunizationController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.get('/', getImmunizations);
router.get('/vaccines', getVaccines);
router.post('/', requireRole('Administrator', 'BHW'), recordImmunization);
router.post('/:id/remind', requireRole('Administrator', 'BHW'), sendImmunizationReminder);

module.exports = router;