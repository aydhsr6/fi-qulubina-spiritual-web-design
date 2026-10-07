import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Moon, 
  Sun, 
  Search, 
  Volume2, 
  VolumeX, 
  CircleDot, 
  Menu, 
  X,
  BookOpen,
  ShieldCheck, 
  Lock
} from 'lucide-react';
import { OrnateManagerSignature } from './OrnateManagerSignature';
import { BrandEmblem } from './BrandIdentity';

interface HeaderProps {
  favoritesCount: number;
  activeCategory: string;
  onSelectCategory: (category: any) => void;
  onOpenTasbih: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  favoritesCount,
  activeCategory,
  onSelectCategory,
  onOpenTasbih,
  isAudioPlaying,
  onToggleAudio,
  isDarkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  onOpenAdmin,
  isAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleNavClick = (catId?: string, elementId?: string) => {
    if (catId) {
      onSelectCategory(catId);
    }
    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-stone-950/85 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-800/20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => handleNavClick('all', 'root')}
            aria-label="العودة إلى الرئيسية - في قلوبنا"
            className="group flex shrink-0 items-center gap-2 text-right sm:gap-3"
          >
            <div className="size-11 shrink-0 overflow-hidden rounded-full bg-[#fffefa] shadow-[0_3px_14px_rgba(142,107,44,0.16)] ring-1 ring-[#c7a35e]/40 transition-transform duration-300 group-hover:scale-105 sm:size-12">
              <BrandEmblem className="size-full rounded-full" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span 
                  className="whitespace-nowrap bg-gradient-to-l from-[#b38b45] via-[#805c28] to-[#bd9752] bg-clip-text text-xl font-extrabold tracking-tight text-transparent dark:from-[#f1dbaa] dark:via-[#cb9e55] dark:to-[#e2c485] sm:text-3xl"
                  style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
                >
                  فِي قُلُوبِنَا
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800 hidden sm:inline-block">
                  تطبيق الروح والذكر
                </span>
              </div>
              <div className="mt-0.5 hidden items-center gap-1.5 sm:flex">
                <span className="font-serif text-[10px] font-bold text-amber-700 dark:text-amber-300 sm:text-[11px]">
                  إشراف: أَيُّوب ضَارِي سَرْحَان العُبَيْدِي
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <div className="hidden xl:block ml-2">
              <OrnateManagerSignature variant="compact" onAdminClick={onOpenAdmin} isAdmin={isAdmin} />
            </div>
            <button
              onClick={() => handleNavClick('all', 'daily-spark')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-stone-100/50 dark:hover:bg-stone-900/50'
              }`}
            >
              الرئيسية
            </button>

            <button
              onClick={() => handleNavClick('all', 'daily-spark')}
              className="px-3 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-stone-100/50 dark:hover:bg-stone-900/50 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              قبس اليوم
            </button>

            <button
              onClick={() => handleNavClick('scholars', 'feed-section')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === 'scholars'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-stone-100/50 dark:hover:bg-stone-900/50'
              }`}
            >
              درر العلماء
            </button>

            <button
              onClick={() => handleNavClick('softeners', 'feed-section')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === 'softeners'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-stone-100/50 dark:hover:bg-stone-900/50'
              }`}
            >
              رقائق القلوب
            </button>

            {/* Tasbih button */}
            <button
              onClick={onOpenTasbih}
              className="px-3 py-2 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-all flex items-center gap-1.5 border border-emerald-200/60 dark:border-emerald-800/60"
            >
              <CircleDot className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
              المسبحة الإلكترونية
            </button>

            {/* Favorites link */}
            <button
              onClick={() => handleNavClick('favorites', 'feed-section')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 relative ${
                activeCategory === 'favorites'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                  : 'text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
              }`}
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
              <span>المفضلة</span>
              {favoritesCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-rose-500 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Search Toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl px-3 py-1.5 border border-emerald-500/30">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث عن آية أو اسم عالم..."
                    className="bg-transparent border-none outline-none text-xs sm:text-sm w-36 sm:w-48 text-stone-800 dark:text-stone-100 placeholder:text-stone-400"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="text-stone-400 hover:text-stone-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="بحث سريع"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Peaceful Audio Recitation Trigger */}
            <button
              onClick={onToggleAudio}
              className={`p-2.5 rounded-xl transition-all relative ${
                isAudioPlaying 
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/40' 
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title={isAudioPlaying ? 'إيقاف التلاوة الهادئة' : 'تشغيل تلاوة خاشعة هادئة'}
            >
              {isAudioPlaying ? (
                <Volume2 className="w-4 h-4 animate-pulse text-amber-600 dark:text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 opacity-70" />
              )}
            </button>

            {/* Admin Publishing Portal Trigger */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isAdmin
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:brightness-110 shadow-amber-500/20'
                  : 'bg-emerald-900/10 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-800 hover:text-amber-200 border border-emerald-500/30'
              }`}
              title={isAdmin ? 'لوحة النشر والإدارة الخاصة بك' : 'دخول إدارة الموقع (أيوب العبيدي)'}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-950" />
                  <span className="hidden sm:inline">لوحة النشر 👑</span>
                  <span className="sm:hidden">نشر</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">إدارة ونشر</span>
                  <span className="sm:hidden">الإدارة</span>
                </>
              )}
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-800" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 lg:hidden"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-emerald-900/10 dark:border-emerald-800/20 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => handleNavClick('all', 'daily-spark')}
              className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between"
            >
              <span>الرئيسية</span>
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={() => handleNavClick('all', 'daily-spark')}
              className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between"
            >
              <span>قبس اليوم المعطر</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </button>
            <button
              onClick={() => handleNavClick('scholars', 'feed-section')}
              className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between"
            >
              <span>درر وأقوال السلف</span>
              <span className="text-xs text-stone-400">ابن القيم، الغزالي</span>
            </button>
            <button
              onClick={() => handleNavClick('softeners', 'feed-section')}
              className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between"
            >
              <span>رقائق القلوب والمشاعر</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTasbih();
              }}
              className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-emerald-600" />
                <span>المسبحة الإلكترونية</span>
              </div>
              <span className="text-xs bg-emerald-200 dark:bg-emerald-800 px-2 py-0.5 rounded-full">ذكر</span>
            </button>
            <button
              onClick={() => handleNavClick('favorites', 'feed-section')}
              className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between text-rose-600 dark:text-rose-400"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-500" />
                <span>المفضلة والمحفوظات</span>
              </div>
              {favoritesCount > 0 && (
                <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500/20 to-emerald-950/20 text-amber-800 dark:text-amber-300 flex items-center justify-between border border-amber-400/40"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>إدارة الموقع والنشر (أيوب العبيدي)</span>
              </div>
              <span className="text-xs bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full font-bold">
                {isAdmin ? 'نشط 👑' : 'دخول'}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
