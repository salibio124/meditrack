import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  ShieldCheck,
  Plus,
  MessageSquare,
  Search,
  User,
  CheckCircle2,
  Syringe,
  Calendar,
  Clock,
  ChevronDown,
  X
} from 'lucide-react';

export default function Immunization() {
  const { showToast } = useContext(AuthContext);
  const [immunizations, setImmunizations] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Search States inside Modal
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  const [vaccineSearch, setVaccineSearch] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [isVaccineDropdownOpen, setIsVaccineDropdownOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    doseNumber: 1,
    dateAdministered: new Date().toISOString().split('T')[0],
    nextScheduledDate: '',
    notes: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/immunizations'),
      api.get('/immunizations/vaccines'),
      api.get('/patients')
    ])
      .then(([immRes, vacRes, patRes]) => {
        setImmunizations(immRes.data.data || []);
        setVaccines(vacRes.data.data || []);
        setPatients(patRes.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered patients for search
  const filteredPatients = patients.filter((p) => {
    const term = patientSearch.toLowerCase();
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName.includes(term) || p.patient_code.toLowerCase().includes(term);
  });

  // Filtered vaccines for search
  const filteredVaccines = vaccines.filter((v) => {
    const term = vaccineSearch.toLowerCase();
    return v.name.toLowerCase().includes(term) || v.target_disease.toLowerCase().includes(term);
  });

  const handleRecord = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      if (showToast) showToast('Please search and select a child/patient first.', 'error');
      return;
    }
    if (!selectedVaccine) {
      if (showToast) showToast('Please search and select a vaccine.', 'error');
      return;
    }

    try {
      await api.post('/immunizations', {
        patientId: selectedPatient.id,
        vaccineId: selectedVaccine.id,
        doseNumber: formData.doseNumber,
        dateAdministered: formData.dateAdministered,
        nextScheduledDate: formData.nextScheduledDate || null,
        notes: formData.notes,
      });

      if (showToast) showToast('Vaccination record saved successfully!', 'success');
      setShowModal(false);
      
      // Reset form
      setSelectedPatient(null);
      setSelectedVaccine(null);
      setPatientSearch('');
      setVaccineSearch('');
      setFormData({
        doseNumber: 1,
        dateAdministered: new Date().toISOString().split('T')[0],
        nextScheduledDate: '',
        notes: '',
      });
      loadData();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Error recording immunization.', 'error');
    }
  };

  const handleRemind = async (id, patientName) => {
    try {
      await api.post(`/immunizations/${id}/remind`);
      if (showToast) showToast(`SMS immunization reminder sent for ${patientName}!`, 'success');
      loadData();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to dispatch SMS reminder.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Maternal & Child Immunization Program
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              National EPI Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track pediatric vaccinations (BCG, Polio, Pentavalent, MMR) with automated cellular SMS alerts
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setSelectedPatient(null);
            setSelectedVaccine(null);
            setPatientSearch('');
            setVaccineSearch('');
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Vaccine Dose</span>
        </button>
      </div>

      {/* IMMUNIZATION TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Child / Infant</th>
                <th className="p-4">Vaccine Name</th>
                <th className="p-4">Target Disease</th>
                <th className="p-4">Dose #</th>
                <th className="p-4">Date Given</th>
                <th className="p-4">Next Due Date</th>
                <th className="p-4">Administered By</th>
                <th className="p-4 text-right">SMS Reminder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-400">Loading immunization schedules...</td>
                </tr>
              ) : immunizations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-400">No vaccination records logged yet.</td>
                </tr>
              ) : (
                immunizations.map((imm) => (
                  <tr key={imm.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 leading-tight">
                        {imm.last_name}, {imm.first_name}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-mono font-bold mt-0.5">{imm.patient_code}</p>
                    </td>
                    <td className="p-4 font-bold text-emerald-800">{imm.vaccine_name}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{imm.target_disease}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                        Dose #{imm.dose_number}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{imm.date_administered}</td>
                    <td className="p-4">
                      {imm.next_scheduled_date ? (
                        <span className="font-bold text-sky-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sky-500" />
                          <span>{imm.next_scheduled_date}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Completed</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">{imm.administered_by_name}</td>
                    <td className="p-4 text-right">
                      {imm.next_scheduled_date ? (
                        <button
                          onClick={() => handleRemind(imm.id, imm.first_name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl font-bold text-xs transition cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Send Alert</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-bold">Done</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD VACCINE MODAL WITH LIVE SEARCH SELECTORS */}
      {showModal && (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <Syringe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Record Vaccine Administration</h3>
                  <p className="text-xs text-slate-400">National Immunization Program • Health Center Desk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecord} className="space-y-4 text-xs">
              
              {/* 1. SEARCHABLE PATIENT SELECTOR */}
              <div className="space-y-1.5 relative">
                <label className="block font-bold text-slate-700">Select Child / Infant *</label>
                
                {selectedPatient ? (
                  // LOCKED SELECTED PATIENT CARD
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                        ✓
                      </div>
                      <div>
                        <p className="font-extrabold text-emerald-950 text-xs">
                          {selectedPatient.last_name}, {selectedPatient.first_name}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-mono">
                          {selectedPatient.patient_code} • {selectedPatient.age} yrs • {selectedPatient.sex}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(null);
                        setPatientSearch('');
                        setIsPatientDropdownOpen(true);
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  // LIVE SEARCH INPUT
                  <div>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Type child name or patient ID to search..."
                        value={patientSearch}
                        onFocus={() => setIsPatientDropdownOpen(true)}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setIsPatientDropdownOpen(true);
                        }}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
                      />
                    </div>

                    {/* SEARCH RESULTS DROPDOWN */}
                    {isPatientDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-20 divide-y divide-slate-100">
                        {filteredPatients.length === 0 ? (
                          <div className="p-3 text-center text-slate-400">No matching patients found.</div>
                        ) : (
                          filteredPatients.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPatient(p);
                                setIsPatientDropdownOpen(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-emerald-50 flex items-center justify-between cursor-pointer transition"
                            >
                              <div>
                                <p className="font-bold text-slate-900">{p.last_name}, {p.first_name}</p>
                                <p className="text-[10px] text-slate-400">{p.address}</p>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                {p.patient_code}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. SEARCHABLE VACCINE SELECTOR */}
              <div className="space-y-1.5 relative">
                <label className="block font-bold text-slate-700">Select Vaccine *</label>

                {selectedVaccine ? (
                  // LOCKED SELECTED VACCINE CARD
                  <div className="p-3 bg-sky-50 border border-sky-300 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-black flex items-center justify-center text-xs">
                        💉
                      </div>
                      <div>
                        <p className="font-extrabold text-sky-950 text-xs">{selectedVaccine.name}</p>
                        <p className="text-[10px] text-sky-700">{selectedVaccine.target_disease}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVaccine(null);
                        setVaccineSearch('');
                        setIsVaccineDropdownOpen(true);
                      }}
                      className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  // LIVE VACCINE SEARCH INPUT
                  <div>
                    <div className="relative">
                      <Syringe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search vaccine (e.g. BCG, Polio, Pentavalent)..."
                        value={vaccineSearch}
                        onFocus={() => setIsVaccineDropdownOpen(true)}
                        onChange={(e) => {
                          setVaccineSearch(e.target.value);
                          setIsVaccineDropdownOpen(true);
                        }}
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
                      />
                    </div>

                    {/* VACCINES DROPDOWN LIST */}
                    {isVaccineDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-20 divide-y divide-slate-100">
                        {filteredVaccines.length === 0 ? (
                          <div className="p-3 text-center text-slate-400">No matching vaccines found.</div>
                        ) : (
                          filteredVaccines.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => {
                                setSelectedVaccine(v);
                                setIsVaccineDropdownOpen(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-sky-50 flex items-center justify-between cursor-pointer transition"
                            >
                              <div>
                                <p className="font-bold text-slate-900">{v.name}</p>
                                <p className="text-[10px] text-slate-400">{v.target_disease}</p>
                              </div>
                              <span className="text-[10px] font-semibold text-slate-500">{v.recommended_age}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. DOSE & DATE FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dose Sequence *</label>
                  <select
                    value={formData.doseNumber}
                    onChange={(e) => setFormData({ ...formData, doseNumber: parseInt(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="1">Dose #1 (Primary)</option>
                    <option value="2">Dose #2 (Follow-up)</option>
                    <option value="3">Dose #3 (Booster)</option>
                    <option value="4">Dose #4</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Administered *</label>
                  <input
                    required
                    type="date"
                    value={formData.dateAdministered}
                    onChange={(e) => setFormData({ ...formData, dateAdministered: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 4. NEXT SCHEDULED DATE FOR SMS REMINDER */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Next Scheduled Dose Date (Triggers SMS text reminder)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={formData.nextScheduledDate}
                    onChange={(e) => setFormData({ ...formData, nextScheduledDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl font-semibold text-sky-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave blank if this is the final dose in the sequence.
                </p>
              </div>

              {/* NOTES */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Observations / Reaction Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Normal reaction, advised paracetamol for mild fever"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer transition"
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