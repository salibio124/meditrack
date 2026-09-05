import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Pill, Plus } from 'lucide-react';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    itemCode: '',
    genericName: '',
    brandName: '',
    dosage: '',
    form: 'Tablet',
    unit: 'pcs',
    category: 'Analgesic',
    minStockLevel: 50,
    description: '',
  });

  const loadData = () => {
    setLoading(true);
    api.get('/medicines')
      .then((res) => setMedicines(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medicines', form);
      setShowModal(false);
      setForm({ itemCode: '', genericName: '', brandName: '', dosage: '', form: 'Tablet', unit: 'pcs', category: 'Analgesic', minStockLevel: 50, description: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding medicine master item.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Medicine Master Formulary</h2>
          <p className="text-xs text-slate-500">Official catalog of approved essential medicines and standard minimum levels</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow"
        >
          <Plus className="w-4 h-4" />
          <span>New Medicine Item</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
            <tr>
              <th className="p-3.5">Item Code</th>
              <th className="p-3.5">Generic Name</th>
              <th className="p-3.5">Brand</th>
              <th className="p-3.5">Dosage / Form</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Min Stock</th>
              <th className="p-3.5">Available Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading master formulary...</td></tr>
            ) : medicines.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-mono font-semibold text-slate-600">{m.item_code}</td>
                <td className="p-3.5 font-bold text-slate-900">{m.generic_name}</td>
                <td className="p-3.5 text-slate-600">{m.brand_name || '-'}</td>
                <td className="p-3.5 text-slate-700">{m.dosage} • {m.form}</td>
                <td className="p-3.5 text-slate-600">{m.category}</td>
                <td className="p-3.5 text-slate-500">{m.min_stock_level} {m.unit}</td>
                <td className="p-3.5 font-bold text-emerald-700">{m.total_stock} {m.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Medicine Master Item</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Item Code *</label>
                  <input
                    required
                    type="text"
                    placeholder="MED-011"
                    value={form.itemCode}
                    onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <input
                    required
                    type="text"
                    placeholder="Antibiotic"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Generic Name *</label>
                <input
                  required
                  type="text"
                  placeholder="Mefenamic Acid"
                  value={form.genericName}
                  onChange={(e) => setForm({ ...form, genericName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="Ponstan"
                    value={form.brandName}
                    onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosage *</label>
                  <input
                    required
                    type="text"
                    placeholder="500mg"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Form</label>
                  <input
                    type="text"
                    placeholder="Capsule"
                    value={form.form}
                    onChange={(e) => setForm({ ...form, form: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Minimum Stock Level</label>
                  <input
                    type="number"
                    value={form.minStockLevel}
                    onChange={(e) => setForm({ ...form, minStockLevel: parseInt(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}