import React from 'react';
import { Home, BookOpen, CircleDot, Heart, ShieldCheck, Lock } from 'lucide-react';
import { CategoryId, QuoteType } from '../types';

interface BottomNavBarProps {
  activeCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  selectedType: 'all' | QuoteType;
  onSelectType: (type: 'all' | QuoteType) => void;
  onOpenTasbih: () => void;
  onOpenAdmin: () => void;
  favoritesCount: number;
  isAdmin: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeCategory,
  onSelectCategory,
  selectedType,
  onSelectType,
  onOpenTasbih,
  onOpenAdmin,
  favoritesCount,
  isAdmin,
}) => {
  const isHadithActive = selectedType === 'hadith';
  const isHomeActive = activeCategory === 'all' && selectedType === 'all';
  const isFavoritesActive = activeCategory === 'favorites';

  const handleHomeClick = () => {
    onSelectCategory('all');
    onSelectType('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHadithClick = () => {
    onSelectCategory('all');
    onSelectType('hadith');
    const el = document.getElementById('feed-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFavoritesClick = () => {
    onSelectCategory('favorites');
    const el = document.getElementById('feed-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav 
      aria-label="شريط تنقل التطبيق السفلي"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/92 dark:bg-stone-950/92 backdrop-blur-xl border-t border-emerald-900/10 dark:border-emerald-800/20 px-2 py-1.5 sm:hidden transition-colors shadow-2xl safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* 1. الرئيسية */}
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
            isHomeActive
              ? 'text-emerald-700 dark:text-emerald-300 scale-105 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5">الرئيسية</span>
        </button>

        {/* 2. الأحاديث النبوية */}
        <button
          onClick={handleHadithClick}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative ${
            isHadithActive
              ? 'text-emerald-700 dark:text-emerald-300 scale-105 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${isHadithActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5">الأحاديث</span>
          <span className="absolute top-0 right-1 w-1.5 h-1.5 bg-sky-500 rounded-full" />
        </button>

        {/* 3. المسبحة (Center Floating Action) */}
        <button
          onClick={onOpenTasbih}
          className="flex flex-col items-center justify-center -mt-4 py-1 px-3 rounded-full bg-gradient-to-br from-emerald-700 to-teal-900 text-amber-200 shadow-lg shadow-emerald-950/30 border-2 border-white dark:border-stone-900 active:scale-90 transition-transform"
          title="المسبحة الإلكترونية"
        >
          <CircleDot className="w-5 h-5 animate-spin-slow" />
          <span className="text-[9px] font-bold mt-0.5">تسبيح</span>
        </button>

        {/* 4. المفضلة */}
        <button
          onClick={handleFavoritesClick}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative ${
            isFavoritesActive
              ? 'text-rose-600 dark:text-rose-400 scale-105 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavoritesActive ? 'fill-rose-500 stroke-rose-500' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5">المفضلة</span>
          {favoritesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* 5. إدارة ونشر (أيوب العبيدي) */}
        <button
          onClick={onOpenAdmin}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all ${
            isAdmin
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-stone-500 dark:text-stone-400 hover:text-amber-600'
          }`}
          title="إدارة الموقع والنشر (أيوب العبيدي)"
        >
          {isAdmin ? (
            <ShieldCheck className="w-5 h-5 stroke-[2.2] text-amber-500" />
          ) : (
            <Lock className="w-5 h-5 stroke-[1.8]" />
          )}
          <span className="text-[10px] mt-0.5">
            {isAdmin ? 'نشر وإدارة' : 'الإدارة'}
          </span>
        </button>

      </div>
    </nav>
  );
};
