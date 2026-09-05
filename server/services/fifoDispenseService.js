const db = require('../config/db');

const dispenseMedicinesFIFO = async ({ patientId, medicalRecordId, dispensedBy, instructions, items }) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const totalItemsCount = items.reduce((acc, curr) => acc + parseInt(curr.quantity, 10), 0);
    const [dispenseResult] = await connection.query(
      `INSERT INTO medicine_dispensations (patient_id, medical_record_id, dispensed_by, instructions, total_items)
       VALUES (?, ?, ?, ?, ?)`,
      [patientId, medicalRecordId || null, dispensedBy, instructions || '', totalItemsCount]
    );
    const dispensationId = dispenseResult.insertId;

    for (const item of items) {
      const medicineId = parseInt(item.medicineId, 10);
      let quantityNeeded = parseInt(item.quantity, 10);

      if (quantityNeeded <= 0) {
        throw new Error(`Quantity for medicine ID ${medicineId} must be greater than zero.`);
      }

      const [batches] = await connection.query(
        `SELECT id, batch_number, current_quantity, expiration_date
         FROM medicine_batches
         WHERE medicine_id = ? AND current_quantity > 0 AND expiration_date >= CURRENT_DATE
         ORDER BY expiration_date ASC, date_received ASC
         FOR UPDATE`,
        [medicineId]
      );

      const totalAvailable = batches.reduce((sum, b) => sum + b.current_quantity, 0);
      if (totalAvailable < quantityNeeded) {
        const [medRows] = await connection.query(`SELECT generic_name FROM medicines WHERE id = ?`, [medicineId]);
        const medName = medRows[0]?.generic_name || `Medicine #${medicineId}`;
        throw new Error(`Insufficient non-expired stock for "${medName}". Requested: ${quantityNeeded}, Available: ${totalAvailable}`);
      }

      for (const batch of batches) {
        if (quantityNeeded === 0) break;

        const deduct = Math.min(batch.current_quantity, quantityNeeded);
        const newBatchQty = batch.current_quantity - deduct;

        await connection.query(
          `UPDATE medicine_batches SET current_quantity = ? WHERE id = ?`,
          [newBatchQty, batch.id]
        );

        await connection.query(
          `INSERT INTO inventory_transactions 
           (medicine_id, batch_id, dispensation_id, transaction_type, quantity, balance_after, user_id, notes)
           VALUES (?, ?, ?, 'DISPENSE', ?, ?, ?, ?)`,
          [medicineId, batch.id, dispensationId, deduct, newBatchQty, dispensedBy, `FIFO Dispense to Patient #${patientId}`]
        );

        quantityNeeded -= deduct;
      }
    }

    await connection.commit();
    return { success: true, dispensationId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { dispenseMedicinesFIFO };