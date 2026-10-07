import { cn } from "../utils/cn";
import { CATEGORIES, type CategoryKey } from "../data/quotes";

export type FilterKey = CategoryKey | "all";

interface CategoryFiltersProps {
  active: FilterKey;
  counts: Record<FilterKey, number>;
  onChange: (key: FilterKey) => void;
}

export function CategoryFilters({
  active,
  counts,
  onChange,
}: CategoryFiltersProps) {
  const items: { key: FilterKey; label: string; icon: string }[] = [
    { key: "all", label: "الكل", icon: "✨" },
    ...CATEGORIES.map((c) => ({ key: c.key as FilterKey, label: c.label, icon: c.icon })),
  ];

  return (
    <div
      className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      role="tablist"
      aria-label="تصفية الاقتباسات"
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.key)}
            className={cn(
              "group inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300",
              isActive
                ? "border-transparent bg-gradient-to-l from-emerald-700 to-emerald-900 text-gold-100 shadow-lg shadow-emerald-900/20"
                : "border-emerald-900/10 bg-white/70 text-night-800/75 hover:border-gold-400/60 hover:text-emerald-900 dark:border-emerald-400/15 dark:bg-night-900/60 dark:text-emerald-100/75 dark:hover:text-gold-100",
            )}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[0.7rem] font-bold tabular-nums",
                isActive
                  ? "bg-white/20 text-gold-100"
                  : "bg-emerald-900/5 text-night-800/50 dark:bg-emerald-100/10 dark:text-emerald-100/50",
              )}
            >
              {counts[item.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
