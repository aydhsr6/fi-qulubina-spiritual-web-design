import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';

interface OrnateManagerSignatureProps {
  variant?: 'compact' | 'hero' | 'footer' | 'admin-banner';
  onAdminClick?: () => void;
  isAdmin?: boolean;
}

export const OrnateManagerSignature: React.FC<OrnateManagerSignatureProps> = ({
  variant = 'hero',
  onAdminClick,
  isAdmin = false,
}) => {
  if (variant === 'compact') {
    return (
      <button
        onClick={onAdminClick}
        className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-emerald-700/15 to-amber-500/10 border border-amber-500/30 hover:border-amber-400/60 shadow-sm transition-all duration-300 hover:scale-[1.02] text-xs"
        title="انقر للوصول إلى لوحة إدارة الموقع والنشر الخاص"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-0.5" />
        <span className="text-amber-800 dark:text-amber-300 font-medium">إشراف وإدارة:</span>
        <span
          className="font-bold text-emerald-950 dark:text-amber-200 tracking-wide font-serif"
          style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
        >
          أَيُّوب ضَارِي سَرْحَان العُبَيْدِي
        </span>
        {isAdmin && (
          <span className="bg-amber-400 text-stone-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            مُسجّل
          </span>
        )}
      </button>
    );
  }

  if (variant === 'admin-banner') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border border-amber-400/40 p-4 text-center text-amber-100 shadow-xl">
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-right">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-amber-300/80 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>لوحة التحكم والنشر الحصري نشطة</span>
              </div>
              <h4
                className="text-lg sm:text-xl font-bold text-amber-200 leading-tight font-serif"
                style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
              >
                أَيُّـوب ضَـارِي سَرْحَـان العُبَيْـدِي
              </h4>
            </div>
          </div>
          <div className="text-xs bg-emerald-800/80 text-amber-200 px-3 py-1.5 rounded-xl border border-amber-400/30 font-medium">
            لديك كامل الصلاحية للنشر والتعديل والحذف
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="relative py-6 px-4 my-6 rounded-3xl bg-gradient-to-b from-emerald-950/60 via-stone-900/80 to-emerald-950/70 border border-amber-500/25 shadow-xl text-center overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-2">
          {/* Top Calligraphic emblem */}
          <div className="flex items-center justify-center gap-3 text-amber-400/60 text-xs">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400/40" />
            <span>⚜️</span>
            <span className="tracking-widest text-[11px] font-medium text-amber-300/90">
              إِدَارَةُ وَتَطْوِيرُ المَوْقِع
            </span>
            <span>⚜️</span>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400/40" />
          </div>

          {/* Ornate Name */}
          <div className="py-1">
            <h3
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wider bg-gradient-to-l from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent drop-shadow-md select-text"
              style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
            >
              أَيُّـوب ضَـارِي سَرْحَـان العُبَيْـدِي
            </h3>
          </div>

          <p className="text-xs text-emerald-200/80 font-light max-w-md mx-auto">
            وفّقهُ الله تعالى وجعل هذا العمل خالصاً لوجهه الكريم وصدقة جارية ونوراً في القلوب
          </p>

          {/* Quick Admin Access Button */}
          <div className="pt-2">
            <button
              onClick={onAdminClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold transition-all hover:scale-105"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'فتح لوحة الإدارة والنشر' : 'دخول المشرف (أيوب العبيدي)'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: Hero Badge
  return (
    <div className="flex flex-col items-center justify-center my-4 text-center px-4">
      <div 
        onClick={onAdminClick}
        className="group relative cursor-pointer inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-stone-900/80 to-emerald-950/70 border border-amber-500/40 shadow-lg hover:border-amber-400/80 hover:shadow-amber-500/10 transition-all duration-300"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-base">⚜️</span>
          <span className="text-xs text-amber-300/90 font-medium">إدارة الموقع من قِبل:</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-lg sm:text-xl font-bold bg-gradient-to-l from-amber-100 via-amber-300 to-amber-200 bg-clip-text text-transparent font-serif"
            style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
          >
            أَيُّـوب ضَـارِي سَرْحَـان العُبَيْـدِي
          </span>
          <span className="text-amber-400 text-base">⚜️</span>
        </div>
      </div>
    </div>
  );
};
