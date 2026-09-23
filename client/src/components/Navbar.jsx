import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Clock, Activity, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, formattedTime, timeLeft } = useContext(AuthContext);

  const isUrgent = timeLeft < 120;

  return (
    <header className="h-16 w-full bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between shadow-sm shrink-0 z-20">
      
      {/* CLINIC ZONE STATUS */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-emerald-800 text-xs font-bold">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Brgy. Health Station</span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
          Role: {user?.role || 'Staff'}
        </span>
      </div>

      {/* RIGHT: LIVE AUTO-LOGOUT COUNTDOWN TIMER ONLY */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition ${
          isUrgent
            ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
            : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-400 font-sans font-medium hidden sm:inline">Auto-Logout:</span>
          <span>{formattedTime}</span>
        </div>
      </div>
    </header>
  );
}