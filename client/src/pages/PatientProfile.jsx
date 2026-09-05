import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, User, Phone, MapPin, Calendar, HeartPulse, ShieldCheck, Pill, Plus } from 'lucide-react';

export default function PatientProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medical');
  const [showVisitModal, setShowVisitModal] = useState(false);

  // Visit Form State
  const [visitForm, setVisitForm] = useState({
    visitType: 'Consultation',
    chiefComplaint: '',
    bloodPressure: '',
    temperature: '',
    weight: '',
    height: '',
    pulseRate: '',
    respiratoryRate: '',
    diagnosis: '',
    treatment: '',
    notes: '',
  });

  const fetchProfile = () => {
    setLoading(true);
    api.get(`/patients/${id}`)
      .then((res) => setData(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleRecordVisit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medical-records', { ...visitForm, patientId: id });
      setShowVisitModal(false);
      setVisitForm({
        visitType: 'Consultation',
        chiefComplaint: '',
        bloodPressure: '',
        temperature: '',
        weight: '',
        height: '',
        pulseRate: '',
        respiratoryRate: '',
        diagnosis: '',
        treatment: '',
        notes: '',
      });
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording visit.');
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading comprehensive medical record...</div>;
  }

  const { profile, medicalRecords, appointments, immunizations, dispensations } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/patients" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients Directory</span>
        </Link>
        <button
          onClick={() => setShowVisitModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Health Visit</span>
        </button>
      </div>

      {/* PATIENT HEADER CARD */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
            {profile.first_name[0]}{profile.last_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{profile.last_name}, {profile.first_name} {profile.middle_name || ''} {profile.suffix || ''}</h2>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded">{profile.patient_code}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {profile.age} years old • {profile.sex} • {profile.civil_status} • Born: {profile.date_of_birth}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-1 md:border-l md:border-slate-100 md:pl-6">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{profile.contact_number}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{profile.address}, {profile.barangay}</span>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('medical')}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'medical' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Consultations & Visits ({medicalRecords.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('medicines')}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'medicines' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Dispensed Medicines ({dispensations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('immunization')}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'immunization' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Immunizations ({immunizations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'appointments' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments ({appointments.length})</span>
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'medical' && (
        <div className="space-y-3">
          {medicalRecords.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">No medical visits recorded yet.</div>
          ) : (
            medicalRecords.map((rec) => (
              <div key={rec.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{rec.diagnosis}</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-medium rounded">{rec.visit_type}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{new Date(rec.visit_date).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg text-slate-600">
                  <div><strong>BP:</strong> {rec.blood_pressure || 'N/A'}</div>
                  <div><strong>Temp:</strong> {rec.temperature ? `${rec.temperature}°C` : 'N/A'}</div>
                  <div><strong>Weight:</strong> {rec.weight ? `${rec.weight} kg` : 'N/A'}</div>
                  <div><strong>Pulse:</strong> {rec.pulse_rate ? `${rec.pulse_rate} bpm` : 'N/A'}</div>
                </div>
                <p className="text-slate-700"><strong>Chief Complaint:</strong> {rec.chief_complaint}</p>
                {rec.treatment && <p className="text-slate-700"><strong>Treatment:</strong> {rec.treatment}</p>}
                <div className="text-[11px] text-slate-400 pt-1">Attending BHW: {rec.attending_bhw}</div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'medicines' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3">Dispensed Date</th>
                <th className="p-3">Medicine</th>
                <th className="p-3">Batch Number</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Dispensed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dispensations.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-400">No medicines dispensed to this patient.</td></tr>
              ) : (
                dispensations.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3">{new Date(d.dispense_date).toLocaleDateString()}</td>
                    <td className="p-3 font-semibold text-slate-800">{d.generic_name} ({d.dosage})</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{d.batch_number || 'N/A'}</td>
                    <td className="p-3 font-bold text-emerald-700">{d.quantity} pcs</td>
                    <td className="p-3 text-slate-600">{d.dispensed_by_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* RECORD HEALTH VISIT MODAL */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">Record Consultation / Vital Signs</h3>
            <form onSubmit={handleRecordVisit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Visit Type</label>
                <select
                  value={visitForm.visitType}
                  onChange={(e) => setVisitForm({ ...visitForm, visitType: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Prenatal">Prenatal</option>
                  <option value="Postnatal">Postnatal</option>
                  <option value="Immunization">Immunization</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chief Complaint *</label>
                <textarea
                  required
                  rows="2"
                  value={visitForm.chiefComplaint}
                  onChange={(e) => setVisitForm({ ...visitForm, chiefComplaint: e.target.value })}
                  placeholder="e.g. Mataas na lagnat, ubo, masakit ang tiyan"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={visitForm.bloodPressure}
                    onChange={(e) => setVisitForm({ ...visitForm, bloodPressure: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={visitForm.temperature}
                    onChange={(e) => setVisitForm({ ...visitForm, temperature: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="65"
                    value={visitForm.weight}
                    onChange={(e) => setVisitForm({ ...visitForm, weight: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    placeholder="75"
                    value={visitForm.pulseRate}
                    onChange={(e) => setVisitForm({ ...visitForm, pulseRate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Diagnosis *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Acute URTI, Hypertension Stage 1"
                  value={visitForm.diagnosis}
                  onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Treatment / Recommendations</label>
                <textarea
                  rows="2"
                  value={visitForm.treatment}
                  onChange={(e) => setVisitForm({ ...visitForm, treatment: e.target.value })}
                  placeholder="Prescription and advice"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                >
                  Save Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}