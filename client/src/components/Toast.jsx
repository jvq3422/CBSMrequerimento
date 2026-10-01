import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed top-3 left-3 right-3 z-50 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-150">
      <div className="pointer-events-auto max-w-md w-full bg-white text-black border-[3px] border-black rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 font-black">
          {toast.type === 'error' ? (
            <XCircle className="w-6 h-6 text-white" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-white" />
          ) : (
            <CheckCircle className="w-6 h-6 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-sm font-black uppercase tracking-wider text-black">
              {toast.title}
            </h4>
          )}
          <p className="text-xs font-bold leading-snug mt-0.5 text-neutral-800">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-neutral-100 hover:bg-black hover:text-white border border-black text-black transition-colors"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
