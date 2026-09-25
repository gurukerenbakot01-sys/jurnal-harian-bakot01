import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastState {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast.show) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  const borderColor = isError ? 'border-red-500' : isInfo ? 'border-blue-500' : 'border-emerald-500';
  const bgColor = isError ? 'bg-red-50' : isInfo ? 'bg-blue-50' : 'bg-emerald-50';
  const textColor = isError ? 'text-red-800' : isInfo ? 'text-blue-800' : 'text-emerald-900';
  const subTextColor = isError ? 'text-red-600' : isInfo ? 'text-blue-600' : 'text-emerald-700';

  return (
    <div
      id="toast-popup"
      className={`fixed top-4 right-4 z-[9999] flex items-start gap-3 ${bgColor} border-l-4 ${borderColor} rounded-lg shadow-xl p-4 max-w-sm transition-all duration-300 animate-in fade-in slide-in-from-top-3`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isError ? (
          <AlertCircle className="w-5 h-5 text-red-500" />
        ) : isInfo ? (
          <Info className="w-5 h-5 text-blue-500" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        )}
      </div>
      <div className="flex-1 pr-2">
        <h4 className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>
          {isError ? 'Perhatian' : isInfo ? 'Informasi' : 'Berhasil'}
        </h4>
        <p className={`text-xs mt-0.5 leading-relaxed ${subTextColor}`}>{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
