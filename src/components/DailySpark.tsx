import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { CATEGORIES, KIND_META, type Quote } from "../data/quotes";
import {
  IconCopy,
  IconHeart,
  IconPalette,
  IconShare,
  IconShuffle,
  IconSparkles,
} from "./icons";

interface DailySparkProps {
  quote: Quote;
  isFavorite: boolean;
  onShuffle: () => void;
  onCopy: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
  onDesign: () => void;
}

const todayLabel = () =>
  new Date().toLocaleDateString("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export function DailySpark({
  quote,
  isFavorite,
  onShuffle,
  onCopy,
  onShare,
  onToggleFavorite,
  onDesign,
}: DailySparkProps) {
  const [date, setDate] = useState("");
  useEffect(() => setDate(todayLabel()), []);

  const kind = KIND_META[quote.kind];
  const category = CATEGORIES.find((c) => c.key === quote.category);

  return (
    <section
      aria-label="بريق اليوم"
      className="relative overflow-hidden rounded-[2rem] border border-gold-300/40 bg-gradient-to-bl from-emerald-800 via-emerald-900 to-night-950 px-5 py-8 text-emerald-50 shadow-[0_30px_70px_-30px_rgba(4,47,31,0.75)] sm:px-10 sm:py-12"
    >
      {/* زخارف */}
      <div className="geo-pattern-lg pointer-events-none absolute inset-0 opacity-[0.13]" />
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-gold-400/25 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -left-20 bottom-[-6rem] h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-night-950/60 to-transparent" />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-300/50 bg-gold-300/10 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-200">
            <IconSparkles className="h-4 w-4" />
            بريق اليوم
          </span>
          {date && (
            <span className="text-xs font-medium text-emerald-200/70">{date}</span>
          )}
        </div>

        <blockquote
          key={quote.id}
          className={cn(
            "animate-pop mt-7 leading-[2] text-emerald-50",
            quote.kind === "hadith"
              ? "font-iphone text-2xl font-semibold tracking-[-0.01em] sm:text-[1.9rem] sm:leading-[1.95] md:text-[2rem]"
              : "font-serif text-2xl sm:text-3xl sm:leading-[1.9] md:text-[2.1rem]",
          )}
        >
          {quote.text}
        </blockquote>

        {quote.translation && (
          <p
            dir="ltr"
            className="mx-auto mt-5 max-w-xl text-left text-sm leading-relaxed text-emerald-200/75 italic"
          >
            “{quote.translation}”
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
          <span className="font-bold text-gold-200">{quote.author}</span>
          <span className="h-1 w-1 rounded-full bg-gold-300/60" />
          <span className="text-emerald-100/70">{quote.source}</span>
          <span className="rounded-full bg-emerald-950/50 px-3 py-1 text-xs text-emerald-200/80 ring-1 ring-emerald-400/20">
            {kind.icon} {kind.short}
          </span>
          {category && (
            <span className="rounded-full bg-emerald-950/50 px-3 py-1 text-xs text-emerald-200/80 ring-1 ring-emerald-400/20">
              {category.icon} {category.label}
            </span>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onShuffle}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-gold-300 via-gold-400 to-gold-500 px-6 py-3 text-sm font-bold text-night-900 shadow-lg shadow-gold-900/20 transition hover:brightness-110 active:scale-95"
          >
            <IconShuffle className="h-4.5 w-4.5" />
            اقتباس آخر
          </button>

          <SparkAction onClick={onCopy} label="انسخ النص">
            <IconCopy className="h-4.5 w-4.5" />
            نسخ
          </SparkAction>

          <SparkAction onClick={onShare} label="شارك">
            <IconShare className="h-4.5 w-4.5" />
            مشاركة
          </SparkAction>

          <SparkAction
            onClick={onDesign}
            label="صمّم بطاقة"
            className="border-gold-300/40 text-gold-200"
          >
            <IconPalette className="h-4.5 w-4.5" />
            تصميم بطاقة
          </SparkAction>

          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-full border transition active:scale-95",
              isFavorite
                ? "border-rose-300/60 bg-rose-400/20 text-rose-200"
                : "border-emerald-200/25 bg-emerald-950/40 text-emerald-100/80 hover:border-rose-300/50 hover:text-rose-200",
            )}
            aria-label={isFavorite ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
            title={isFavorite ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
          >
            <IconHeart className="h-5 w-5" filled={isFavorite} />
          </button>
        </div>
      </div>
    </section>
  );
}

function SparkAction({
  children,
  onClick,
  label,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-emerald-950/40 px-5 py-3 text-sm font-semibold text-emerald-50/90 transition hover:border-gold-300/50 hover:text-gold-100 active:scale-95",
        className,
      )}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
