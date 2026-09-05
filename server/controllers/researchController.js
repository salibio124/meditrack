const db = require('../config/db');

const getResearchMetrics = async (req, res) => {
  try {
    const [pre] = await db.query(`SELECT duration_minutes FROM research_transactions WHERE phase = 'PRE_IMPLEMENTATION'`);
    const [post] = await db.query(`SELECT duration_minutes FROM research_transactions WHERE phase = 'POST_IMPLEMENTATION'`);

    const calcStats = (data) => {
      if (!data.length) return { count: 0, mean: 0, stdDev: 0 };
      const vals = data.map(d => parseFloat(d.duration_minutes));
      const mean = vals.reduce((a,b)=>a+b, 0) / vals.length;
      const variance = vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (vals.length > 1 ? vals.length - 1 : 1);
      return { count: vals.length, mean: parseFloat(mean.toFixed(2)), stdDev: parseFloat(Math.sqrt(variance).toFixed(2)) };
    };

    const [discrepancies] = await db.query(`SELECT system_quantity, physical_quantity, discrepancy FROM inventory_counts WHERE system_quantity > 0`);
    let totalRate = 0;
    discrepancies.forEach(d => { totalRate += (Math.abs(d.discrepancy) / d.system_quantity) * 100; });
    const averageDiscrepancyRate = discrepancies.length > 0 ? parseFloat((totalRate / discrepancies.length).toFixed(2)) : 0.0;

    const [[evalSummary]] = await db.query(`
      SELECT COUNT(*) as totalRespondents,
             ROUND(AVG(functional_suitability), 2) as avgFunctional,
             ROUND(AVG(performance_efficiency), 2) as avgPerformance,
             ROUND(AVG(usability), 2) as avgUsability,
             ROUND(AVG(reliability), 2) as avgReliability,
             ROUND(AVG(security_rating), 2) as avgSecurity,
             ROUND(AVG(overall_satisfaction), 2) as avgOverall
      FROM research_evaluations`);

    return res.json({
      success: true,
      data: { preStats: calcStats(pre), postStats: calcStats(post), averageDiscrepancyRate, evalSummary, totalCounts: discrepancies.length }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Research metrics error.' });
  }
};

const recordResearchTransaction = async (req, res) => {
  try {
    const { phase, transactionType, patientId, startTime, endTime } = req.body;
    const diffMs = new Date(endTime) - new Date(startTime);
    const durationMinutes = parseFloat((diffMs / (1000 * 60)).toFixed(2));
    await db.query(
      `INSERT INTO research_transactions (phase, transaction_type, patient_id, start_time, end_time, duration_minutes, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [phase, transactionType, patientId || null, startTime, endTime, durationMinutes, req.user.id]
    );
    return res.status(201).json({ success: true, durationMinutes });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not record benchmark.' });
  }
};

const submitEvaluation = async (req, res) => {
  try {
    const { functionalSuitability, performanceEfficiency, usability, reliability, securityRating, overallSatisfaction, feedback } = req.body;
    await db.query(
      `INSERT INTO research_evaluations (user_id, functional_suitability, performance_efficiency, usability, reliability, security_rating, overall_satisfaction, feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, functionalSuitability, performanceEfficiency, usability, reliability, securityRating, overallSatisfaction, feedback || '']
    );
    return res.status(201).json({ success: true, message: 'Usability evaluation saved.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not save evaluation.' });
  }
};

module.exports = { getResearchMetrics, recordResearchTransaction, submitEvaluation };