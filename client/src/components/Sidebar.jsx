import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  ShieldCheck,
  Pill,
  Boxes,
  BarChart3,
  MessageSquare,
  History,
  UserCheck,
  ActivitySquare,
  HeartPulse,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const role = user?.role || '';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Administrator', 'BHW', 'Health Officer'] },
    { name: 'Residents (EMR)', path: '/patients', icon: Users, roles: ['Administrator', 'BHW', 'Health Officer'] },
    { name: 'Consultations', path: '/medical-records', icon: FileText, roles: ['Administrator', 'BHW'] },
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['Administrator', 'BHW'] },
    { name: 'Immunization', path: '/immunization', icon: ShieldCheck, roles: ['Administrator', 'BHW'] },
    { name: 'Medicines List', path: '/medicines', icon: Pill, roles: ['Administrator', 'BHW', 'Health Officer'] },
    { name: 'Batch Inventory', path: '/inventory', icon: Boxes, roles: ['Administrator', 'BHW', 'Health Officer'] },
    { name: 'Health Reports', path: '/reports', icon: BarChart3, roles: ['Administrator', 'Health Officer'] },
    { name: 'Research Study', path: '/research', icon: ActivitySquare, roles: ['Administrator', 'Health Officer', 'BHW'] },
    { name: 'SMS Alerts', path: '/sms', icon: MessageSquare, roles: ['Administrator'] },
    { name: 'Audit Logs', path: '/audit', icon: History, roles: ['Administrator'] },
    { name: 'Staff Accounts', path: '/users', icon: UserCheck, roles: ['Administrator'] },
  ];

  const handleLogout = () => {
    if (window.confirm('Sign out of MediTrack?')) {
      logout();
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-screen select-none z-30">
      
      {/* BRANDING HEADER */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-[#064e3b] text-white flex items-center justify-center font-black shadow-md shadow-emerald-950/20 shrink-0">
          <HeartPulse className="w-5 h-5 text-emerald-300" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-slate-900 text-base tracking-tight leading-none">MediTrack</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5">Brgy. Health Center</p>
        </div>
      </div>

      {/* NAVIGATION MENU */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-1">
        <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
          Clinical Menu
        </p>
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#064e3b] text-white shadow-md shadow-emerald-950/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
      </div>

      {/* BOTTOM USER & LOGOUT CARD */}
      <div className="p-4 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#064e3b] font-black text-xs flex items-center justify-center">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight">{user?.fullName}</p>
            <p className="text-[10px] text-emerald-700 font-semibold truncate">{user?.role || 'Staff'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}