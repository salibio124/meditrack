const express = require('express');
const router = express.Router();
const { getResearchMetrics, recordResearchTransaction, submitEvaluation } = require('../controllers/researchController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/metrics', getResearchMetrics);
router.post('/transaction', recordResearchTransaction);
router.post('/evaluation', submitEvaluation);

module.exports = router;