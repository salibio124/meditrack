import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/medical-records')
      .then((res) => setRecords(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Visits & Consultations</h2>
        <p className="text-xs text-slate-500">Log of all patient encounters, triage vitals, and recorded diagnoses</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
            <tr>
              <th className="p-3">Visit Date</th>
              <th className="p-3">Patient Code</th>
              <th className="p-3">Patient Name</th>
              <th className="p-3">Visit Type</th>
              <th className="p-3">Diagnosis</th>
              <th className="p-3">BP / Temp</th>
              <th className="p-3">Attending Staff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="p-6 text-center text-slate-400">Loading visit records...</td></tr>
            ) : records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="p-3 text-slate-500 font-mono text-[11px]">{new Date(r.visit_date).toLocaleDateString()}</td>
                <td className="p-3 font-semibold text-emerald-700">{r.patient_code}</td>
                <td className="p-3 font-bold text-slate-800">{r.last_name}, {r.first_name}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium">{r.visit_type}</span></td>
                <td className="p-3 font-semibold text-slate-900">{r.diagnosis}</td>
                <td className="p-3 text-slate-600">{r.blood_pressure || '-'} / {r.temperature ? `${r.temperature}°C` : '-'}</td>
                <td className="p-3 text-slate-500">{r.attending_bhw}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}