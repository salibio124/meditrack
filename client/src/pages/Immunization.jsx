import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Plus, MessageSquare } from 'lucide-react';

export default function Immunization() {
  const [immunizations, setImmunizations] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    vaccineId: '',
    doseNumber: 1,
    dateAdministered: '',
    nextScheduledDate: '',
    notes: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/immunizations'), api.get('/immunizations/vaccines'), api.get('/patients')])
      .then(([immRes, vacRes, patRes]) => {
        setImmunizations(immRes.data.data);
        setVaccines(vacRes.data.data);
        setPatients(patRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecord = async (e) => {
    e.preventDefault();
    try {
      await api.post('/immunizations', formData);
      setShowModal(false);
      setFormData({ patientId: '', vaccineId: '', doseNumber: 1, dateAdministered: '', nextScheduledDate: '', notes: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording immunization.');
    }
  };

  const handleRemind = async (id) => {
    try {
      await api.post(`/immunizations/${id}/remind`);
      alert('SMS reminder sent to parent!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch reminder.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Maternal & Child Immunization Program</h2>
          <p className="text-xs text-slate-500">BCG, Polio, Pentavalent, MMR tracking with automated SMS reminders</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Record Vaccine Dose</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
            <tr>
              <th className="p-3.5">Patient</th>
              <th className="p-3.5">Vaccine</th>
              <th className="p-3.5">Dose</th>
              <th className="p-3.5">Date Given</th>
              <th className="p-3.5">Next Due Date</th>
              <th className="p-3.5">Administered By</th>
              <th className="p-3.5 text-right">SMS Reminder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading vaccine schedules...</td></tr>
            ) : immunizations.map((imm) => (
              <tr key={imm.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">{imm.last_name}, {imm.first_name}</td>
                <td className="p-3.5 font-semibold text-emerald-800">{imm.vaccine_name}</td>
                <td className="p-3.5 text-slate-700 font-semibold">Dose #{imm.dose_number}</td>
                <td className="p-3.5 text-slate-600">{imm.date_administered}</td>
                <td className="p-3.5 font-bold text-blue-700">{imm.next_scheduled_date || 'None'}</td>
                <td className="p-3.5 text-slate-500">{imm.administered_by_name}</td>
                <td className="p-3.5 text-right">
                  {imm.next_scheduled_date ? (
                    <button
                      onClick={() => handleRemind(imm.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-medium transition"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Send Alert</span>
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* IMMUNIZATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Record Vaccine Administration</h3>
            <form onSubmit={handleRecord} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Child / Infant *</label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.patient_code} - {p.last_name}, {p.first_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vaccine *</label>
                <select
                  required
                  value={formData.vaccineId}
                  onChange={(e) => setFormData({ ...formData, vaccineId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Choose Vaccine --</option>
                  {vaccines.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.target_disease})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dose Number *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.doseNumber}
                    onChange={(e) => setFormData({ ...formData, doseNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date Given *</label>
                  <input
                    required
                    type="date"
                    value={formData.dateAdministered}
                    onChange={(e) => setFormData({ ...formData, dateAdministered: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Scheduled Dose Date</label>
                <input
                  type="date"
                  value={formData.nextScheduledDate}
                  onChange={(e) => setFormData({ ...formData, nextScheduledDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
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
                  Save Vaccine Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}