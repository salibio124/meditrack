import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserPlus, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

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
        setUsers(uRes.data.data);
        setRoles(rRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Request 6-Digit Email OTP
  const handleRequestOTP = async () => {
    if (!form.email || !form.email.includes('@')) {
      alert('Please enter a valid staff email address first.');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await api.post('/users/request-otp', { email: form.email });
      alert(res.data.message || 'Verification OTP code sent to email!');
      setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch email OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      alert('Please click "Send Email OTP" first to verify the staff email.');
      return;
    }
    try {
      await api.post('/users', form);
      alert('Email verified and staff account created successfully!');
      setShowModal(false);
      setForm({ username: '', email: '', password: '', fullName: '', contactNumber: '', roleId: 2, otpCode: '' });
      setOtpSent(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create account.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Staff & User Management</h2>
          <p className="text-xs text-slate-500">Manage verified accounts for Health Workers, Administrators, and Health Officers</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setOtpSent(false); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Staff Account</span>
        </button>
      </div>

      {/* USER LIST TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
            <tr>
              <th className="p-3.5">Full Name</th>
              <th className="p-3.5">Username</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Verified Email</th>
              <th className="p-3.5">Contact No.</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading accounts...</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">{u.full_name}</td>
                <td className="p-3.5 font-semibold text-emerald-700 font-mono">{u.username}</td>
                <td className="p-3.5 font-medium text-slate-700">{u.role_name}</td>
                <td className="p-3.5 text-slate-600 flex items-center gap-1 pt-4">
                  <Mail className="w-3 h-3 text-emerald-600" />
                  <span>{u.email}</span>
                </td>
                <td className="p-3.5 text-slate-600">{u.contact_number || '-'}</td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => handleToggle(u.id)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs cursor-pointer"
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REGISTRATION MODAL WITH EMAIL OTP */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Staff Account</h3>
            <p className="text-xs text-slate-400 mb-4">Requires 2-Factor Email OTP verification before account activation.</p>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Maria Elena Santos, RN"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    required
                    type="text"
                    placeholder="maria_bhw"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={form.roleId}
                    onChange={(e) => setForm({ ...form, roleId: parseInt(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* EMAIL INPUT WITH OTP BUTTON */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Email Address *</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="email"
                    placeholder="staff@healthcenter.ph"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="flex-1 p-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    disabled={sendingOtp}
                    onClick={handleRequestOTP}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {sendingOtp ? 'Sending...' : otpSent ? 'Resend Code' : 'Send Email OTP'}
                  </button>
                </div>
              </div>

              {/* 6-DIGIT OTP BOX */}
              {otpSent && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Enter 6-Digit Email OTP *</span>
                  </div>
                  <input
                    required
                    maxLength={6}
                    type="text"
                    placeholder="123456"
                    value={form.otpCode}
                    onChange={(e) => setForm({ ...form, otpCode: e.target.value })}
                    className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-center text-base tracking-widest text-emerald-900"
                  />
                  <p className="text-[10px] text-emerald-700 text-center">Check the staff inbox (or check your server terminal for the code).</p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  placeholder="09171234567"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Password *</label>
                <input
                  required
                  type="password"
                  placeholder="Min 8 chars: Uppercase, number & symbol"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Verify & Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}