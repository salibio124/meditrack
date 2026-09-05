import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MessageSquare, Send } from 'lucide-react';

export default function SMSLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const loadLogs = () => {
    setLoading(true);
    api.get('/sms/logs')
      .then((res) => setLogs(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSendCustom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sms/send', { recipientPhone: phone, message, smsType: 'General Announcement' });
      alert('SMS dispatched successfully!');
      setPhone('');
      setMessage('');
      loadLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch SMS.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">SMS Alert Logs & Direct Messenger</h2>
        <p className="text-xs text-slate-500">Real-time dispatch history for appointment reminders and community health announcements</p>
      </div>

      {/* DISPATCH FORM */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm max-w-xl">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Send Community Health Alert</h3>
        <form onSubmit={handleSendCustom} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recipient Number *</label>
            <input
              required
              type="text"
              placeholder="09171234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Message Content *</label>
            <textarea
              required
              rows="2"
              placeholder="MediTrack Announcement: Libreng bakuna at BP check bukas sa health center..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch SMS</span>
          </button>
        </form>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Recipient</th>
              <th className="p-3">Category</th>
              <th className="p-3">Message Preview</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="p-6 text-center text-slate-400">Loading dispatch logs...</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3 text-slate-400 font-mono text-[11px]">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-3 font-semibold text-slate-800">{log.recipient_phone}</td>
                <td className="p-3 text-slate-600">{log.sms_type}</td>
                <td className="p-3 text-slate-600 max-w-md truncate">{log.message}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    log.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}