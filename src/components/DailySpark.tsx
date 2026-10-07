import React, { useState } from 'react';
import { Quote } from '../types';
import { cleanQuoteText } from '../utils/quoteText';
import { 
  Sparkles, 
  Shuffle, 
  Copy, 
  Share2, 
  Heart, 
  Palette, 
  BookOpen, 
  Check,
  Compass
} from 'lucide-react';

interface DailySparkProps {
  quote: Quote;
  onShuffle: () => void;
  onCopy: (quote: Quote) => void;
  onShare: (quote: Quote) => void;
  onDesignCard: (quote: Quote) => void;
  isFavorite: boolean;
  onToggleFavorite: (quote: Quote) => void;
  copiedId: string | null;
}

export const DailySpark: React.FC<DailySparkProps> = ({
  quote,
  onShuffle,
  onCopy,
  onShare,
  onDesignCard,
  isFavorite,
  onToggleFavorite,
  copiedId
}) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleShuffle = () => {
    setIsSpinning(true);
    onShuffle();
    setTimeout(() => setIsSpinning(false), 600);
  };

  const isCopied = copiedId === quote.id;

  const typeLabels = {
    quran: 'آية وتدبر',
    hadith: 'حديث شريف',
    scholar: 'درة من الأثر',
    reflection: 'خاطرة للروح'
  };

  return (
    <section id="daily-spark" className="relative py-8 sm:py-12 overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-emerald-500/15 via-teal-400/10 to-amber-400/15 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-stone-100 p-6 sm:p-10 shadow-2xl shadow-emerald-950/40 border border-emerald-500/30 overflow-hidden">
          
          {/* Subtle Arabesque Motif SVG in Background */}
          <div className="absolute -top-16 -left-16 w-64 h-64 opacity-10 pointer-events-none text-amber-300">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <path d="M100 0 L120 70 L190 70 L135 110 L155 180 L100 140 L45 180 L65 110 L10 70 L80 70 Z" />
            </svg>
          </div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 opacity-10 pointer-events-none text-emerald-300">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="4" fill="none" />
              <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {/* Header Row: Badge & Shuffle */}
          <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-sm shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>قبس اليوم المعطر</span>
              </span>
              <span className="text-xs text-emerald-300/80 font-medium hidden sm:inline-block">
                • {typeLabels[quote.type]}
                {quote.type === 'hadith' && ' • بخط الآيفون'}
              </span>
            </div>

            <button
              onClick={handleShuffle}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-200 text-xs font-medium border border-emerald-600/40 transition-all duration-200 hover:shadow-lg active:scale-95"
              title="تغيير القبس عشوائياً"
            >
              <Shuffle className={`w-3.5 h-3.5 transition-transform duration-500 ${isSpinning ? 'rotate-180' : ''}`} />
              <span>قبس آخر</span>
            </button>
          </div>

          {/* Main Quote Text */}
          <div className="my-8 sm:my-12 text-center px-2 sm:px-8 relative z-10">
            <p 
              className={`text-xl sm:text-2xl md:text-3xl leading-relaxed sm:leading-loose font-medium text-amber-50 drop-shadow-sm transition-all duration-300 ${
                quote.type === 'hadith' ? 'font-iphone font-normal' : ''
              }`}
              style={{ 
                fontFamily: quote.type === 'hadith' 
                  ? '-apple-system, BlinkMacSystemFont, "SF Pro Arabic", "SF Pro Text", "IBM Plex Sans Arabic", "Geeza Pro", sans-serif'
                  : quote.type === 'quran' 
                  ? "'Amiri', serif" 
                  : "'Aref Ruqaa', 'Amiri', serif" 
              }}
            >
              {cleanQuoteText(quote.text)}
            </p>
          </div>

          {/* Source Attribution & Explanation */}
          <div className="flex flex-col items-center justify-center gap-2 relative z-10 mb-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide shadow-inner">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{quote.author ? `${quote.author} • ${quote.source}` : quote.source}</span>
            </div>

            {quote.explanation && (
              <p className="text-xs sm:text-sm text-stone-300/90 max-w-2xl text-center leading-normal mt-1 flex items-center justify-center gap-1.5 font-light">
                <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{quote.explanation}</span>
              </p>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 relative z-10">
            
            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {quote.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-900/80 text-emerald-300/90 border border-emerald-700/40"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Copy */}
              <button
                onClick={() => onCopy(quote)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-800/70 hover:bg-emerald-700 text-emerald-100'
                }`}
                title="نسخ النص"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'تم النسخ' : 'نسخ'}</span>
              </button>

              {/* Share */}
              <button
                onClick={() => onShare(quote)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-800/70 hover:bg-emerald-700 text-emerald-100 transition-all"
                title="مشاركة النص"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة</span>
              </button>

              {/* Favorite */}
              <button
                onClick={() => onToggleFavorite(quote)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isFavorite
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-800/70 hover:bg-emerald-700 text-emerald-100'
                }`}
                title="حفظ في المفضلة"
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>{isFavorite ? 'محفوظة' : 'حفظ'}</span>
              </button>

              {/* Design Card */}
              <button
                onClick={() => onDesignCard(quote)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md hover:shadow-amber-500/20 transition-all"
                title="صمم بطاقة جاهزة للنشر والتنزيل"
              >
                <Palette className="w-3.5 h-3.5 text-stone-950" />
                <span>صمّم بطاقة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
