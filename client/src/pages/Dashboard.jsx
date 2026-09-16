import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import {
  Users,
  UserCheck,
  Calendar,
  Pill,
  AlertTriangle,
  Clock,
  AlertOctagon,
  TrendingUp,
  UserPlus,
  Send,
  HeartPulse,
  Activity,
  ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/medical-records?limit=5')
    ])
      .then(([statsRes, recordsRes]) => {
        setStats(statsRes.data.data);
        setRecentRecords(recordsRes.data.data || []);
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Magandang Umaga';
    if (hour < 18) return 'Magandang Hapon';
    return 'Magandang Gabi';
  };

  const todayDateString = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-emerald-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-400">Loading Barangay Health Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      
      {/* GREETING & QUICK ACTIONS BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-semibold tracking-wide uppercase mb-2">
            Brgy. San Jose Health Station • MediTrack Online
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Staff'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            {todayDateString} — All primary health systems operational.
          </p>
        </div>

        {/* QUICK SHORTCUT BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/patients"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition duration-150 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Patient</span>
          </Link>
          <Link
            to="/inventory"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold rounded-xl shadow transition duration-150 cursor-pointer"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>Dispense Rx (FIFO)</span>
          </Link>
          <Link
            to="/appointments"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold rounded-xl shadow transition duration-150 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Schedule</span>
          </Link>
        </div>
      </div>

      {/* SMART INVENTORY & SHELF NOTIFICATION BANNERS */}
      {(stats?.lowStockCount > 0 || stats?.expiringSoonCount > 0 || stats?.expiredCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.lowStockCount > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-amber-900">Low Stock Warning</p>
                <p className="text-amber-700 mt-0.5"><strong>{stats.lowStockCount} medicines</strong> are below minimum threshold.</p>
              </div>
            </div>
          )}
          {stats.expiringSoonCount > 0 && (
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-sky-700" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-sky-900">Near-Expiry Notification</p>
                <p className="text-sky-700 mt-0.5"><strong>{stats.expiringSoonCount} batches</strong> will expire within 30 days.</p>
              </div>
            </div>
          )}
          {stats.expiredCount > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5 text-rose-700" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-rose-900">Expired Stock Quarantined</p>
                <p className="text-rose-700 mt-0.5"><strong>{stats.expiredCount} batches</strong> locked from dispensing.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CORE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Residents"
          value={stats?.totalPatients || 0}
          icon={Users}
          color="emerald"
          subtitle="Electronic medical charts"
          badgeText="Community EMR"
        />
        <StatCard
          title="Patients Served Today"
          value={stats?.patientsServedToday || 0}
          icon={UserCheck}
          color="blue"
          subtitle="Completed consultations"
          badgeText="Daily Footfall"
        />
        <StatCard
          title="Appointments Today"
          value={stats?.appointmentsToday || 0}
          icon={Calendar}
          color="purple"
          subtitle="Scheduled doctor visits"
          badgeText="SMS-Notified"
        />
        <StatCard
          title="Medicines Issued Today"
          value={stats?.dispensedToday || 0}
          icon={Pill}
          color="amber"
          subtitle="Units deducted via FIFO"
          badgeText="Strict FIFO"
        />
      </div>

      {/* ANALYTICS CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Morbidity Diagnoses */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Top Morbidity Diagnoses</h3>
              <p className="text-xs text-slate-400 mt-0.5">Most prevalent illnesses documented at triage</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64">
            {stats?.topMorbidity?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topMorbidity} layout="vertical" margin={{ top: 5, right: 30, left: 35, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis dataKey="diagnosis" type="category" width={110} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Bar dataKey="cases" fill="#059669" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No morbidity records logged yet.</div>
            )}
          </div>
        </div>

        {/* 7-Day Visit Footfall Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Patient Footfall Trend (Past 7 Days)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily consultation volume over time</p>
            </div>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64">
            {stats?.visitTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.visitTrend} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="visit_day" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                  />
                  <Area type="monotone" dataKey="total_visits" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No footfall trends logged yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT CLINICAL CONSULTATIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Patient Consultations</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest clinical encounters recorded by health workers</p>
          </div>
          <Link
            to="/medical-records"
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-3.5">Date / Time</th>
                <th className="p-3.5">Resident</th>
                <th className="p-3.5">Visit Type</th>
                <th className="p-3.5">Diagnosis</th>
                <th className="p-3.5">Vitals (BP / Temp)</th>
                <th className="p-3.5">Attending BHW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">No consultation records on file yet.</td>
                </tr>
              ) : (
                recentRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(r.visit_date).toLocaleDateString()} @ {new Date(r.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {r.last_name}, {r.first_name} <span className="text-emerald-700 font-mono text-[10px] ml-1">({r.patient_code})</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                        {r.visit_type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-800">{r.diagnosis}</td>
                    <td className="p-3.5 text-slate-600">
                      {r.blood_pressure || 'N/A'} • {r.temperature ? `${r.temperature}°C` : 'N/A'}
                    </td>
                    <td className="p-3.5 text-slate-500">{r.attending_bhw}</td>
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