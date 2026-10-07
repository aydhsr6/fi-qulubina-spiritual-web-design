import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { cn } from "../utils/cn";
import { KIND_META, type Quote } from "../data/quotes";
import { formatQuoteForShare } from "../data/quotes";
import { copyToClipboard, downloadDataUrl, shareOrCopy } from "../lib/share";
import { IconClose, IconDownload, IconHeart } from "./icons";

interface CardDesignerProps {
  quote: Quote;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  onToast: (message: string) => void;
}

type ThemeKey = "emerald" | "gold" | "twilight" | "paper";
type RatioKey = "1:1" | "4:5" | "9:16";

interface CardTheme {
  label: string;
  background: string;
  text: string;
  accent: string;
  muted: string;
  border: string;
  pattern: string;
  swatch: string;
}

/** ألوان البطاقات بقيم صريحة (hex/rgba) حتى تُصدَّر الصورة بدقة */
const THEMES: Record<ThemeKey, CardTheme> = {
  emerald: {
    label: "ليل زمردي",
    background:
      "radial-gradient(circle at 22% 12%, #17513c 0%, #0a2018 55%, #050f0b 100%)",
    text: "#f7f1e2",
    accent: "#e7c982",
    muted: "rgba(247,241,226,0.68)",
    border: "1px solid rgba(231,201,130,0.38)",
    pattern: "rgba(231,201,130,0.14)",
    swatch: "linear-gradient(135deg,#1c6a4d,#07120e)",
  },
  gold: {
    label: "فجر ذهبي",
    background:
      "linear-gradient(155deg, #fdf9ee 0%, #f7eed8 50%, #efe1bd 100%)",
    text: "#14382a",
    accent: "#a3772c",
    muted: "rgba(20,56,42,0.62)",
    border: "1px solid rgba(163,119,44,0.35)",
    pattern: "rgba(163,119,44,0.12)",
    swatch: "linear-gradient(135deg,#fdf6e6,#d8ae56)",
  },
  twilight: {
    label: "شفق",
    background:
      "linear-gradient(150deg, #14342c 0%, #1c2b3a 52%, #251d35 100%)",
    text: "#f4eee1",
    accent: "#d9b45c",
    muted: "rgba(244,238,225,0.66)",
    border: "1px solid rgba(217,180,92,0.35)",
    pattern: "rgba(217,180,92,0.13)",
    swatch: "linear-gradient(135deg,#1d4d3d,#2a2340)",
  },
  paper: {
    label: "ورق",
    background: "#fbf7ef",
    text: "#1b2b24",
    accent: "#8a6a2f",
    muted: "rgba(27,43,36,0.6)",
    border: "1px solid rgba(27,43,36,0.16)",
    pattern: "rgba(27,43,36,0.07)",
    swatch: "linear-gradient(135deg,#fdfbf6,#e8e0cd)",
  },
};

const RATIOS: Record<RatioKey, { label: string; value: number }> = {
  "1:1": { label: "مربع ١:١", value: 1 },
  "4:5": { label: "بورتريه ٤:٥", value: 4 / 5 },
  "9:16": { label: "ستوري ٩:١٦", value: 9 / 16 },
};

const BASE_WIDTH = 420;
const FONT_SCALES = [0.85, 1, 1.18, 1.36];

/** لون النقشة الهندسية داخل البطاقة (يجب أن يكون hex صريحًا للتصدير) */
const PATTERN_HEX: Record<ThemeKey, string> = {
  emerald: "#e7c982",
  gold: "#a3772c",
  twilight: "#d9b45c",
  paper: "#1b2b24",
};

const buildPattern = (hex: string) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='${hex}' stroke-width='1'%3E%3Cpath d='M30 5 37 23 55 30 37 37 30 55 23 37 5 30 23 23Z'/%3E%3Ccircle cx='30' cy='30' r='6.5'/%3E%3C/g%3E%3C/svg%3E")`;

/** مكدّس خط نظام الآيفون (يُستخدم في البطاقات المصدَّرة أيضًا) */
const IPHONE_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Arabic", "Geeza Pro", "SF Pro Text", "SF Pro AR", Cairo, sans-serif';

