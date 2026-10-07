import { cn } from "../utils/cn";
import {
  CATEGORIES,
  KIND_META,
  type Quote,
} from "../data/quotes";
import {
  IconCopy,
  IconHeart,
  IconPalette,
  IconShare,
} from "./icons";

interface QuoteCardProps {
  quote: Quote;
  isFavorite: boolean;
  onCopy: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
  onDesign: () => void;
}

export function QuoteCard({
  quote,
  isFavorite,
  onCopy,
  onShare,
  onToggleFavorite,
  onDesign,
}: QuoteCardProps) {
  const kind = KIND_META[quote.kind];
  const category = CATEGORIES.find((c) => c.key === quote.category);
  const isQuran = quote.kind === "quran";
  const isHadith = quote.kind === "hadith";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1",
        isQuran
          ? "border-gold-300/50 bg-gradient-to-br from-white via-gold-50/70 to-emerald-50/60 shadow-[0_18px_40px_-24px_rgba(163,119,44,0.45)] hover:shadow-[0_28px_60px_-28px_rgba(163,119,44,0.55)] dark:border-gold-300/25 dark:from-night-800 dark:via-night-850 dark:to-night-900"
          : "border-emerald-900/10 bg-white/75 shadow-[0_18px_40px_-28px_rgba(6,60,40,0.35)] hover:border-gold-400/40 hover:shadow-[0_28px_55px_-30px_rgba(6,60,40,0.45)] dark:border-emerald-400/10 dark:bg-night-900/65 dark:hover:border-gold-300/25",
      )}
    >
      {/* زخرفة خفيفة */}
      <div
        className={cn(
          "pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100",
          isQuran
            ? "bg-gold-300/25 opacity-70"
            : "bg-emerald-400/15 opacity-0 group-hover:opacity-100",
        )}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-bold",
            isQuran
              ? "bg-gold-100 text-gold-700 dark:bg-gold-400/15 dark:text-gold-200"
              : quote.kind === "hadith"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200"
                : "bg-emerald-900/5 text-emerald-900 dark:bg-emerald-100/10 dark:text-emerald-100",
          )}
        >
          <span>{kind.icon}</span>
          {kind.short}
        </span>

        {category && (
          <span className="text-[0.7rem] font-semibold text-night-800/45 dark:text-emerald-100/45">
            {category.icon} {category.label}
          </span>
        )}
      </div>

      <div className="relative mt-5 flex-1">
        <blockquote
          className={cn(
            "leading-[2.1] text-night-900 dark:text-emerald-50",
            isQuran
              ? "font-serif text-xl font-bold sm:text-[1.35rem]"
              : isHadith
                ? "font-iphone text-lg font-semibold tracking-[-0.01em] sm:text-[1.15rem]"
                : "font-serif text-lg sm:text-[1.2rem]",
          )}
        >
          {quote.text}
        </blockquote>

        {quote.translation && (
          <p
            dir="ltr"
            className="mt-4 border-s-2 border-gold-300/60 ps-3 text-left text-[0.8rem] italic leading-relaxed text-night-800/55 dark:text-emerald-100/50"
          >
            “{quote.translation}”
          </p>
        )}
      </div>

      <footer className="relative mt-6 flex items-center gap-3 border-t border-emerald-900/10 pt-4 dark:border-emerald-400/10">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-emerald-900 dark:text-gold-200">
            {quote.author}
          </p>
          <p className="truncate text-xs text-night-800/50 dark:text-emerald-100/45">
            {quote.source}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <CardAction label="انسخ النص" onClick={onCopy}>
            <IconCopy className="h-4.5 w-4.5" />
          </CardAction>
          <CardAction label="شارك" onClick={onShare}>
            <IconShare className="h-4.5 w-4.5" />
          </CardAction>
          <CardAction
            label="صمّم بطاقة"
            onClick={onDesign}
            className="text-emerald-700 dark:text-emerald-300"
          >
            <IconPalette className="h-4.5 w-4.5" />
          </CardAction>
          <CardAction
            label={isFavorite ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
            onClick={onToggleFavorite}
            className={cn(
              isFavorite
                ? "bg-rose-500/15 text-rose-500 dark:text-rose-300"
                : "hover:text-rose-500 dark:hover:text-rose-300",
            )}
          >
            <IconHeart className="h-4.5 w-4.5" filled={isFavorite} />
          </CardAction>
        </div>
      </footer>
    </article>
  );
}

function CardAction({
  children,
  label,
  onClick,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl text-night-800/60 transition hover:bg-emerald-900/5 active:scale-90 dark:text-emerald-100/60 dark:hover:bg-emerald-100/10",
        className,
      )}
    >
      {children}
    </button>
  );
}
