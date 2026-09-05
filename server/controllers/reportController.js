const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalPatients }]] = await db.query(`SELECT COUNT(*) as totalPatients FROM patients WHERE is_archived = 0`);
    const [[{ patientsServedToday }]] = await db.query(`SELECT COUNT(DISTINCT patient_id) as patientsServedToday FROM medical_records WHERE DATE(visit_date) = CURRENT_DATE`);
    const [[{ appointmentsToday }]] = await db.query(`SELECT COUNT(*) as appointmentsToday FROM appointments WHERE appointment_date = CURRENT_DATE`);
    const [[{ lowStockCount }]] = await db.query(`
      SELECT COUNT(*) as lowStockCount FROM (
        SELECT m.id, COALESCE(SUM(b.current_quantity), 0) as stock, m.min_stock_level
        FROM medicines m
        LEFT JOIN medicine_batches b ON m.id = b.medicine_id AND b.expiration_date >= CURRENT_DATE
        WHERE m.is_active = 1 GROUP BY m.id HAVING stock <= m.min_stock_level
      ) as low_table`);
    const [[{ expiringSoonCount }]] = await db.query(`
      SELECT COUNT(*) as expiringSoonCount FROM medicine_batches 
      WHERE current_quantity > 0 AND expiration_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)`);
    const [[{ expiredCount }]] = await db.query(`
      SELECT COUNT(*) as expiredCount FROM medicine_batches 
      WHERE current_quantity > 0 AND expiration_date < CURRENT_DATE`);
    const [[{ dispensedToday }]] = await db.query(`
      SELECT COALESCE(SUM(quantity), 0) as dispensedToday FROM inventory_transactions 
      WHERE transaction_type = 'DISPENSE' AND DATE(created_at) = CURRENT_DATE`);

    const [visitTrend] = await db.query(`
      SELECT DATE(visit_date) as visit_day, COUNT(*) as total_visits
      FROM medical_records WHERE visit_date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
      GROUP BY DATE(visit_date) ORDER BY visit_day ASC`);

    const [topMorbidity] = await db.query(`
      SELECT diagnosis, COUNT(*) as cases FROM medical_records GROUP BY diagnosis ORDER BY cases DESC LIMIT 5`);

    return res.json({
      success: true,
      data: { totalPatients, patientsServedToday, appointmentsToday, lowStockCount, expiringSoonCount, expiredCount, dispensedToday, visitTrend, topMorbidity }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Could not load stats.' });
  }
};

const getDemographicsReport = async (req, res) => {
  try {
    const [bySex] = await db.query(`SELECT sex, COUNT(*) as count FROM patients WHERE is_archived = 0 GROUP BY sex`);
    const [byAge] = await db.query(`
      SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 5 THEN 'Infants (0-4)'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 5 AND 12 THEN 'Children (5-12)'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 13 AND 19 THEN 'Teens (13-19)'
          WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 20 AND 59 THEN 'Adults (20-59)'
          ELSE 'Seniors (60+)'
        END AS age_bracket, COUNT(*) as count
      FROM patients WHERE is_archived = 0 GROUP BY age_bracket`);
    const [byCivilStatus] = await db.query(`SELECT civil_status, COUNT(*) as count FROM patients WHERE is_archived = 0 GROUP BY civil_status`);

    return res.json({ success: true, data: { bySex, byAge, byCivilStatus } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Demographics error.' });
  }
};

const getMorbidityReport = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT diagnosis, COUNT(*) as total_cases FROM medical_records GROUP BY diagnosis ORDER BY total_cases DESC`);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Morbidity error.' });
  }
};

const getInventoryStatusReport = async (req, res) => {
  try {
    const [report] = await db.query(`
      SELECT m.id, m.item_code, m.generic_name, m.brand_name, m.dosage, m.category, m.min_stock_level,
             COALESCE(SUM(CASE WHEN b.expiration_date >= CURRENT_DATE THEN b.current_quantity ELSE 0 END), 0) AS usable_stock,
             COALESCE(SUM(CASE WHEN b.expiration_date < CURRENT_DATE THEN b.current_quantity ELSE 0 END), 0) AS expired_stock,
             COALESCE(SUM(CASE WHEN b.expiration_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) THEN b.current_quantity ELSE 0 END), 0) AS near_expiry_stock
      FROM medicines m LEFT JOIN medicine_batches b ON m.id = b.medicine_id WHERE m.is_active = 1 GROUP BY m.id ORDER BY m.generic_name ASC`);
    return res.json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Inventory status error.' });
  }
};

module.exports = { getDashboardStats, getDemographicsReport, getMorbidityReport, getInventoryStatusReport };