export function CardDesigner({
  quote,
  isFavorite,
  onToggleFavorite,
  onClose,
  onToast,
}: CardDesignerProps) {
  const [theme, setTheme] = useState<ThemeKey>("emerald");
  const [ratio, setRatio] = useState<RatioKey>("4:5");
  const [fontIndex, setFontIndex] = useState(1);
  const [showSource, setShowSource] = useState(true);
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEMES[theme];
  const fontScale = FONT_SCALES[fontIndex];
  const ratioValue = RATIOS[ratio].value;
  const cardHeight = Math.round(BASE_WIDTH / ratioValue);

  // قياس المعاينة لتناسب شاشة الجوال
  useEffect(() => {
    const measure = () => {
      const el = frameRef.current;
      if (!el) return;
      const available = el.clientWidth - 4;
      setScale(Math.min(1, available / BASE_WIDTH));
    };
    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    if (frameRef.current) observer.observe(frameRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  // إغلاق بمفتاح ESC + منع تمرير الخلفية
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const quoteSize = useCallback(() => {
    const len = quote.text.length;
    const base = len > 170 ? 19 : len > 110 ? 23 : len > 60 ? 27 : 32;
    // خط النظام أعرض قليلاً من Amiri، فنُصغّره قليلاً ليتوازن داخل البطاقة
    const kindFactor = quote.kind === "hadith" ? 0.9 : 1;
    return Math.round(
      base * fontScale * kindFactor * (ratio === "9:16" ? 1.05 : 1),
    );
  }, [quote.kind, quote.text.length, fontScale, ratio]);

  const handleDownload = async () => {
    const node = cardRef.current;
    if (!node) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(node, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      downloadDataUrl(
        canvas.toDataURL("image/png"),
        `fiqulubina-${quote.id}.png`,
      );
      onToast("تم تحميل البطاقة كصورة 🎨");
    } catch {
      onToast("تعذّر تحميل الصورة… حاولي مرة أخرى");
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(formatQuoteForShare(quote));
    onToast(ok ? "تم نسخ النص ✓" : "تعذّر النسخ، انسخي يدويًا");
  };

  const handleShare = async () => {
    const result = await shareOrCopy(formatQuoteForShare(quote));
    if (result === "shared") onToast("تمت المشاركة 🤍");
    else if (result === "copied") onToast("تم نسخ النص للمشاركة ✓");
  };

  const isQuran = quote.kind === "quran";
  const isHadith = quote.kind === "hadith";
  const kind = KIND_META[quote.kind];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-night-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="مصمم البطاقات"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-pop flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] border border-gold-300/30 bg-[#f7faf7] shadow-2xl dark:border-gold-300/15 dark:bg-night-900 sm:rounded-[2rem]">
        {/* الترويسة */}
        <div className="flex items-center justify-between gap-4 border-b border-emerald-900/10 px-5 py-4 dark:border-gold-300/10 sm:px-7">
          <div>
            <h2 className="font-logo text-xl font-bold text-night-900 dark:text-gold-100">
              مصمم البطاقة
            </h2>
            <p className="text-xs text-night-800/55 dark:text-emerald-100/50">
              اختاري الشكل المناسب ثم حمّليها صورة جاهزة للنشر
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/10 bg-white/70 text-night-800 transition hover:border-gold-400/60 hover:text-gold-600 dark:border-gold-300/15 dark:bg-night-800 dark:text-emerald-100 dark:hover:text-gold-200"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 overflow-y-auto p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_20rem]">
          {/* المعاينة */}
          <div className="order-1">
            <div
              ref={frameRef}
              className="flex justify-center overflow-hidden rounded-3xl border border-dashed border-emerald-900/15 bg-emerald-900/[0.03] p-3 dark:border-gold-300/15 dark:bg-night-950/40"
            >
              <div
                style={{
                  width: BASE_WIDTH * scale,
                  height: cardHeight * scale,
                }}
              >
                <div
                  ref={cardRef}
                  style={{
                    width: BASE_WIDTH,
                    height: cardHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: "top right",
                    background: activeTheme.background,
                    color: activeTheme.text,
                    border: activeTheme.border,
                    fontFamily: "Cairo, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "44px 38px",
                  }}
                >
                  {/* النقشة الهندسية */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: buildPattern(PATTERN_HEX[theme]),
                      backgroundSize: "60px 60px",
                      opacity: 0.16,
                      pointerEvents: "none",
                    }}
                  />

                  {/* الترويسة */}
                  <div
                    style={{
                      position: "absolute",
                      top: 26,
                      left: 0,
                      right: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      fontSize: 15,
                      color: activeTheme.accent,
                      fontFamily: "Aref Ruqaa, serif",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.5 14.2 9.8 21.5 12 14.2 14.2 12 21.5 9.8 14.2 2.5 12 9.8 9.8Z" />
                    </svg>
                    في قلوبنا
                  </div>

                  {/* النص */}
                  <div
                    style={{
                      position: "relative",
                      fontFamily: isHadith ? IPHONE_FONT_STACK : "Amiri, serif",
                      fontSize: quoteSize(),
                      lineHeight: 2,
                      fontWeight: isQuran ? 700 : isHadith ? 600 : 400,
                    }}
                  >
                    {quote.text}
                  </div>

                  {/* المصدر */}
                  {showSource && (
                    <div
                      style={{
                        position: "relative",
                        marginTop: 30,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 56,
                          height: 1,
                          background: activeTheme.accent,
                          opacity: 0.7,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: activeTheme.accent,
                        }}
                      >
                        {quote.author}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          color: activeTheme.muted,
                        }}
                      >
                        {quote.source} · {kind.short}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-night-800/50 dark:text-emerald-100/45">
              تُحمَّل الصورة بدقة عالية تصل إلى ١٢٦٠px — مناسبة لإنستغرام وتلغرام
            </p>
          </div>

          {/* لوحة الخيارات */}
          <div className="order-2 space-y-6">
            <section>
              <h3 className="mb-2.5 text-sm font-bold text-night-900 dark:text-gold-100">
                الهوية اللونية
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key)}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl border p-2 text-xs font-semibold transition",
                      theme === key
                        ? "border-gold-500 bg-gold-100/70 text-night-900 dark:border-gold-300 dark:bg-gold-400/15 dark:text-gold-100"
                        : "border-emerald-900/10 bg-white/70 text-night-800/70 hover:border-gold-400/60 dark:border-emerald-400/15 dark:bg-night-800 dark:text-emerald-100/70",
                    )}
                  >
                    <span
                      className="h-8 w-8 shrink-0 rounded-xl ring-1 ring-black/10"
                      style={{ background: THEMES[key].swatch }}
                    />
                    {THEMES[key].label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2.5 text-sm font-bold text-night-900 dark:text-gold-100">
                مقاس البطاقة
              </h3>
              <div className="flex gap-2">
                {(Object.keys(RATIOS) as RatioKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRatio(key)}
                    className={cn(
                      "flex-1 rounded-2xl border px-2 py-2.5 text-xs font-semibold transition",
                      ratio === key
                        ? "border-transparent bg-gradient-to-l from-emerald-700 to-emerald-900 text-gold-100"
                        : "border-emerald-900/10 bg-white/70 text-night-800/70 hover:border-gold-400/60 dark:border-emerald-400/15 dark:bg-night-800 dark:text-emerald-100/70",
                    )}
                  >
                    {RATIOS[key].label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2.5 text-sm font-bold text-night-900 dark:text-gold-100">
                حجم الخط
              </h3>
              <input
                type="range"
                min={0}
                max={FONT_SCALES.length - 1}
                step={1}
                value={fontIndex}
                onChange={(e) => setFontIndex(Number(e.target.value))}
                className="w-full accent-emerald-700"
                aria-label="حجم الخط"
              />
              <div className="mt-1 flex justify-between text-[0.7rem] text-night-800/45 dark:text-emerald-100/40">
                <span>صغير</span>
                <span>كبير</span>
              </div>
            </section>

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-white/70 px-4 py-3 text-sm font-semibold text-night-800/80 dark:border-emerald-400/15 dark:bg-night-800 dark:text-emerald-100/80">
              إظهار المصدر
              <span
                className={cn(
                  "relative h-6 w-11 rounded-full transition",
                  showSource
                    ? "bg-emerald-700"
                    : "bg-night-800/20 dark:bg-emerald-100/15",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                    showSource ? "right-0.5" : "right-[1.4rem]",
                  )}
                />
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={showSource}
                onChange={(e) => setShowSource(e.target.checked)}
              />
            </label>

            <div className="space-y-2.5 border-t border-emerald-900/10 pt-5 dark:border-gold-300/10">
              <button
                type="button"
                onClick={handleDownload}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-gold-300 via-gold-400 to-gold-500 px-5 py-3.5 text-sm font-bold text-night-900 shadow-lg shadow-gold-900/20 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                <IconDownload className="h-5 w-5" />
                {busy ? "جارٍ التحميل…" : "تحميل الصورة"}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-900/10 bg-white/70 px-4 py-3 text-sm font-semibold text-night-800 transition hover:border-gold-400/60 hover:text-gold-600 dark:border-emerald-400/15 dark:bg-night-800 dark:text-emerald-100 dark:hover:text-gold-200"
                >
                  نسخ النص
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-900/10 bg-white/70 px-4 py-3 text-sm font-semibold text-night-800 transition hover:border-gold-400/60 hover:text-gold-600 dark:border-emerald-400/15 dark:bg-night-800 dark:text-emerald-100 dark:hover:text-gold-200"
                >
                  مشاركة
                </button>
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  aria-pressed={isFavorite}
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition active:scale-90",
                    isFavorite
                      ? "border-rose-300/60 bg-rose-500/15 text-rose-500 dark:text-rose-300"
                      : "border-emerald-900/10 bg-white/70 text-night-800/60 hover:text-rose-500 dark:border-emerald-400/15 dark:bg-night-800 dark:text-emerald-100/60",
                  )}
                  aria-label={isFavorite ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
                >
                  <IconHeart className="h-5 w-5" filled={isFavorite} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
