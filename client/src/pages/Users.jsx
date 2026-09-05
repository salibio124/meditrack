import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserPlus } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    contactNumber: '',
    roleId: 2,
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      setShowModal(false);
      setForm({ username: '', email: '', password: '', fullName: '', contactNumber: '', roleId: 2 });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user account.');
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
          <p className="text-xs text-slate-500">Manage accounts for Health Workers, Administrators, and Health Officers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow"
        >
          <UserPlus className="w-4 h-4" />
          <span>New User Account</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
            <tr>
              <th className="p-3.5">Full Name</th>
              <th className="p-3.5">Username</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Email</th>
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
                <td className="p-3.5 text-slate-500">{u.email}</td>
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
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs"
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Create System User</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
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
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}