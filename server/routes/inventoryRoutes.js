const express = require('express');
const router = express.Router();
const { dispenseStock, recordPhysicalCount, getInventoryTransactions, getPhysicalCounts } = require('../controllers/inventoryController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(verifyToken);
router.post('/dispense', requireRole('Administrator', 'BHW'), dispenseStock);
router.post('/count', requireRole('Administrator'), recordPhysicalCount);
router.get('/transactions', getInventoryTransactions);
router.get('/counts', getPhysicalCounts);

module.exports = router;