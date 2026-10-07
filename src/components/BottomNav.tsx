import { cn } from "../utils/cn";
import { NAV_ITEMS, type ViewKey } from "../lib/nav";

interface BottomNavProps {
  activeView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  favoritesCount: number;
}

/** شريط تنقّل سفلي على الجوال — يعطي الموقع إحساس التطبيق */
export function BottomNav({
  activeView,
  onNavigate,
  favoritesCount,
}: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      aria-label="التنقل السفلي"
    >
      <div
        className="border-t border-emerald-900/10 bg-[#f2f8f4]/92 backdrop-blur-xl dark:border-gold-300/10 dark:bg-night-950/92"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <ul className="mx-auto flex max-w-lg items-stretch px-1.5">
          {NAV_ITEMS.map((item) => {
            const active = activeView === item.key;
            return (
              <li key={item.key} className="flex-1">
                <button
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex w-full flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[0.62rem] font-bold transition-colors duration-200",
                    active
                      ? "text-emerald-900 dark:text-gold-200"
                      : "text-night-800/45 dark:text-emerald-100/40",
                  )}
                >
                  {active && (
                    <span className="absolute top-0 h-[3px] w-9 rounded-full bg-gradient-to-l from-gold-300 via-gold-400 to-emerald-600" />
                  )}
                  <span className="relative">
                    <item.icon
                      className={cn(
                        "h-[1.35rem] w-[1.35rem] transition-transform duration-200",
                        active && "scale-110",
                      )}
                    />
                    {item.key === "favorites" && favoritesCount > 0 && (
                      <span className="absolute -top-1.5 -left-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.6rem] font-bold text-white">
                        {favoritesCount}
                      </span>
                    )}
                  </span>
                  {item.short}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
