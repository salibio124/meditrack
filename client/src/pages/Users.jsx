import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  UserPlus,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  Phone,
  Send,
  Sparkles,
  KeyRound,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function Users() {
  const { user: currentUser, showToast } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // OTP & Form States
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [emailError, setEmailError] = useState('');

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    contactNumber: '',
    roleId: 2,
    otpCode: '',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/users'), api.get('/users/roles')])
      .then(([uRes, rRes]) => {
        setUsers(uRes.data.data || []);
        setRoles(rRes.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Request 6-Digit Email OTP (Replaced alert() with sleek Toast & Inline Error)
  const handleRequestOTP = async () => {
    setEmailError('');
    if (!form.email || !form.email.includes('@')) {
      setEmailError('Please enter a valid staff email address first (e.g. nurse@healthcenter.ph)');
      if (showToast) showToast('Please enter a valid staff email address.', 'error');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post('/users/request-otp', { email: form.email });
      if (showToast) showToast(res.data.message || 'OTP verification code dispatched to email!', 'success');
      setOtpSent(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to dispatch email OTP.';
      setEmailError(msg);
      if (showToast) showToast(msg, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      if (showToast) showToast('Please click "Send Email OTP" to verify the staff email first.', 'error');
      return;
    }

    if (!form.otpCode || form.otpCode.length < 6) {
      if (showToast) showToast('Please enter the complete 6-digit OTP code.', 'error');
      return;
    }

    try {
      await api.post('/users', form);
      if (showToast) showToast('Staff verified & account created successfully!', 'success');
      setShowModal(false);
      setForm({
        username: '',
        email: '',
        password: '',
        fullName: '',
        contactNumber: '',
        roleId: 2,
        otpCode: '',
      });
      setOtpSent(false);
      setEmailError('');
      loadData();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to create user account.', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/users/${id}/toggle`);
      if (showToast) showToast(res.data.message || 'Staff status updated.', 'info');
      loadData();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Error updating staff status.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Staff & User Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              {users.length} Active Staff
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision and manage verified access for Health Workers, Administrators, and Health Officers
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setOtpSent(false);
            setEmailError('');
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Staff Account</span>
        </button>
      </div>

      {/* STAFF DIRECTORY TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Username</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Official Email</th>
                <th className="p-4">Contact No.</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">Loading staff accounts...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">No staff accounts found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center text-xs">
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{u.full_name}</p>
                          <p className="text-[10px] text-slate-400">ID #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-700">{u.username}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        u.role_name === 'Administrator'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : u.role_name === 'Health Officer'
                          ? 'bg-sky-50 text-sky-700 border border-sky-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {u.role_name}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{u.contact_number || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                        <span>{u.is_active ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {currentUser?.id !== u.id ? (
                        <button
                          onClick={() => handleToggle(u.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                            u.is_active
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 italic">Current Session</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REDESIGNED FULL-SCREEN STAFF ONBOARDING MODAL */}
      {showModal && (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Provision Staff Account</h3>
                  <p className="text-xs text-slate-400">Two-Factor Authentication (2FA) Verified Onboarding</p>
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
              
              {/* SECTION 1: IDENTITY */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Maria Elena Santos, RN"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    required
                    type="text"
                    placeholder="maria_bhw"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Role *</label>
                  <select
                    value={form.roleId}
                    onChange={(e) => setForm({ ...form, roleId: parseInt(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION 2: EMAIL WITH SLICK INLINE OTP BUTTON */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Official Staff Email *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      required
                      type="email"
                      placeholder="staff@healthcenter.ph"
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        setEmailError('');
                      }}
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 font-medium ${
                        emailError ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={sendingOtp}
                    onClick={handleRequestOTP}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3 h-3 text-emerald-400" />
                    <span>{sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send Email OTP'}</span>
                  </button>
                </div>

                {/* INLINE VALIDATION ERROR MESSAGE */}
                {emailError && (
                  <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* 6-DIGIT OTP VERIFICATION BOX */}
              {otpSent && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-emerald-900">
                    <div className="flex items-center gap-1.5 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Enter 6-Digit Email OTP *</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Valid for 5 mins
                    </span>
                  </div>

                  <input
                    required
                    maxLength={6}
                    type="text"
                    placeholder="••••••"
                    value={form.otpCode}
                    onChange={(e) => setForm({ ...form, otpCode: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full p-3 bg-white border border-emerald-300 rounded-xl font-mono font-black text-center text-xl tracking-[0.4em] text-emerald-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-emerald-700 text-center font-medium">
                    Check the staff member's inbox (or check your server terminal if testing in development).
                  </p>
                </div>
              )}

              {/* SECTION 3: CONTACT & PASSWORD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Contact No.</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="09171234567"
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      required
                      type="password"
                      placeholder="Min 8 chars (A-Z, 0-9, !@#)"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
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
                  Verify OTP & Activate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}