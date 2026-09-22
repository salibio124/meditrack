import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  FileText,
  Search,
  ArrowDownAZ,
  ArrowUpZA,
  Calendar,
  Eye,
  Activity,
  User,
  Clock,
  Filter
} from 'lucide-react';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('A-Z'); // 'A-Z', 'Z-A', 'NEWEST', 'OLDEST'
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    api.get('/medical-records')
      .then((res) => setRecords(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filter by Search and Visit Type
  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${r.last_name} ${r.first_name}`.toLowerCase();
    const diagnosis = (r.diagnosis || '').toLowerCase();
    const code = (r.patient_code || '').toLowerCase();

    const matchesSearch = fullName.includes(term) || diagnosis.includes(term) || code.includes(term);
    const matchesType = filterType === 'ALL' || r.visit_type === filterType;

    return matchesSearch && matchesType;
  });

  // Sort Logic (A-Z, Z-A, Newest, Oldest)
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const nameA = `${a.last_name}, ${a.first_name}`.toLowerCase();
    const nameB = `${b.last_name}, ${b.first_name}`.toLowerCase();

    if (sortOrder === 'A-Z') {
      return nameA.localeCompare(nameB);
    }
    if (sortOrder === 'Z-A') {
      return nameB.localeCompare(nameA);
    }
    if (sortOrder === 'OLDEST') {
      return new Date(a.visit_date) - new Date(b.visit_date);
    }
    return new Date(b.visit_date) - new Date(a.visit_date); // Default NEWEST
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Clinical Consultations & Visits</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#064e3b] text-white">
              {sortedRecords.length} Encounters
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chronological and alphabetical index of patient evaluations, vitals triage, and diagnoses
          </p>
        </div>

        {/* SORT TOGGLE DROPDOWN (A-Z, Z-A, Newest) */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 pl-2">Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#064e3b] cursor-pointer"
          >
            <option value="A-Z">Patient Name (A → Z)</option>
            <option value="Z-A">Patient Name (Z → A)</option>
            <option value="NEWEST">Date (Newest First)</option>
            <option value="OLDEST">Date (Oldest First)</option>
          </select>
        </div>
      </div>

      {/* CONTROLS: SEARCH BAR & VISIT TYPE FILTER PILLS */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="w-full md:w-96 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[#064e3b] transition">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name, Diagnosis, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto text-xs font-bold">
          {[
            { id: 'ALL', label: 'All Encounters' },
            { id: 'Consultation', label: 'Consultations' },
            { id: 'Prenatal', label: 'Prenatal' },
            { id: 'Immunization', label: 'Immunization' },
            { id: 'Emergency', label: 'Emergency' },
            { id: 'Follow-up', label: 'Follow-up' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer text-[11px] ${
                filterType === tab.id
                  ? 'bg-[#064e3b] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VISITS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">
                  <div className="flex items-center gap-1">
                    <span>Resident Patient</span>
                    {sortOrder === 'A-Z' && <span className="text-[10px] text-emerald-700 font-extrabold">(A→Z)</span>}
                    {sortOrder === 'Z-A' && <span className="text-[10px] text-emerald-700 font-extrabold">(Z→A)</span>}
                  </div>
                </th>
                <th className="p-4">Visit Date</th>
                <th className="p-4">Visit Type</th>
                <th className="p-4">Clinical Diagnosis</th>
                <th className="p-4">Triage Vitals</th>
                <th className="p-4">Attending Staff</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">Loading consultation records...</td>
                </tr>
              ) : sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">No medical encounters match your search or filter.</td>
                </tr>
              ) : (
                sortedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Patient Name & Code */}
                    <td className="p-4">
                      <p className="font-bold text-slate-900 leading-tight">
                        {r.last_name}, {r.first_name}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-mono font-bold mt-0.5">{r.patient_code}</p>
                    </td>

                    {/* Date & Time */}
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {new Date(r.visit_date).toLocaleDateString()}
                      <span className="block text-[10px] text-slate-400">
                        {new Date(r.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Visit Type Badge */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        r.visit_type === 'Emergency'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : r.visit_type === 'Prenatal'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : r.visit_type === 'Immunization'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {r.visit_type}
                      </span>
                    </td>

                    {/* Diagnosis */}
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{r.diagnosis}</p>
                      <p className="text-[10px] text-slate-400 max-w-xs truncate">{r.chief_complaint}</p>
                    </td>

                    {/* Vitals */}
                    <td className="p-4 text-slate-600">
                      <span className="font-bold text-slate-800">{r.blood_pressure || 'No BP'}</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span>{r.temperature ? `${r.temperature}°C` : 'No Temp'}</span>
                    </td>

                    {/* Attending BHW */}
                    <td className="p-4 text-slate-500 text-xs">{r.attending_bhw}</td>

                    {/* View Profile Action */}
                    <td className="p-4 text-right">
                      <Link
                        to={`/patients/${r.patient_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-[#064e3b] hover:text-white text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Full Chart</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}