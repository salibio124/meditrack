import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Search,
  UserPlus,
  Eye,
  Phone,
  Trash2,
  Calendar,
  User,
  MapPin,
  HeartPulse,
  Filter,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function Patients() {
  const { showToast } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    dateOfBirth: '',
    age: '',
    sex: 'Male',
    civilStatus: 'Single',
    address: '',
    barangay: 'Brgy. San Jose',
    contactNumber: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
  });

  const fetchPatients = () => {
    setLoading(true);
    api.get(`/patients?search=${encodeURIComponent(search)}`)
      .then((res) => setPatients(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // LIVE AGE CALCULATION FROM BIRTHDATE
  const handleBirthDateChange = (dateVal) => {
    if (!dateVal) {
      setFormData((prev) => ({ ...prev, dateOfBirth: '', age: '' }));
      return;
    }
    const birth = new Date(dateVal);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: dateVal,
      age: calculatedAge >= 0 ? calculatedAge : 0,
    }));
  };

  // DIRECT AGE INPUT (ESTIMATES BIRTHDATE IF EXACT BIRTHDAY IS UNKNOWN)
  const handleDirectAgeChange = (ageVal) => {
    const numericAge = parseInt(ageVal, 10);
    if (isNaN(numericAge) || numericAge < 0) {
      setFormData((prev) => ({ ...prev, age: ageVal }));
      return;
    }
    const currentYear = new Date().getFullYear();
    const estimatedYear = currentYear - numericAge;
    const estimatedDate = `${estimatedYear}-01-01`;
    setFormData((prev) => ({
      ...prev,
      age: numericAge,
      dateOfBirth: estimatedDate,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients', formData);
      if (showToast) showToast('Resident patient registered successfully!', 'success');
      setShowModal(false);
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        dateOfBirth: '',
        age: '',
        sex: 'Male',
        civilStatus: 'Single',
        address: '',
        barangay: 'Brgy. San Jose',
        contactNumber: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
      });
      fetchPatients();
    } catch (err) {
      if (showToast) {
        showToast(err.response?.data?.message || 'Error creating patient.', 'error');
      } else {
        alert(err.response?.data?.message || 'Error creating patient.');
      }
    }
  };

  const handleDelete = async (patient) => {
    const confirmed = window.confirm(
      `Delete patient "${patient.first_name} ${patient.last_name}" (${patient.patient_code})? This action cannot be undone.`
    );
    if (confirmed) {
      try {
        await api.delete(`/patients/${patient.id}`);
        if (showToast) showToast('Patient record deleted successfully.', 'info');
        fetchPatients();
      } catch (err) {
        if (showToast) {
          showToast(err.response?.data?.message || 'Failed to delete.', 'error');
        } else {
          alert('Failed to delete.');
        }
      }
    }
  };

  // Filter logic
  const filteredPatients = patients.filter((p) => {
    if (activeFilter === 'MALE') return p.sex === 'Male';
    if (activeFilter === 'FEMALE') return p.sex === 'Female';
    if (activeFilter === 'SENIOR') return p.age >= 60;
    if (activeFilter === 'CHILD') return p.age <= 12;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Electronic Medical Records (EMR)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              {patients.length} Residents
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Official Master Registry of Barangay Health Center Patients</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* CONTROLS: SEARCH BAR & DEMOGRAPHIC FILTER PILLS */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="w-full md:w-96 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-2.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Name, or Phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto text-xs font-bold">
          {[
            { id: 'ALL', label: 'All Residents' },
            { id: 'SENIOR', label: 'Seniors (60+)' },
            { id: 'CHILD', label: 'Children (0-12)' },
            { id: 'FEMALE', label: 'Female' },
            { id: 'MALE', label: 'Male' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer text-[11px] ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* PATIENT TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Patient Code</th>
                <th className="p-4">Resident Name</th>
                <th className="p-4">Age / Category</th>
                <th className="p-4">Sex</th>
                <th className="p-4">Mobile Number</th>
                <th className="p-4">Barangay Address</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">Loading resident records...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">No resident patients found matching your search.</td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-mono font-bold text-emerald-700">{p.patient_code}</td>
                    <td className="p-4 font-bold text-slate-900">
                      {p.last_name}, {p.first_name} {p.middle_name ? p.middle_name[0] + '.' : ''} {p.suffix || ''}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">{p.age} yrs</span>
                      <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {p.age >= 60 ? 'Senior' : p.age <= 12 ? 'Child' : 'Adult'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        p.sex === 'Female' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-sky-50 text-sky-700 border border-sky-100'
                      }`}>
                        {p.sex}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.contact_number}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{p.address}, {p.barangay}</td>
                    <td className="p-4 text-right space-x-1.5">
                      <Link
                        to={`/patients/${p.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Medical Profile</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl font-bold text-xs transition border border-rose-200 cursor-pointer"
                        title="Delete patient record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ENHANCED REGISTRATION MODAL WITH LIVE AGE CALCULATION */}
{showModal && (
  <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Register Resident Patient</h3>
                  <p className="text-xs text-slate-400">Electronic Medical Record Intake • Brgy. Health Center</p>
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

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              
              {/* SECTION 1: PERSONAL IDENTITY */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Resident Personal Identity</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Juan"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Middle Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mercado"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Dela Cruz"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Suffix</label>
                    <input
                      type="text"
                      placeholder="Jr., Sr., III"
                      value={formData.suffix}
                      onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Biological Sex *</label>
                    <select
                      value={formData.sex}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Civil Status</label>
                    <select
                      value={formData.civilStatus}
                      onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                      <option value="Child">Child</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BIRTHDATE & DYNAMIC AGE BOX */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2. Birthdate & Age Verification</span>
                  </p>
                  {formData.age !== '' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[11px]">
                      {formData.age} Years Old
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Birthdate *</label>
                    <input
                      required
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Auto-computes age automatically.</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Age (Years) *</label>
                    <div className="relative">
                      <input
                        required
                        type="number"
                        min="0"
                        max="125"
                        placeholder="e.g. 35"
                        value={formData.age}
                        onChange={(e) => handleDirectAgeChange(e.target.value)}
                        className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-black text-emerald-800 text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1">Typing age auto-estimates birth year if birthday is unknown.</p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: CONTACT & BARANGAY RESIDENCE */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Contact & Residential Address</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Philippine Mobile Number (For SMS Alerts) *</label>
                    <input
                      required
                      type="text"
                      placeholder="09171234567"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Barangay Jurisdiction</label>
                    <input
                      type="text"
                      value={formData.barangay}
                      onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">House No. / Purok / Street *</label>
                  <textarea
                    required
                    rows="2"
                    placeholder="Purok 3, Riverside Road, Brgy. San Jose"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* SECTION 4: EMERGENCY CONTACT */}
              <div className="space-y-2.5 pt-1">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>4. Emergency Contact Person (Optional)</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="Parent / Spouse / Relative"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Person Number</label>
                    <input
                      type="text"
                      placeholder="09181234567"
                      value={formData.emergencyContactNumber}
                      onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* MODAL ACTION BUTTONS */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer transition"
                >
                  Register Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}