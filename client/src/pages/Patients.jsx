import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Plus, UserPlus, Eye, Phone, Trash2 } from 'lucide-react';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State for Adding Patient
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    dateOfBirth: '',
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
      .then((res) => setPatients(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients', formData);
      setShowModal(false);
      setFormData({
        firstName: '', middleName: '', lastName: '', suffix: '',
        dateOfBirth: '', sex: 'Male', civilStatus: 'Single',
        address: '', barangay: 'Brgy. San Jose', contactNumber: '',
        emergencyContactName: '', emergencyContactNumber: '',
      });
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating patient.');
    }
  };

  // ONE-CLICK DELETE HANDLER
  const handleDelete = async (patient) => {
    const confirmed = window.confirm(`Are you sure you want to delete patient "${patient.first_name} ${patient.last_name}" (${patient.patient_code})? This will also remove their consultation history.`);
    if (confirmed) {
      try {
        await api.delete(`/patients/${patient.id}`);
        fetchPatients(); // refresh list immediately
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete patient.');
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Electronic Medical Records (EMR)</h2>
          <p className="text-xs text-slate-500">Search, register, manage, or delete patient records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          placeholder="Search by Patient Code, Name, or Phone Number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
        />
      </div>

      {/* PATIENT TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Patient ID</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Age / Sex</th>
                <th className="p-3.5">Contact No.</th>
                <th className="p-3.5">Address</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading patients...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No registered patients found.</td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-semibold text-emerald-700">{p.patient_code}</td>
                    <td className="p-3.5 font-medium text-slate-800">
                      {p.last_name}, {p.first_name} {p.middle_name ? p.middle_name[0] + '.' : ''} {p.suffix || ''}
                    </td>
                    <td className="p-3.5 text-slate-600">{p.age} yrs • {p.sex}</td>
                    <td className="p-3.5 text-slate-600 flex items-center gap-1 pt-4">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{p.contact_number}</span>
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">{p.address}, {p.barangay}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <Link
                        to={`/patients/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-md font-medium text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </Link>

                      {/* RED DELETE BUTTON */}
                      <button
                        onClick={() => handleDelete(p)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md font-medium text-xs transition-colors border border-rose-200"
                        title="Delete patient record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">Register New Resident Patient</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Suffix (Jr., III)</label>
                  <input
                    type="text"
                    value={formData.suffix}
                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Birthdate *</label>
                  <input
                    required
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sex *</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Civil Status</label>
                  <select
                    value={formData.civilStatus}
                    onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                    <option value="Child">Child</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Number (For SMS reminders) *</label>
                <input
                  required
                  type="text"
                  placeholder="09171234567"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address *</label>
                <textarea
                  required
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Purok / House No. / Street"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                ></textarea>
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
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}