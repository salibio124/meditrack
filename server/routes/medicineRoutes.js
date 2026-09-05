const express = require('express');
const router = express.Router();
const { getAllMedicines, createMedicine, getMedicineBatches, addBatch } = require('../controllers/medicineController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.get('/', getAllMedicines);
router.post('/', requireRole('Administrator'), createMedicine);
router.get('/:id/batches', getMedicineBatches);
router.post('/:id/batches', requireRole('Administrator'), addBatch);

module.exports = router;