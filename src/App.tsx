import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Quote, QuoteDraft, CategoryId, QuoteType } from './types';
import { CATEGORIES, INITIAL_QUOTES } from './data/quotesData';
import { supabase, supabaseConfigured, postToQuote, type PostRow } from './lib/supabase';
import { cleanQuoteText } from './utils/quoteText';
import { Header } from './components/Header';
import { DailySpark } from './components/DailySpark';
import { CategoryFilters } from './components/CategoryFilters';
import { QuoteCard } from './components/QuoteCard';
import { CardDesignerModal } from './components/CardDesignerModal';
import { ShareModal } from './components/ShareModal';
import { TasbihModal } from './components/TasbihModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { AmbienceAudio } from './components/AmbienceAudio';
import { Toast, ToastMessage } from './components/Toast';
import { Footer } from './components/Footer';
import { BottomNavBar } from './components/BottomNavBar';
import { BrandMasthead } from './components/BrandIdentity';
import { 
  Heart, 
  Sparkles, 
  Search, 
  ArrowUp, 
  RotateCcw,
  CloudOff,
  LoaderCircle
} from 'lucide-react';

export function App() {
  // --- Persistent State: Dark Mode ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fi_qulubina_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('fi_qulubina_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Persistent State: Favorites ---
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fi_qulubina_favorites');
      return saved ? JSON.parse(saved) : ['q-1', 'q-2', 'q-4'];
    } catch {
      return ['q-1', 'q-2', 'q-4'];
    }
  });

  useEffect(() => {
    localStorage.setItem('fi_qulubina_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Access is verified by Supabase Auth and the database's site_admins RLS policy.
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const isAdmin = Boolean(adminUserId);
  const [checkingSession, setCheckingSession] = useState(supabaseConfigured);
  const [publishedQuotes, setPublishedQuotes] = useState<Quote[]>([]);
  const [postsLoading, setPostsLoading] = useState(supabaseConfigured);
  const [postsError, setPostsError] = useState('');
  const latestPostsRequest = useRef(0);
  const latestAuthCheck = useRef(0);

  const loadPosts = useCallback(async () => {
    if (!supabase) return;
    const requestId = ++latestPostsRequest.current;
    const { data, error } = await supabase
      .from('site_posts')
      .select('id, owner_id, type, text, source, author, category, tags, explanation, created_at')
      .order('created_at', { ascending: false });
    if (requestId !== latestPostsRequest.current) return;
    if (error) {
      setPostsError('تعذر تحميل المنشورات من Supabase. راجع إعداد المشروع وسياسات قاعدة البيانات.');
    } else {
      setPublishedQuotes((data as PostRow[]).map(postToQuote));
      setPostsError('');
    }
    setPostsLoading(false);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    void loadPosts();
    const channel = client.channel('fi-qulubina-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_posts' }, () => {
        void loadPosts();
      })
      .subscribe();
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') void loadPosts();
    };
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      latestPostsRequest.current += 1;
      void client.removeChannel(channel);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [loadPosts]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;

    const verifyAdmin = async () => {
      const requestId = ++latestAuthCheck.current;
      const { data: { user }, error } = await client.auth.getUser();
      if (!active || requestId !== latestAuthCheck.current) return;
      if (error || !user) {
        setAdminUserId(null);
        setCheckingSession(false);
        return;
      }
      const { data: member, error: membershipError } = await client
        .from('site_admins').select('user_id').eq('user_id', user.id).maybeSingle();
      if (!active || requestId !== latestAuthCheck.current) return;
      setAdminUserId(!membershipError && member ? user.id : null);
      setCheckingSession(false);
    };

    void verifyAdmin();
    const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        latestAuthCheck.current += 1;
        setAdminUserId(null);
        setCheckingSession(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Run outside the Auth callback to avoid locking another Auth request.
        window.setTimeout(() => { if (active) void verifyAdmin(); }, 0);
      }
    });
    return () => { active = false; latestAuthCheck.current += 1; subscription.unsubscribe(); };
  }, []);

  const handleAdminLogin = async (email: string, password: string) => {
    if (!supabase) throw new Error('أكمل إعداد Supabase أولاً.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error('البريد أو كلمة المرور غير صحيحين.');
    const { data: member, error: membershipError } = await supabase
      .from('site_admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (membershipError || !member) {
      await supabase.auth.signOut();
      throw new Error(membershipError
        ? 'تعذر التحقق من صلاحيات الإدارة. تأكد من تنفيذ ملف SQL.'
        : 'هذا الحساب غير مسجل في قائمة مشرفي الموقع.');
    }
    latestAuthCheck.current += 1;
    setAdminUserId(data.user.id);
  };

  const handleAdminLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error('تعذر تسجيل الخروج، حاول مرة أخرى.');
    latestAuthCheck.current += 1;
    setAdminUserId(null);
  };

  const postFields = (draft: QuoteDraft) => ({
    type: draft.type,
    text: cleanQuoteText(draft.text),
    source: draft.source.trim(),
    author: draft.author?.trim() || null,
    category: draft.category,
    tags: draft.tags.slice(0, 12),
    explanation: draft.explanation?.trim() || null,
  });

  const handlePublishQuote = async (draft: QuoteDraft) => {
    if (!supabase || !adminUserId) throw new Error('سجل دخول المشرف أولاً.');
    const { error } = await supabase.from('site_posts')
      .insert({ id: `post-${crypto.randomUUID()}`, owner_id: adminUserId, ...postFields(draft) })
      .select('id').single();
    if (error) throw new Error('تعذر النشر. تأكد من صلاحيات المشرف ومن اتصال Supabase.');
    await loadPosts();
  };

  const handleUpdateQuote = async (id: string, draft: QuoteDraft) => {
    if (!supabase || !adminUserId) throw new Error('سجل دخول المشرف أولاً.');
    const { error } = await supabase.from('site_posts')
      .update(postFields(draft)).eq('id', id).eq('owner_id', adminUserId)
      .select('id').single();
    if (error) throw new Error('تعذر تعديل المنشور. تأكد من الصلاحيات أو أعد تحميل الصفحة.');
    await loadPosts();
  };

  const handleDeleteQuote = async (id: string) => {
    if (!supabase || !adminUserId) throw new Error('سجل دخول المشرف أولاً.');
    if (!publishedQuotes.some((quote) => quote.id === id)) throw new Error('لا يمكن حذف المحتوى الأساسي من الواجهة.');
    const { error } = await supabase.from('site_posts')
      .delete().eq('id', id).eq('owner_id', adminUserId).select('id').single();
    if (error) throw new Error('تعذر حذف المنشور. تحقق من الصلاحيات أو أعد المحاولة.');
    await loadPosts();
  };

  const handleImportQuotes = async (drafts: QuoteDraft[]): Promise<number> => {
    if (!supabase || !adminUserId) throw new Error('سجل دخول المشرف أولاً.');
    const existing = new Set(publishedQuotes.map((post) => `${post.type}:${cleanQuoteText(post.text)}:${post.source}`));
    const uniqueDrafts = drafts.filter((draft) => {
      const key = `${draft.type}:${cleanQuoteText(draft.text)}:${draft.source.trim()}`;
      if (existing.has(key)) return false;
      existing.add(key);
      return true;
    });
    if (uniqueDrafts.length === 0) return 0;
    const rows = uniqueDrafts.map((draft) => ({
      id: `post-${crypto.randomUUID()}`, owner_id: adminUserId, ...postFields(draft),
    }));
    const { data, error } = await supabase.from('site_posts').insert(rows).select('id');
    if (error) throw new Error('تعذر استيراد المنشورات. تحقق من صيغة الملف والصلاحيات.');
    await loadPosts();
    return data?.length ?? 0;
  };

  const handleChangePassword = async (password: string) => {
    if (!supabase || !adminUserId) throw new Error('سجل دخول المشرف أولاً.');
    if (password.length < 8) throw new Error('كلمة المرور يجب ألا تقل عن 8 أحرف.');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error('تعذر تغيير كلمة المرور. قد تتطلب إعدادات الأمان إعادة التحقق من الحساب.');
  };

  // Combine admin published quotes + initial seed quotes
  const allQuotes = useMemo(() => {
    return [...publishedQuotes, ...INITIAL_QUOTES];
  }, [publishedQuotes]);

  // --- Daily Spark State ---
  const [dailySparkIndex, setDailySparkIndex] = useState(0);
  const currentDailyQuote = allQuotes[dailySparkIndex % allQuotes.length] || allQuotes[0];

  const handleShuffleDaily = useCallback(() => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * allQuotes.length);
    } while (nextIndex === dailySparkIndex && allQuotes.length > 1);
    setDailySparkIndex(nextIndex);
  }, [allQuotes.length, dailySparkIndex]);

  // --- Filtering & Search State ---
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [selectedType, setSelectedType] = useState<'all' | QuoteType>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Modals State ---
  const [designerQuote, setDesignerQuote] = useState<Quote | null>(null);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);

  const [shareQuote, setShareQuote] = useState<Quote | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [isTasbihOpen, setIsTasbihOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  // --- Audio State ---
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // --- Toasts & Clipboard ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = useCallback((text: string, type: ToastMessage['type'] = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Favorite Toggle ---
  const toggleFavorite = (quote: Quote) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(quote.id);
      if (exists) {
        showToast('تمت إزالة النفحة من المفضلة', 'info');
        return prev.filter((id) => id !== quote.id);
      } else {
        showToast('تم حفظ النفحة في المفضلة المباركة 🤍', 'favorite');
        return [...prev, quote.id];
      }
    });
  };

  // --- Copy Text ---
  const handleCopyQuote = async (quote: Quote) => {
    const textToCopy = `${cleanQuoteText(quote.text)}\n${quote.author ? `${quote.author} • ${quote.source}` : quote.source}\n#في_قلوبنا`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(quote.id);
      showToast('تم نسخ النص بنجاح إلى الحافظة ✨', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('حدث خطأ أثناء النسخ', 'info');
    }
  };

  // --- Open Modals ---
  const handleOpenDesigner = (quote: Quote) => {
    setDesignerQuote(quote);
    setIsDesignerOpen(true);
  };

  const handleOpenShare = (quote: Quote) => {
    if (navigator.share && window.innerWidth < 768) {
      navigator.share({
        title: 'في قلوبنا',
        text: `${cleanQuoteText(quote.text)}\n${quote.author ? `${quote.author} • ${quote.source}` : quote.source}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      setShareQuote(quote);
      setIsShareOpen(true);
    }
  };

  // --- Filtered Quotes List ---
  const filteredQuotes = useMemo(() => {
    return allQuotes.filter((quote) => {
      // 1. Category filter
      if (activeCategory === 'favorites') {
        if (!favoriteIds.includes(quote.id)) return false;
      } else if (activeCategory !== 'all') {
        if (quote.category !== activeCategory) return false;
      }

      // 2. Content Type filter
      if (selectedType !== 'all') {
        if (quote.type !== selectedType) return false;
      }

      // 3. Tag filter
      if (selectedTag) {
        if (!quote.tags.includes(selectedTag)) return false;
      }

      // 4. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const textMatch = quote.text.toLowerCase().includes(q);
        const sourceMatch = quote.source.toLowerCase().includes(q);
        const authorMatch = quote.author?.toLowerCase().includes(q);
        const tagMatch = quote.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!textMatch && !sourceMatch && !authorMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allQuotes, activeCategory, favoriteIds, selectedType, selectedTag, searchQuery]);

  // Counts per category for the filter tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: allQuotes.length,
      favorites: favoriteIds.length
    };
    for (const q of allQuotes) {
      counts[q.category] = (counts[q.category] || 0) + 1;
    }
    return counts;
  }, [allQuotes, favoriteIds]);

  // Available tags across all quotes
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    for (const q of allQuotes) {
      q.tags.forEach((t) => tagsSet.add(t));
    }
    return Array.from(tagsSet);
  }, [allQuotes]);

  // Scroll to top helper
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 selection:bg-emerald-600/20 selection:text-emerald-900 transition-colors duration-300 pb-20 sm:pb-0">
      
      {/* Top Header */}
      <Header
        favoritesCount={favoriteIds.length}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenTasbih={() => setIsTasbihOpen(true)}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={() => setIsAudioPlaying(!isAudioPlaying)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        <BrandMasthead />

        {/* Featured Daily Spark Banner */}
        <DailySpark
          quote={currentDailyQuote}
          onShuffle={handleShuffleDaily}
          onCopy={handleCopyQuote}
          onShare={handleOpenShare}
          onDesignCard={handleOpenDesigner}
          isFavorite={favoriteIds.includes(currentDailyQuote.id)}
          onToggleFavorite={toggleFavorite}
          copiedId={copiedId}
        />

        {!supabaseConfigured && (
          <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
            <span className="flex items-center gap-2"><CloudOff size={16} className="shrink-0" />عنوان مشروع Supabase مضبوط. يلزم مفتاح النشر العام لتفعيل المنشورات السحابية.</span>
            <button onClick={() => setIsAdminPortalOpen(true)} className="shrink-0 font-bold underline underline-offset-4">طريقة الربط</button>
          </div>
        )}
        {postsError && (
          <div role="alert" className="mx-auto mb-4 max-w-5xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{postsError}</div>
        )}

        {/* Filters & Tags Toolbar */}
        <div className="mt-8 mb-8">
          <CategoryFilters
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onSelectCategory={(id) => {
              setActiveCategory(id);
              setSelectedTag(null);
            }}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={categoryCounts}
            totalCount={allQuotes.length}
            availableTags={availableTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        </div>

        {/* Section Heading & Result Stats */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              <span>
                {activeCategory === 'favorites'
                  ? 'النفحات المحفوظة في المفضلة'
                  : activeCategory === 'all'
                  ? 'واحة النفحات والدرر'
                  : CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold font-mono">
              {filteredQuotes.length}
            </span>
            {postsLoading && <LoaderCircle className="h-4 w-4 animate-spin text-emerald-700" aria-label="جار تحميل المنشورات" />}
          </div>

          {(activeCategory !== 'all' || selectedType !== 'all' || selectedTag || searchQuery) && (
            <button
              onClick={() => {
                setActiveCategory('all');
                setSelectedType('all');
                setSelectedTag(null);
                setSearchQuery('');
              }}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-emerald-700 dark:text-stone-400 dark:hover:text-emerald-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الضبط</span>
            </button>
          )}
        </div>

        {/* Quotes Cards Feed Grid */}
        {filteredQuotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                isFavorite={favoriteIds.includes(quote.id)}
                onToggleFavorite={toggleFavorite}
                onCopy={handleCopyQuote}
                onShare={handleOpenShare}
                onDesignCard={handleOpenDesigner}
                isCopied={copiedId === quote.id}
                isAdmin={isAdmin && Boolean(quote.isCustom)}
                onDeleteQuote={(id) => {
                  void handleDeleteQuote(id)
                    .then(() => showToast('تم حذف المنشور من الموقع.', 'success'))
                    .catch((error: unknown) => showToast(error instanceof Error ? error.message : 'تعذر الحذف.', 'info'));
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center flex flex-col items-center justify-center p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 my-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              {activeCategory === 'favorites' ? (
                <Heart className="w-8 h-8 text-rose-400" />
              ) : (
                <Search className="w-8 h-8 text-stone-400" />
              )}
            </div>
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-2">
              {activeCategory === 'favorites'
                ? 'لا توجد نفحات محفوظة في المفضلة بعد'
                : 'لم نجد نتائج تطابق بحثك'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6">
              {activeCategory === 'favorites'
                ? 'انقر على رمز القلب في أي بطاقة لتحتفظ بها هنا وتعود إليها في أي وقت.'
                : 'جرب البحث بكلمات أخرى أو قم بإلغاء بعض الفلاتر لعرض جميع المحتويات المباركة.'}
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSelectedType('all');
                setSelectedTag(null);
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-200 text-xs font-bold transition-all shadow-md shadow-emerald-900/10 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>عرض جميع النفحات</span>
            </button>
          </div>
        )}

      </main>

      {/* Modals */}
      <CardDesignerModal
        quote={designerQuote}
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        onShowToast={showToast}
      />

      <ShareModal
        quote={shareQuote}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onShowToast={showToast}
      />

      <TasbihModal
        isOpen={isTasbihOpen}
        onClose={() => setIsTasbihOpen(false)}
      />

      {/* Admin Portal Modal (Publishing exclusive to Ayoub Al-Obeidi) */}
      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        configured={supabaseConfigured}
        checkingSession={checkingSession}
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onPublishQuote={handlePublishQuote}
        onUpdateQuote={handleUpdateQuote}
        publishedQuotes={publishedQuotes}
        onDeleteQuote={handleDeleteQuote}
        onImportQuotes={handleImportQuotes}
        onShowToast={showToast}
        onChangePassword={handleChangePassword}
      />

      {/* Ambient Peaceful Recitation Player */}
      <AmbienceAudio
        isPlaying={isAudioPlaying}
        onTogglePlay={() => setIsAudioPlaying(!isAudioPlaying)}
        onShowToast={showToast}
      />

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-20 sm:bottom-5 left-5 z-30 p-3 rounded-full bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 shadow-xl border border-stone-200 dark:border-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all hover:scale-110"
        title="الرجوع للأعلى"
        aria-label="الرجوع للأعلى"
      >
        <ArrowUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
      </button>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <Footer
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          const el = document.getElementById('feed-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTasbih={() => setIsTasbihOpen(true)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        isAdmin={isAdmin}
      />

      {/* App-like Mobile Bottom Navigation Bar */}
      <BottomNavBar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        onOpenTasbih={() => setIsTasbihOpen(true)}
        onOpenAdmin={() => setIsAdminPortalOpen(true)}
        favoritesCount={favoriteIds.length}
        isAdmin={isAdmin}
      />

    </div>
  );
}

export default App;
