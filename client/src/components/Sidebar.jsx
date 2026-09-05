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
  HeartPulse
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const role = user?.role || '';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Administrator', 'BHW', 'Health Officer'] },
    { name: 'Patients Directory', path: '/patients', icon: Users, roles: ['Administrator', 'BHW', 'Health Officer'] },
    { name: 'Medical Visits', path: '/medical-records', icon: FileText, roles: ['Administrator', 'BHW'] },
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['Administrator', 'BHW'] },
    { name: 'Immunization', path: '/immunization', icon: ShieldCheck, roles: ['Administrator', 'BHW'] },
    { name: 'Medicines List', path: '/medicines', icon: Pill, roles: ['Administrator', 'BHW', 'Health Officer'] },
    { name: 'Batch Inventory', path: '/inventory', icon: Boxes, roles: ['Administrator', 'BHW', 'Health Officer'] },
    { name: 'Health Reports', path: '/reports', icon: BarChart3, roles: ['Administrator', 'Health Officer'] },
    { name: 'Research Study', path: '/research', icon: ActivitySquare, roles: ['Administrator', 'Health Officer', 'BHW'] },
    { name: 'SMS Reminders', path: '/sms', icon: MessageSquare, roles: ['Administrator'] },
    { name: 'Audit Logs', path: '/audit', icon: History, roles: ['Administrator'] },
    { name: 'User Accounts', path: '/users', icon: UserCheck, roles: ['Administrator'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 gap-3 bg-slate-950/40 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-base leading-tight">MediTrack</h1>
          <p className="text-[11px] text-emerald-400 font-medium">Barangay Health Center</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-xs text-slate-500">
        <p className="font-semibold text-slate-400">MediTrack v1.0</p>
        <p className="truncate">Barangay Health Zone</p>
      </div>
    </aside>
  );
}