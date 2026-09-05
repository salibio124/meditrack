const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointmentStatus, sendAppointmentReminder } = require('../controllers/appointmentController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.get('/', getAppointments);
router.post('/', requireRole('Administrator', 'BHW'), createAppointment);
router.patch('/:id/status', requireRole('Administrator', 'BHW'), updateAppointmentStatus);
router.post('/:id/remind', requireRole('Administrator', 'BHW'), sendAppointmentReminder);

module.exports = router;