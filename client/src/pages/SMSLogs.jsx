import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, Send, Phone, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function SMSLogs() {
  const { showToast } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadLogs = () => {
    setLoading(true);
    api.get('/sms/logs')
      .then((res) => setLogs(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // DISPATCH SMS WITH TOAST NOTIFICATION (NO MORE BROWSER ALERT)
  const handleSendCustom = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/sms/send', {
        recipientPhone: phone,
        message,
        smsType: 'General Announcement'
      });
      
      // ✨ MODERN FLOATING TOAST INSTEAD OF BROWSER ALERT
      if (showToast) {
        showToast(`SMS alert dispatched to ${phone}!`, 'success');
      }
      
      setPhone('');
      setMessage('');
      loadLogs();
    } catch (err) {
      if (showToast) {
        showToast(err.response?.data?.message || 'Failed to dispatch SMS.', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">SMS Alert Logs & Direct Messenger</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800">
              Semaphore Cellular Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telecommunication dispatch records for appointment reminders and community health announcements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DIRECT MESSENGER CARD */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Send Community Health Alert</h3>
          </div>

          <form onSubmit={handleSendCustom} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Recipient Mobile Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  required
                  type="text"
                  placeholder="09171234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Message Content *</label>
              <textarea
                required
                rows="4"
                placeholder="MediTrack Announcement: Magkakaroon po ng libreng bakuna at BP check bukas 8AM sa health center..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 text-xs leading-relaxed"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{message.length} characters</p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Dispatching...' : 'Dispatch SMS Alert'}</span>
            </button>
          </form>
        </div>

        {/* SMS DISPATCH AUDIT LOGS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Telecommunication Dispatch Trail</h3>
            <span className="text-[11px] font-semibold text-slate-400">Showing latest {logs.length} dispatches</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Message Preview</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading dispatch logs...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-400">No SMS logs recorded yet.</td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 font-mono">{log.recipient_phone}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.sms_type}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{log.message}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        log.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status === 'Sent' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}