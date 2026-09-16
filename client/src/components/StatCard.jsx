import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'emerald', subtitle, badgeText }) {
  const styles = {
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      glow: 'hover:border-emerald-300',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    blue: {
      bg: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      glow: 'hover:border-sky-300',
      badge: 'bg-sky-100 text-sky-800',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      glow: 'hover:border-amber-300',
      badge: 'bg-amber-100 text-amber-800',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      glow: 'hover:border-purple-300',
      badge: 'bg-purple-100 text-purple-800',
    },
  };

  const theme = styles[color] || styles.emerald;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm transition-all duration-200 hover:shadow-md ${theme.glow}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${theme.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badgeText && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badge}`}>
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}