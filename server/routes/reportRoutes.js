const express = require('express');
const router = express.Router();
const { getDashboardStats, getDemographicsReport, getMorbidityReport, getInventoryStatusReport } = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/dashboard', getDashboardStats);
router.get('/demographics', getDemographicsReport);
router.get('/morbidity', getMorbidityReport);
router.get('/inventory', getInventoryStatusReport);

module.exports = router;