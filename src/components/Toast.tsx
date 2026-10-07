import React from 'react';
import { CheckCircle2, Heart, Share2, Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'favorite' | 'share' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none max-w-sm w-full px-4">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        if (toast.type === 'favorite') {
          icon = <Heart className="w-5 h-5 text-rose-400 fill-rose-400 shrink-0" />;
        } else if (toast.type === 'share') {
          icon = <Share2 className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (toast.type === 'info') {
          icon = <Sparkles className="w-5 h-5 text-emerald-300 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-stone-900/95 dark:bg-stone-900/95 text-stone-100 rounded-2xl shadow-xl border border-emerald-500/30 backdrop-blur-md text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-300 w-full"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-200 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
