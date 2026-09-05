import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs')
      .then((res) => setLogs(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Security Audit Trail</h2>
        <p className="text-xs text-slate-500">Immutable chronological log of critical patient, medical, and inventory transactions</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Action</th>
              <th className="p-3">Module</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading audit trail...</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3 text-slate-400 font-mono text-[11px]">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-3 font-semibold text-slate-800">{log.full_name || 'System'}</td>
                <td className="p-3 text-slate-500">{log.role_name || '-'}</td>
                <td className="p-3 font-mono text-emerald-700 font-semibold">{log.action}</td>
                <td className="p-3 text-slate-600">{log.module}</td>
                <td className="p-3 text-slate-700 max-w-sm truncate">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}