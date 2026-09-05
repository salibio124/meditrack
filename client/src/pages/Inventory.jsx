import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Boxes, Plus, CheckCircle, AlertTriangle, Clock, RefreshCw, Send } from 'lucide-react';

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [batches, setBatches] = useState([]);

  // Dispense Form State
  const [dispenseForm, setDispenseForm] = useState({
    patientId: '',
    medicineId: '',
    quantity: 1,
    instructions: '',
  });

  // Physical Count Form State
  const [countForm, setCountForm] = useState({
    batchId: '',
    physicalQuantity: 0,
    remarks: 'Weekly physical audit check',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/medicines'), api.get('/patients')])
      .then(([medRes, patRes]) => {
        setMedicines(medRes.data.data);
        setPatients(patRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBatches = async (med) => {
    setSelectedMed(med);
    try {
      const res = await api.get(`/medicines/${med.id}/batches`);
      setBatches(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patientId: dispenseForm.patientId,
        instructions: dispenseForm.instructions,
        items: [{ medicineId: dispenseForm.medicineId, quantity: dispenseForm.quantity }],
      };
      await api.post('/inventory/dispense', payload);
      alert('FIFO Dispensation Complete! Oldest valid batches deducted automatically.');
      setShowDispenseModal(false);
      setDispenseForm({ patientId: '', medicineId: '', quantity: 1, instructions: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Dispensation failed.');
    }
  };

  const handleCount = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/count', countForm);
      alert(`Inventory audit recorded! Discrepancy: ${res.data.discrepancy} units`);
      setShowCountModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Count logging failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Medicine Inventory & FIFO Dispensing</h2>
          <p className="text-xs text-slate-500">Automated First-In, First-Out batch deduction and discrepancy monitoring</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDispenseModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispense Medicine (FIFO)</span>
          </button>
        </div>
      </div>

      {/* MEDICINE INVENTORY LIST */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
            <tr>
              <th className="p-3.5">Code</th>
              <th className="p-3.5">Generic & Brand Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Usable Stock</th>
              <th className="p-3.5">Min Threshold</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading inventory master...</td></tr>
            ) : medicines.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-mono font-semibold text-slate-700">{m.item_code}</td>
                <td className="p-3.5 font-bold text-slate-800">
                  {m.generic_name} <span className="text-slate-400 font-normal">({m.brand_name || m.dosage})</span>
                </td>
                <td className="p-3.5 text-slate-600">{m.category}</td>
                <td className="p-3.5 font-bold text-slate-900">{m.total_stock} {m.unit}</td>
                <td className="p-3.5 text-slate-500">{m.min_stock_level} {m.unit}</td>
                <td className="p-3.5">
                  {m.stock_status === 'OUT_OF_STOCK' && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[10px]">Out of Stock</span>
                  )}
                  {m.stock_status === 'LOW_STOCK' && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">Low Stock</span>
                  )}
                  {m.stock_status === 'IN_STOCK' && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">Optimal</span>
                  )}
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => handleOpenBatches(m)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs transition"
                  >
                    View Batches
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BATCH DETAILS DRAWER / MODAL */}
      {selectedMed && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Batches for: {selectedMed.generic_name}</h3>
                <p className="text-xs text-slate-400">Strict FIFO order: Expiring soonest batches are deducted first</p>
              </div>
              <button onClick={() => setSelectedMed(null)} className="text-xs text-slate-400 hover:text-slate-700">Close</button>
            </div>

            <table className="w-full text-left text-xs mb-4">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Batch No.</th>
                  <th className="p-2.5">Received</th>
                  <th className="p-2.5">Expiry Date</th>
                  <th className="p-2.5">Remaining Stock</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Physical Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.length === 0 ? (
                  <tr><td colSpan="6" className="p-4 text-center text-slate-400">No batches on file.</td></tr>
                ) : (
                  batches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-slate-800">{b.batch_number}</td>
                      <td className="p-2.5 text-slate-500">{b.date_received}</td>
                      <td className="p-2.5 font-medium text-slate-700">{b.expiration_date}</td>
                      <td className="p-2.5 font-bold text-emerald-700">{b.current_quantity}</td>
                      <td className="p-2.5">
                        {b.days_until_expiry < 0 ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-semibold">Expired</span>
                        ) : b.days_until_expiry <= 30 ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold">Expires Soon</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-semibold">Valid</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => {
                            setCountForm({ batchId: b.id, physicalQuantity: b.current_quantity, remarks: 'Audit count' });
                            setShowCountModal(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]"
                        >
                          Audit Count
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPENSE MODAL */}
      {showDispenseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Dispense Medicine (FIFO)</h3>
            <form onSubmit={handleDispense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={dispenseForm.patientId}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, patientId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.patient_code} - {p.last_name}, {p.first_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medicine *</label>
                <select
                  required
                  value={dispenseForm.medicineId}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, medicineId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Choose Medicine --</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>{m.generic_name} ({m.dosage}) - Available: {m.total_stock}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity to Dispense *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={dispenseForm.quantity}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, quantity: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prescription / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. 1 tablet every 8 hours after meals"
                  value={dispenseForm.instructions}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, instructions: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDispenseModal(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                >
                  Confirm Dispense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHYSICAL COUNT AUDIT MODAL */}
      {showCountModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Record Physical Inventory Count</h3>
            <form onSubmit={handleCount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Counted Quantity</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={countForm.physicalQuantity}
                  onChange={(e) => setCountForm({ ...countForm, physicalQuantity: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={countForm.remarks}
                  onChange={(e) => setCountForm({ ...countForm, remarks: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCountModal(false)}
                  className="px-3 py-1.5 text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg"
                >
                  Submit Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}