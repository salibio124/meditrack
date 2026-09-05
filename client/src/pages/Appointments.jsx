import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Plus, MessageSquare, Check, X } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: '',
    appointmentTime: '09:00',
    purpose: 'Routine Health Consultation',
    notes: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/appointments'), api.get('/patients')])
      .then(([appRes, patRes]) => {
        setAppointments(appRes.data.data);
        setPatients(patRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', formData);
      setShowModal(false);
      setFormData({ patientId: '', appointmentDate: '', appointmentTime: '09:00', purpose: '', notes: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling appointment.');
    }
  };

  const handleSendReminder = async (id) => {
    try {
      await api.post(`/appointments/${id}/remind`);
      alert('SMS reminder sent to patient phone!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send SMS.');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Appointments & Scheduling</h2>
          <p className="text-xs text-slate-500">Manage patient visits and trigger automated SMS alerts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
            <tr>
              <th className="p-3.5">Schedule</th>
              <th className="p-3.5">Patient</th>
              <th className="p-3.5">Contact No.</th>
              <th className="p-3.5">Purpose</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">SMS Reminder</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading appointments...</td></tr>
            ) : appointments.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-semibold text-slate-800">
                  {a.appointment_date} <span className="text-slate-400 font-normal">@ {a.appointment_time}</span>
                </td>
                <td className="p-3.5 font-bold text-slate-900">{a.last_name}, {a.first_name}</td>
                <td className="p-3.5 text-slate-600">{a.contact_number}</td>
                <td className="p-3.5 text-slate-700">{a.purpose}</td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    a.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    a.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => handleSendReminder(a.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      a.reminder_sent ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{a.reminder_sent ? 'Resend SMS' : 'Send SMS'}</span>
                  </button>
                </td>
                <td className="p-3.5 text-right space-x-1">
                  {a.status === 'Scheduled' && (
                    <>
                      <button
                        onClick={() => handleStatus(a.id, 'Completed')}
                        title="Mark Completed"
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatus(a.id, 'Cancelled')}
                        title="Cancel Appointment"
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* APPOINTMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Book New Appointment</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient *</label>
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time *</label>
                  <input
                    required
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Hypertension Checkup, Prenatal 2nd Trimester"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}