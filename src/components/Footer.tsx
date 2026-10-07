import React from 'react';
import { Heart, Sparkles, BookOpen, Compass, CircleDot } from 'lucide-react';
import { OrnateManagerSignature } from './OrnateManagerSignature';
import { BrandEmblem } from './BrandIdentity';

interface FooterProps {
  onSelectCategory: (cat: any) => void;
  onOpenTasbih: () => void;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ 
  onSelectCategory, 
  onOpenTasbih,
  onOpenAdmin,
  isAdmin 
}) => {
  return (
    <footer className="mt-20 border-t border-emerald-900/10 dark:border-emerald-800/20 bg-stone-100/80 dark:bg-stone-950/90 text-stone-700 dark:text-stone-300 transition-colors">
      
      {/* Top Banner Duaa */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 text-stone-100 py-8 px-4 text-center border-b border-amber-400/20">
        <div className="max-w-3xl mx-auto space-y-2">
          <p 
            className="text-lg sm:text-xl md:text-2xl font-serif text-amber-200 leading-relaxed drop-shadow-sm"
            style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
          >
            اللَّهُمَّ اجْعَلِ القُرْآنَ رَبِيعَ قُلُوبِنَا، وَنُورَ صُدُورِنَا، وَجَلَاءَ أَحْزَانِنَا، وَذَهَابَ هُمُومِنَا
          </p>
          <p className="text-xs text-emerald-300/80 font-light">
            نسأل الله أن يجعل هذه الكلمات شواهد لنا لا علينا، وزاداً تطمئن به القلوب الحائرة
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-11 shrink-0 overflow-hidden rounded-full bg-[#fffefa] ring-1 ring-amber-600/30">
                <BrandEmblem className="size-full rounded-full" />
              </div>
              <span 
                className="text-2xl font-bold text-[#a47d3d] dark:text-[#e2c485]"
                style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
              >
                فِي قُلُوبِنَا
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed max-w-md">
              منصة روحية مستلهمة من ينابيع الوحي الصافي، تجمع أرق الآيات القرآنية، وصحيح السنة النبوية، ودرر أقوال السلف، لتكون بلسماً للأرواح وسكينة للمؤمنين في صخب الحياة.
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>أقسام الواحة</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectCategory('patience')}
                  className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  الصبر واليقين عند الشدائد
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('scholars')}
                  className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  درر ابن القيم والإمام الغزالي
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('love')}
                  className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  حب الله تعالى وأنس القلوب
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('softeners')}
                  className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  رقائق ومواعظ القلوب
                </button>
              </li>
            </ul>
          </div>

          {/* Utilities */}
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>أدوات مساعدة</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenTasbih}
                  className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <CircleDot className="w-3.5 h-3.5 text-emerald-500" />
                  <span>المسبحة والذكر الرقمي</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('favorites')}
                  className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 text-rose-600 dark:text-rose-400"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>بطاقاتي المفضلة</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('daily-spark');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>قبس اليوم المتجدد</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Grand Ornate Management Signature */}
        <OrnateManagerSignature 
          variant="footer" 
          onAdminClick={onOpenAdmin} 
          isAdmin={isAdmin} 
        />

        {/* Bottom copyright */}
        <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 dark:text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} في قلوبنا • Fi Qulubina - صُمم خالصاً لوجه الله تعالى</p>
          <div className="flex items-center gap-1">
            <span>إدارة وتطوير: أَيُّوب ضَارِي سَرْحَان العُبَيْدِي</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
