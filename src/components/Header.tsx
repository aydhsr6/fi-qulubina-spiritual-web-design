import { cn } from "../utils/cn";
import { Logo } from "./Decor";
import { IconHeart, IconMoon, IconSun } from "./icons";
import { NAV_ITEMS, type ViewKey } from "../lib/nav";
import type { ThemeMode } from "../lib/hooks";

interface HeaderProps {
  activeView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  favoritesCount: number;
  progress: number;
}

export function Header({
  activeView,
  onNavigate,
  theme,
  onToggleTheme,
  favoritesCount,
  progress,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-[#f2f8f4]/85 backdrop-blur-xl dark:border-gold-300/10 dark:bg-night-950/85">
      {/* شريط تقدّم القراءة */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 origin-right bg-gradient-to-l from-gold-300 via-gold-500 to-emerald-600 transition-transform duration-150"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
          aria-label="في قلوبنا — الصفحة الرئيسية"
        >
          <Logo />
        </button>

        {/* تنقّل سطح المكتب */}
        <nav
          className="mx-auto hidden items-center gap-1 rounded-full border border-emerald-900/10 bg-white/60 p-1.5 shadow-sm dark:border-gold-300/10 dark:bg-night-900/60 lg:flex"
          aria-label="التنقل الرئيسي"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeView === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
                  active
                    ? "bg-gradient-to-l from-emerald-700 to-emerald-900 text-gold-100 shadow-md shadow-emerald-900/25"
                    : "text-night-800/70 hover:bg-emerald-900/5 hover:text-emerald-900 dark:text-emerald-100/70 dark:hover:bg-emerald-100/10 dark:hover:text-gold-100",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.key === "favorites" && favoritesCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1.5 text-[0.7rem] font-bold text-night-900">
                    {favoritesCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-900/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-night-800/55 dark:border-gold-300/10 dark:bg-night-900/60 dark:text-emerald-100/50 sm:flex lg:hidden">
            <IconHeart className="h-3.5 w-3.5 text-rose-400" filled={favoritesCount > 0} />
            {favoritesCount}
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/10 bg-white/70 text-night-800 transition hover:border-gold-400/60 hover:text-gold-600 dark:border-gold-300/15 dark:bg-night-900/70 dark:text-gold-200 dark:hover:text-gold-100"
            aria-label={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
            title={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {theme === "dark" ? (
              <IconSun className="h-5 w-5" />
            ) : (
              <IconMoon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
