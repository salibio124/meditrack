const db = require('../config/db');
const { dispenseMedicinesFIFO } = require('../services/fifoDispenseService');
const { logAudit } = require('../services/auditService');

const dispenseStock = async (req, res) => {
  try {
    const { patientId, medicalRecordId, instructions, items } = req.body;
    const result = await dispenseMedicinesFIFO({
      patientId,
      medicalRecordId,
      dispensedBy: req.user.id,
      instructions,
      items
    });

    await logAudit({
      userId: req.user.id,
      action: 'MEDICINE_DISPENSE',
      module: 'INVENTORY',
      recordId: result.dispensationId,
      details: `FIFO dispense to patient #${patientId}`,
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Medicines dispensed via FIFO.', data: result });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

const recordPhysicalCount = async (req, res) => {
  try {
    const { batchId, physicalQuantity, remarks } = req.body;
    const [batchRows] = await db.query(`SELECT current_quantity FROM medicine_batches WHERE id = ?`, [batchId]);
    if (batchRows.length === 0) return res.status(404).json({ success: false, message: 'Batch not found.' });

    const systemQty = batchRows[0].current_quantity;
    const physQty = parseInt(physicalQuantity, 10);
    const discrepancy = physQty - systemQty;

    await db.query(
      `INSERT INTO inventory_counts (batch_id, system_quantity, physical_quantity, discrepancy, counted_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [batchId, systemQty, physQty, discrepancy, req.user.id, remarks || 'Physical audit count']
    );

    return res.status(201).json({ success: true, message: 'Count recorded.', discrepancy });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Could not record count.' });
  }
};

const getInventoryTransactions = async (req, res) => {
  try {
    const [transactions] = await db.query(
      `SELECT it.*, m.generic_name, m.brand_name, b.batch_number, u.full_name as performed_by
       FROM inventory_transactions it
       JOIN medicines m ON it.medicine_id = m.id
       JOIN medicine_batches b ON it.batch_id = b.id
       JOIN users u ON it.user_id = u.id
       ORDER BY it.created_at DESC LIMIT 100`
    );
    return res.json({ success: true, data: transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch logs.' });
  }
};

const getPhysicalCounts = async (req, res) => {
  try {
    const [counts] = await db.query(
      `SELECT ic.*, b.batch_number, m.generic_name, u.full_name as counted_by_name
       FROM inventory_counts ic
       JOIN medicine_batches b ON ic.batch_id = b.id
       JOIN medicines m ON b.medicine_id = m.id
       JOIN users u ON ic.counted_by = u.id
       ORDER BY ic.count_date DESC`
    );
    return res.json({ success: true, data: counts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch counts.' });
  }
};

module.exports = { dispenseStock, recordPhysicalCount, getInventoryTransactions, getPhysicalCounts };