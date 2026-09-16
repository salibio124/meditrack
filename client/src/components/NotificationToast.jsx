import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-emerald-50/95 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50/95 border-rose-200 text-rose-900',
    info: 'bg-sky-50/95 border-sky-200 text-sky-900',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all ${bgStyles[toast.type] || bgStyles.info}`}>
        {icons[toast.type] || icons.info}
        <div className="text-xs font-semibold pr-2">{toast.message}</div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-lg transition text-slate-500 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}