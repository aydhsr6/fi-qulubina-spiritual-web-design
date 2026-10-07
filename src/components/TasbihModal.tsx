import React, { useState } from 'react';
import { TASBIH_ITEMS } from '../data/quotesData';
import { 
  X, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Volume2, 
  VolumeX, 
  HeartHandshake 
} from 'lucide-react';

interface TasbihModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TasbihModal: React.FC<TasbihModalProps> = ({ isOpen, onClose }) => {
  const [selectedDhikrIndex, setSelectedDhikrIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  const currentItem = TASBIH_ITEMS[selectedDhikrIndex];
  const count = counts[currentItem.id] || 0;
  const isGoalReached = count >= currentItem.target;
  const progressPercent = Math.min(100, Math.round((count / currentItem.target) * 100));

  // Audio click synthesizer
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isGoalReached ? 880 : 520, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // AudioContext unavailable
    }
  };

  const handleIncrement = () => {
    setCounts((prev) => ({
      ...prev,
      [currentItem.id]: (prev[currentItem.id] || 0) + 1
    }));

    if (navigator.vibrate) {
      navigator.vibrate(isGoalReached ? [40, 40, 40] : 20);
    }

    playClickSound();
  };

  const handleReset = () => {
    setCounts((prev) => ({
      ...prev,
      [currentItem.id]: 0
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-700/10 text-emerald-700 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                المسبحة الإلكترونية
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                ألا بذكر الله تطمئن القلوب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              title={soundEnabled ? 'كتم الصوت' : 'تفعيل صوت النقر'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center space-y-6">
          
          {/* Dhikr Selector Tabs */}
          <div className="w-full overflow-x-auto pb-2 flex gap-1.5 scrollbar-none">
            {TASBIH_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setSelectedDhikrIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDhikrIndex === idx
                    ? 'bg-emerald-800 text-amber-200 shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {item.phrase.split(' ').slice(0, 2).join(' ')}...
              </button>
            ))}
          </div>

          {/* Current Dhikr Phrase */}
          <div className="text-center px-4">
            <h4 
              className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-2 leading-relaxed"
              style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
            >
              {currentItem.phrase}
            </h4>
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-900/50">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{currentItem.virtue}</span>
            </div>
          </div>

          {/* Circular Counter Button */}
          <div className="relative flex items-center justify-center my-2">
            
            {/* Outer Circular SVG progress */}
            <svg className="w-48 h-48 -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="84"
                className="stroke-stone-200 dark:stroke-stone-800 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="96"
                cy="96"
                r="84"
                className="stroke-emerald-600 dark:stroke-emerald-400 fill-none transition-all duration-300 stroke-linecap-round"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 84}
                strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
              />
            </svg>

            {/* Click Button */}
            <button
              onClick={handleIncrement}
              className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white shadow-xl shadow-emerald-950/30 flex flex-col items-center justify-center active:scale-95 transition-transform duration-100 hover:brightness-105 border-2 border-emerald-400/40 select-none group"
            >
              <span className="text-4xl font-extrabold font-mono tracking-tight text-amber-200 group-active:scale-110 transition-transform">
                {count}
              </span>
              <span className="text-xs text-emerald-200/80 font-medium mt-1">
                الهدف: {currentItem.target}
              </span>
            </button>
          </div>

          {/* Goal Achieved Notice */}
          {isGoalReached && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700 animate-bounce">
              <Check className="w-4 h-4" />
              <span>أتممت الهدف المبارك بحمد الله! تقبل الله طاعتكم</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between w-full pt-2 border-t border-stone-100 dark:border-stone-800">
            <span className="text-xs text-stone-400">
              المكتمل: {progressPercent}%
            </span>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير العداد</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
