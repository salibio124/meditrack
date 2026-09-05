import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { Users, UserCheck, Calendar, AlertTriangle, Clock, Pill, TrendingUp, AlertOctagon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Barangay Health Dashboard</h2>
        <p className="text-xs text-slate-500 mt-0.5">Real-time health center operations and medicine inventory overview</p>
      </div>

      {/* ALERT BANNERS FOR MEDICINE MONITORING */}
      {(stats?.lowStockCount > 0 || stats?.expiringSoonCount > 0 || stats?.expiredCount > 0) && (
        <div className="space-y-2">
          {stats.lowStockCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span><strong>Low Stock Warning:</strong> {stats.lowStockCount} medicine(s) are below safety stock threshold!</span>
            </div>
          )}
          {stats.expiringSoonCount > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-blue-600" />
              <span><strong>Near Expiry Alert:</strong> {stats.expiringSoonCount} medicine batch(es) will expire within 30 days!</span>
            </div>
          )}
          {stats.expiredCount > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
              <span><strong>Expired Stock Notice:</strong> {stats.expiredCount} expired batch(es) locked from dispensing. Please discard.</span>
            </div>
          )}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Registered Patients" value={stats?.totalPatients || 0} icon={Users} color="emerald" subtitle="Active EMR profiles" />
        <StatCard title="Served Today" value={stats?.patientsServedToday || 0} icon={UserCheck} color="blue" subtitle="Completed visits" />
        <StatCard title="Appointments Today" value={stats?.appointmentsToday || 0} icon={Calendar} color="indigo" subtitle="Scheduled for today" />
        <StatCard title="Medicines Dispensed" value={stats?.dispensedToday || 0} icon={Pill} color="amber" subtitle="Units issued today (FIFO)" />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Morbidity Diagnoses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Top Morbidity / Diagnoses</h3>
              <p className="text-xs text-slate-400">Most frequent clinical complaints recorded</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="h-64">
            {stats?.topMorbidity?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topMorbidity} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="diagnosis" type="category" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="cases" fill="#059669" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No morbidity records logged yet.</div>
            )}
          </div>
        </div>

        {/* 7-Day Visit Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Patient Daily Footfall</h3>
              <p className="text-xs text-slate-400">Recent 7-day health center visits</p>
            </div>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="h-64">
            {stats?.visitTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.visitTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="visit_day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total_visits" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No visit trends available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}