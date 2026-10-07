import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AmbientGlow, Ornament } from "./components/Decor";
import { Header } from "./components/Header";
import { DailySpark } from "./components/DailySpark";
import { CategoryFilters, type FilterKey } from "./components/CategoryFilters";
import { QuoteCard } from "./components/QuoteCard";
import { CardDesigner } from "./components/CardDesigner";
import { AdminPanel } from "./components/AdminPanel";
import { BottomNav } from "./components/BottomNav";
import { Toast } from "./components/Toast";
import { Footer } from "./components/Footer";
import { BackToTop } from "./components/BackToTop";
import {
  CATEGORIES,
  QUOTES,
  formatQuoteForShare,
  type Quote,
} from "./data/quotes";
import { copyToClipboard, shareOrCopy } from "./lib/share";
import { useLocalStorage, useScrollProgress, useTheme } from "./lib/hooks";
import { useCustomQuotes } from "./lib/store";
import { registerAppManifest } from "./lib/pwa";
import { useSiteLogo } from "./lib/logo";
import { VIEW_META, type ViewKey } from "./lib/nav";
import { IconHeart, IconHome } from "./components/icons";

const FAVORITES_KEY = "fiqulubina:favorites";

/** اقتباس اليوم: ثابت خلال اليوم نفسه، ويتغيّر مع كل يوم */
function pickDailySpark(pool: Quote[]): Quote {
  if (pool.length === 0) return QUOTES[0];
  const days = Math.floor(Date.now() / 86_400_000);
  return pool[days % pool.length];
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [favorites, setFavorites] = useLocalStorage<string[]>(FAVORITES_KEY, []);
  const {
    publishedQuotes,
    editableQuotes,
    addQuote,
    updateQuote,
    deleteQuote,
    importQuotes,
    clearQuotes,
    cloud,
  } = useCustomQuotes();

  const [activeView, setActiveView] = useState<ViewKey>("home");
  const [activeCategory, setActiveCategory] = useState<FilterKey>("all");
  const [spark, setSpark] = useState<Quote>(() => pickDailySpark(QUOTES));
  const [designerQuote, setDesignerQuote] = useState<Quote | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const progress = useScrollProgress();
  const feedRef = useRef<HTMLDivElement>(null);

  // تجربة تشبه التطبيق: أيقونة + manifest (تُبنى من الشعار عند توفره)
  const { src: logoSrc } = useSiteLogo();
  useEffect(() => {
    void registerAppManifest(logoSrc);
  }, [logoSrc]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  /** كل الاقتباسات: ما نشرته صاحبة الموقع + المحتوى الأصلي */
  const allQuotes = useMemo(
    () => [...publishedQuotes, ...QUOTES],
    [publishedQuotes],
  );

  // ═══ التصفية ═══
  const baseList = useMemo(() => {
    if (activeView === "favorites") {
      return allQuotes.filter((q) => favorites.includes(q.id));
    }
    if (activeView === "scholars") {
      return allQuotes.filter((q) => q.kind === "scholar");
    }
    if (activeView === "reflections") {
      return allQuotes.filter((q) => q.category === "tafakkur");
    }
    if (activeView === "sparks") {
      return allQuotes.filter((q) => q.category === "salaf");
    }
    return allQuotes;
  }, [activeView, favorites, allQuotes]);

  const visibleQuotes = useMemo(
    () =>
      activeCategory === "all"
        ? baseList
        : baseList.filter((q) => q.category === activeCategory),
    [baseList, activeCategory],
  );

  const counts = useMemo(() => {
    const result = { all: baseList.length } as Record<FilterKey, number>;
    for (const category of CATEGORIES) {
      result[category.key] = baseList.filter((q) => q.category === category.key)
        .length;
    }
    return result;
  }, [baseList]);

  // ═══ التنقل ═══
  const scrollToFeed = useCallback(() => {
    window.requestAnimationFrame(() => {
      feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleNavigate = useCallback(
    (view: ViewKey) => {
      setActiveView(view);
      setActiveCategory("all");
      if (view === "home") window.scrollTo({ top: 0, behavior: "smooth" });
      else scrollToFeed();
    },
    [scrollToFeed],
  );

  const handleCategoryChange = useCallback(
    (key: FilterKey) => {
      setActiveCategory(key);
      setActiveView("home");
      scrollToFeed();
    },
    [scrollToFeed],
  );

  // ═══ التفاعلات ═══
  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (quote: Quote) => {
      setFavorites((prev) =>
        prev.includes(quote.id)
          ? prev.filter((id) => id !== quote.id)
          : [...prev, quote.id],
      );
      showToast(
        favorites.includes(quote.id)
          ? "أُزيل من المفضلة"
          : "أُضيف إلى المفضلة 🤍",
      );
    },
    [favorites, setFavorites, showToast],
  );

  const handleCopy = useCallback(
    async (quote: Quote) => {
      const ok = await copyToClipboard(formatQuoteForShare(quote));
      showToast(ok ? "تم النسخ إلى الحافظة ✓" : "تعذّر النسخ… انسخي النص يدويًا");
    },
    [showToast],
  );

  const handleShare = useCallback(
    async (quote: Quote) => {
      const result = await shareOrCopy(formatQuoteForShare(quote));
      if (result === "shared") showToast("تمت المشاركة 🤍");
      else if (result === "copied") showToast("تم نسخ النص للمشاركة ✓");
      else showToast("تعذّرت المشاركة… انسخي النص يدويًا");
    },
    [showToast],
  );

  const shuffleSpark = useCallback(() => {
    setSpark((prev) => {
      if (allQuotes.length < 2) return prev;
      let next = prev;
      while (next.id === prev.id) {
        next = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      }
      return next;
    });
  }, [allQuotes]);

  const meta = useMemo(() => {
    if (activeView === "home" && activeCategory !== "all") {
      const category = CATEGORIES.find((c) => c.key === activeCategory);
      if (category) return { title: category.label, subtitle: category.hint };
    }
    return VIEW_META[activeView];
  }, [activeView, activeCategory]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientGlow />

      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        favoritesCount={favorites.length}
        progress={progress}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:pb-16">
        <DailySpark
          quote={spark}
          isFavorite={isFavorite(spark.id)}
          onShuffle={shuffleSpark}
          onCopy={() => handleCopy(spark)}
          onShare={() => handleShare(spark)}
          onToggleFavorite={() => toggleFavorite(spark)}
          onDesign={() => setDesignerQuote(spark)}
        />

        <Ornament className="pt-12 sm:pt-16" />

        <section
          key={activeView + activeCategory}
          ref={feedRef}
          id="feed"
          className="animate-fade-up scroll-mt-28 pt-10 sm:pt-12"
          aria-label="تدفق الاقتباسات"
        >
          <div className="flex flex-col gap-2 text-center">
            <h2 className="font-logo text-2xl font-bold text-night-900 dark:text-gold-100 sm:text-3xl">
              {meta.title}
            </h2>
            <p className="text-sm text-night-800/55 dark:text-emerald-100/50">
              {meta.subtitle}
            </p>
          </div>

          <div className="mt-7">
            <CategoryFilters
              active={activeCategory}
              counts={counts}
              onChange={handleCategoryChange}
            />
          </div>

          <p className="mt-4 text-center text-xs font-medium text-night-800/40 dark:text-emerald-100/35">
            {visibleQuotes.length > 0
              ? `${visibleQuotes.length} اقتباسًا في هذا القسم`
              : "لا توجد اقتباسات هنا بعد"}
          </p>

          {visibleQuotes.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleQuotes.map((quote, index) => (
                <div
                  key={quote.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
                >
                  <QuoteCard
                    quote={quote}
                    isFavorite={isFavorite(quote.id)}
                    onCopy={() => handleCopy(quote)}
                    onShare={() => handleShare(quote)}
                    onToggleFavorite={() => toggleFavorite(quote)}
                    onDesign={() => setDesignerQuote(quote)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-md rounded-3xl border border-dashed border-emerald-900/15 bg-white/60 px-6 py-12 text-center dark:border-gold-300/15 dark:bg-night-900/40">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
                <IconHeart className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-bold text-night-900 dark:text-gold-100">
                {activeView === "favorites"
                  ? "مفضلتك فارغة حتى الآن"
                  : "لا نتائج هنا"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-night-800/55 dark:text-emerald-100/50">
                {activeView === "favorites"
                  ? "اضغطي على القلب 🤍 في أي اقتباس يعجبك، وسيظهر هنا لتعودي إليه متى شئت."
                  : "جرّبي اختيار قسم آخر من التصفية أعلاه."}
              </p>
              <button
                type="button"
                onClick={() => handleNavigate("home")}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-emerald-700 to-emerald-900 px-5 py-2.5 text-sm font-bold text-gold-100 transition hover:brightness-110"
              >
                <IconHome className="h-4 w-4" />
                تصفّحي كل الاقتباسات
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer onOpenAdmin={() => setAdminOpen(true)} />

      <BottomNav
        activeView={activeView}
        onNavigate={handleNavigate}
        favoritesCount={favorites.length}
      />

      <BackToTop />

      {designerQuote && (
        <CardDesigner
          quote={designerQuote}
          isFavorite={isFavorite(designerQuote.id)}
          onToggleFavorite={() => toggleFavorite(designerQuote)}
          onClose={() => setDesignerQuote(null)}
          onToast={showToast}
        />
      )}

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        customQuotes={editableQuotes}
        cloud={cloud}
        onAdd={addQuote}
        onUpdate={updateQuote}
        onDelete={deleteQuote}
        onImport={importQuotes}
        onClear={clearQuotes}
        onToast={showToast}
      />

      <Toast message={toast} />
    </div>
  );
}
