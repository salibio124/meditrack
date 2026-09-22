import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Clock, Activity, LogOut, Bell } from 'lucide-react';

export default function Navbar() {
  const { user, logout, formattedTime, timeLeft } = useContext(AuthContext);

  const handleLogout = () => {
    if (window.confirm('Sign out of MediTrack?')) {
      logout();
    }
  };

  const isUrgent = timeLeft < 120;

  return (
    <header className="h-16 w-full bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between shadow-sm shrink-0 z-20">
      
      {/* CLINIC BADGE */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-emerald-800 text-xs font-bold">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Brgy. San Jose Health Station</span>
        </div>
      </div>

      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-3">
        
        {/* LIVE INACTIVITY TIMER */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition ${
          isUrgent
            ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
            : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-400 font-sans font-medium hidden sm:inline">Auto-Logout:</span>
          <span>{formattedTime}</span>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}