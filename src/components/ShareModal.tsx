import React, { useState } from 'react';
import { Quote } from '../types';
import { cleanQuoteText } from '../utils/quoteText';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  MessageSquare, 
  Globe
} from 'lucide-react';

interface ShareModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type?: 'success' | 'favorite' | 'share' | 'info') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  quote,
  isOpen,
  onClose,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !quote) return null;

  const formattedShareText = `${cleanQuoteText(quote.text)}\n\n${quote.author ? `${quote.author} • ${quote.source}` : quote.source}\n\n#في_قلوبنا #واحة_الذكر`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedShareText);
      setCopied(true);
      onShowToast('تم نسخ النص المنسّق للمشاركة بنجاح ✨', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('تعذر النسخ، يرجى تحديده يدوياً', 'info');
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedShareText)}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(formattedShareText)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(formattedShareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                مشاركة النفحة الإيمانية
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                انشر الخير والدال على الخير كفاعله
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 text-sm leading-relaxed text-stone-800 dark:text-stone-200 relative">
            <p className="font-serif leading-loose mb-2">{cleanQuoteText(quote.text)}</p>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {quote.author ? `${quote.author} • ${quote.source}` : quote.source}
            </div>
            <div className="text-[11px] text-stone-400 mt-2 font-mono">
              #في_قلوبنا
            </div>
          </div>

          {/* Sharing Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={shareToWhatsApp}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-colors text-xs font-semibold gap-1.5"
            >
              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>واتساب</span>
            </button>

            <button
              onClick={shareToTelegram}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800 transition-colors text-xs font-semibold gap-1.5"
            >
              <Send className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>تيليجرام</span>
            </button>

            <button
              onClick={shareToTwitter}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-colors text-xs font-semibold gap-1.5"
            >
              <Globe className="w-5 h-5 text-stone-700 dark:text-stone-300" />
              <span>منصة إكس</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-800 text-amber-200 hover:bg-emerald-900 border-emerald-700 shadow-sm'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ بنجاح ✨' : 'نسخ النص كاملاً للحافظة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
