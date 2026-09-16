import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 w-full bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm shrink-0 m-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portal:</span>
        <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          {user?.role || 'Guest'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pr-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-sm font-semibold text-slate-800 leading-tight">{user?.fullName}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}