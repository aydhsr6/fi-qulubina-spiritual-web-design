import React, { useState } from 'react';
import { Quote } from '../types';
import { cleanQuoteText } from '../utils/quoteText';
import { 
  Heart, 
  Copy, 
  Share2, 
  Palette, 
  Check, 
  BookOpen, 
  Compass, 
  Sparkles, 
  Volume2,
  Smartphone,
  Trash2
} from 'lucide-react';

interface QuoteCardProps {
  quote: Quote;
  isFavorite: boolean;
  onToggleFavorite: (quote: Quote) => void;
  onCopy: (quote: Quote) => void;
  onShare: (quote: Quote) => void;
  onDesignCard: (quote: Quote) => void;
  isCopied: boolean;
  isAdmin?: boolean;
  onDeleteQuote?: (id: string) => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  isFavorite,
  onToggleFavorite,
  onCopy,
  onShare,
  onDesignCard,
  isCopied,
  isAdmin = false,
  onDeleteQuote
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [useIphoneFont, setUseIphoneFont] = useState(true);

  // Type-specific badge styling
  const getTypeBadge = () => {
    switch (quote.type) {
      case 'quran':
        return {
          label: 'آية كريمة',
          classes: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-700/50'
        };
      case 'hadith':
        return {
          label: 'حديث نبوي شريف',
          classes: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300/50 dark:border-teal-700/50'
        };
      case 'scholar':
        return {
          label: quote.author ? quote.author : 'درر السلف',
          classes: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300/50 dark:border-amber-700/50'
        };
      case 'reflection':
      default:
        return {
          label: 'خاطرة للروح',
          classes: 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border-purple-300/50 dark:border-purple-700/50'
        };
    }
  };

  const badge = getTypeBadge();

  // Web Speech API text-to-speech for accessible listening
  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanQuoteText(quote.text));
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 hover:border-emerald-500/40 dark:hover:border-emerald-600/40 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 dark:hover:shadow-emerald-950/30 transition-all duration-300">
      
      {/* Top Header: Badge & Favorite Button */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.classes}`}>
            <Sparkles className="w-3 h-3" />
            <span>{badge.label}</span>
          </span>

          {quote.type === 'hadith' && (
            <button
              onClick={() => setUseIphoneFont(!useIphoneFont)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                useIphoneFont
                  ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700'
              }`}
              title="انقر للتبديل بين خط الآيفون والخط الكلاسيكي"
            >
              <Smartphone className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>{useIphoneFont ? 'بخط الآيفون' : 'خط كلاسيكي'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* TTS Listen */}
          <button
            onClick={handleReadAloud}
            className={`p-2 rounded-xl text-xs transition-colors ${
              isSpeaking
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={isSpeaking ? 'إيقاف الاستماع' : 'استمع للنص بصوت واضح'}
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>

          {/* Favorite toggle */}
          <button
            onClick={() => onToggleFavorite(quote)}
            className={`p-2 rounded-xl transition-all ${
              isFavorite
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
                : 'text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            aria-label="المفضلة"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Admin Delete Action for published/any card */}
          {isAdmin && onDeleteQuote && (
            <button
              onClick={() => {
                if (window.confirm('أستاذ أيوب: هل تريد حذف هذه البطاقة نهائياً من الموقع؟')) {
                  onDeleteQuote(quote.id);
                }
              }}
              className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="حذف هذا المنشور من الموقع (خاص بالمدير)"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
          )}
        </div>
      </div>

      {/* Main Quote Text Body */}
      <div className="my-2 flex-1">
        <p
          className={`text-lg sm:text-xl font-normal leading-loose text-stone-800 dark:text-stone-100 tracking-wide select-text py-1 ${
            quote.type === 'hadith' && useIphoneFont ? 'font-iphone' : ''
          }`}
          style={{
            fontFamily:
              quote.type === 'hadith' && useIphoneFont
                ? '-apple-system, BlinkMacSystemFont, "SF Pro Arabic", "SF Pro Text", "IBM Plex Sans Arabic", "Geeza Pro", sans-serif'
                : quote.type === 'quran'
                ? "'Amiri', serif"
                : "'Aref Ruqaa', 'Amiri', serif"
          }}
        >
          {cleanQuoteText(quote.text)}
        </p>

        {/* Source citation */}
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50">
            {quote.source}
          </span>
        </div>

        {/* Optional Spiritual Reflection / Tadabbur Note */}
        {quote.explanation && (
          <div className="mt-3">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-[11px] font-medium text-stone-500 hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <Compass className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{showExplanation ? 'إخفاء الإضاءة الروحية' : 'إضاءة وتدبر قلبي...'}</span>
            </button>
            {showExplanation && (
              <p className="mt-1.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 text-xs leading-relaxed border border-stone-200/60 dark:border-stone-800 animate-in fade-in duration-200 font-light">
                {quote.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Tags & Action Toolbar */}
      <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {quote.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 justify-end">
          {/* Copy Button */}
          <button
            onClick={() => onCopy(quote)}
            className={`p-2 rounded-xl text-xs flex items-center gap-1 font-medium transition-colors ${
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title="نسخ النص للحافظة"
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs">{isCopied ? 'تم' : 'نسخ'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => onShare(quote)}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1"
            title="مشاركة النص"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">مشاركة</span>
          </button>

          {/* Card Designer Modal Button */}
          <button
            onClick={() => onDesignCard(quote)}
            className="p-2 px-2.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1.5"
            title="تصميم بطاقة قابلة للتحميل والنشر"
          >
            <Palette className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>تصميم بطاقة</span>
          </button>
        </div>
      </div>
    </article>
  );
};
