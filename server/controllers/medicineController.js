const db = require('../config/db');
const { logAudit } = require('../services/auditService');

const getAllMedicines = async (req, res) => {
  try {
    const [medicines] = await db.query(
      `SELECT m.*,
              COALESCE(SUM(b.current_quantity), 0) AS total_stock,
              CASE 
                WHEN COALESCE(SUM(b.current_quantity), 0) = 0 THEN 'OUT_OF_STOCK'
                WHEN COALESCE(SUM(b.current_quantity), 0) <= m.min_stock_level THEN 'LOW_STOCK'
                ELSE 'IN_STOCK'
              END AS stock_status
       FROM medicines m
       LEFT JOIN medicine_batches b ON m.id = b.medicine_id AND b.expiration_date >= CURRENT_DATE
       WHERE m.is_active = 1
       GROUP BY m.id
       ORDER BY m.generic_name ASC`
    );
    return res.json({ success: true, data: medicines });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch medicines.' });
  }
};

const createMedicine = async (req, res) => {
  try {
    const { itemCode, genericName, brandName, dosage, form, unit, category, minStockLevel, description } = req.body;
    const [result] = await db.query(
      `INSERT INTO medicines (item_code, generic_name, brand_name, dosage, form, unit, category, min_stock_level, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemCode, genericName, brandName || null, dosage, form, unit, category, minStockLevel || 50, description || null]
    );

    return res.status(201).json({ success: true, message: 'Medicine added.', data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Could not add medicine.' });
  }
};

const getMedicineBatches = async (req, res) => {
  try {
    const [batches] = await db.query(
      `SELECT b.*, DATEDIFF(b.expiration_date, CURRENT_DATE) as days_until_expiry
       FROM medicine_batches b
       WHERE b.medicine_id = ?
       ORDER BY b.expiration_date ASC`,
      [req.params.id]
    );
    return res.json({ success: true, data: batches });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch batches.' });
  }
};

const addBatch = async (req, res) => {
  try {
    const medicineId = req.params.id;
    const { batchNumber, quantityReceived, unitCost, supplier, dateReceived, expirationDate } = req.body;
    const qty = parseInt(quantityReceived, 10);

    const [batchResult] = await db.query(
      `INSERT INTO medicine_batches 
       (medicine_id, batch_number, quantity_received, current_quantity, unit_cost, supplier, date_received, expiration_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [medicineId, batchNumber, qty, qty, unitCost || 0.0, supplier || null, dateReceived, expirationDate]
    );

    await db.query(
      `INSERT INTO inventory_transactions (medicine_id, batch_id, transaction_type, quantity, balance_after, user_id, notes)
       VALUES (?, ?, 'RECEIVE', ?, ?, ?, ?)`,
      [medicineId, batchResult.insertId, qty, qty, req.user.id, `Received Batch ${batchNumber}`]
    );

    return res.status(201).json({ success: true, message: 'Batch added successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Could not add batch.' });
  }
};

module.exports = { getAllMedicines, createMedicine, getMedicineBatches, addBatch };