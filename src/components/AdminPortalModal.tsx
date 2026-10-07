import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { BookOpen, Cloud, Download, KeyRound, LoaderCircle, LockKeyhole, LogOut, Pencil, Plus, Save, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import type { CategoryId, Quote, QuoteDraft, QuoteType } from '../types';
import { cleanQuoteText } from '../utils/quoteText';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  configured: boolean;
  checkingSession: boolean;
  isAdmin: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
  onPublishQuote: (draft: QuoteDraft) => Promise<void>;
  onUpdateQuote: (id: string, draft: QuoteDraft) => Promise<void>;
  onDeleteQuote: (id: string) => Promise<void>;
  onImportQuotes: (drafts: QuoteDraft[]) => Promise<number>;
  onChangePassword: (password: string) => Promise<void>;
  publishedQuotes: Quote[];
  onShowToast: (text: string, type?: 'success' | 'favorite' | 'share' | 'info') => void;
}

const categories: { value: CategoryId; label: string }[] = [
  { value: 'softeners', label: 'رقائق القلوب' },
  { value: 'patience', label: 'الصبر واليقين' },
  { value: 'contemplation', label: 'تدبر وتفكر' },
  { value: 'love', label: 'حب الله وأنسه' },
  { value: 'scholars', label: 'أقوال السلف' },
  { value: 'duaa', label: 'أدعية ومناجاة' },
];

const types: { value: QuoteType; label: string }[] = [
  { value: 'hadith', label: 'حديث نبوي' },
  { value: 'quran', label: 'آية قرآنية' },
  { value: 'scholar', label: 'قول عالم' },
  { value: 'reflection', label: 'خاطرة' },
];

const emptyDraft = (): QuoteDraft => ({
  type: 'hadith',
  text: '',
  source: '',
  author: '',
  category: 'softeners',
  tags: [],
  explanation: '',
});

function parseBackup(value: unknown): QuoteDraft[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) {
    throw new Error('يجب أن يحتوي الملف على قائمة من 1 إلى 100 منشور.');
  }
  return value.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('يوجد منشور غير صالح في الملف.');
    const row = item as Record<string, unknown>;
    if (
      !types.some((type) => type.value === row.type) ||
      !categories.some((category) => category.value === row.category) ||
      typeof row.text !== 'string' || !cleanQuoteText(row.text) ||
      typeof row.source !== 'string' || !row.source.trim()
    ) {
      throw new Error('تأكد من وجود النوع والقسم والنص والمصدر في كل منشور.');
    }
    return {
      type: row.type as QuoteType,
      category: row.category as CategoryId,
      text: cleanQuoteText(row.text).slice(0, 5000),
      source: row.source.trim().slice(0, 300),
      author: typeof row.author === 'string' ? row.author.trim() : undefined,
      tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 12) : [],
      explanation: typeof row.explanation === 'string' ? row.explanation.trim() : undefined,
    };
  });
}

export function AdminPortalModal({
  isOpen, onClose, configured, checkingSession, isAdmin, onLogin, onLogout,
  onPublishQuote, onUpdateQuote, onDeleteQuote, onImportQuotes, onChangePassword,
  publishedQuotes, onShowToast,
}: AdminPortalModalProps) {
  const [tab, setTab] = useState<'publish' | 'manage' | 'settings'>('publish');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [draft, setDraft] = useState<QuoteDraft>(emptyDraft);
  const [tagsInput, setTagsInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const describeError = (error: unknown) => {
    setErrorMessage(error instanceof Error ? error.message : 'حدث خطأ. حاول مرة أخرى.');
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    try {
      await onLogin(email.trim(), password);
      setPassword('');
      onShowToast('مرحباً أيوب، لوحة النشر جاهزة.', 'success');
    } catch (error) {
      describeError(error);
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setErrorMessage('');
    try {
      const entry: QuoteDraft = {
        ...draft,
        text: cleanQuoteText(draft.text),
        source: draft.source.trim(),
        author: draft.author?.trim() || undefined,
        explanation: draft.explanation?.trim() || undefined,
        tags: tagsInput.split(/[,،]/).map((tag) => tag.replace(/^#/, '').trim()).filter(Boolean).slice(0, 12),
      };
      if (!entry.text || !entry.source) throw new Error('اكتب النص والمصدر قبل النشر.');
      if (editingId) {
        await onUpdateQuote(editingId, entry);
        onShowToast('تم تعديل المنشور على الموقع.', 'success');
      } else {
        await onPublishQuote(entry);
        onShowToast('تم نشر النص على الموقع لجميع الزوار.', 'success');
      }
      setDraft(emptyDraft());
      setTagsInput('');
      setEditingId(null);
      setTab('manage');
    } catch (error) {
      describeError(error);
    } finally {
      setBusy(false);
    }
  };

  const editPost = (quote: Quote) => {
    setDraft({
      type: quote.type, text: cleanQuoteText(quote.text), source: quote.source,
      author: quote.author || '', category: quote.category,
      tags: quote.tags, explanation: quote.explanation || '',
    });
    setTagsInput(quote.tags.join(', '));
    setEditingId(quote.id);
    setErrorMessage('');
    setTab('publish');
  };

  const deletePost = async (id: string) => {
    if (!window.confirm('هل تريد حذف هذا المنشور من الموقع نهائياً؟')) return;
    setBusy(true);
    setErrorMessage('');
    try {
      await onDeleteQuote(id);
      onShowToast('تم حذف المنشور من الموقع.', 'info');
    } catch (error) {
      describeError(error);
    } finally {
      setBusy(false);
    }
  };

  const importPosts = async (value: unknown) => {
    const items = parseBackup(value);
    setBusy(true);
    setErrorMessage('');
    try {
      const count = await onImportQuotes(items);
      onShowToast(`تم رفع ${count} منشور إلى Supabase.`, 'success');
      setTab('manage');
    } finally {
      setBusy(false);
    }
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 512_000) throw new Error('حجم الملف كبير. الحد الأقصى 500 كيلوبايت.');
      await importPosts(JSON.parse(await file.text()));
    } catch (error) {
      describeError(error);
    }
  };

  const handleLegacyImport = async () => {
    try {
      const previous = localStorage.getItem('fi_qulubina_admin_quotes');
      if (!previous) throw new Error('لا توجد منشورات قديمة محفوظة في هذا المتصفح.');
      await importPosts(JSON.parse(previous));
    } catch (error) {
      describeError(error);
    }
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(publishedQuotes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fi-qulubina-posts.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين.');
      return;
    }
    setBusy(true);
    setErrorMessage('');
    try {
      await onChangePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onShowToast('تم تحديث كلمة المرور في Supabase.', 'success');
    } catch (error) {
      describeError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-3 backdrop-blur-sm sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="إدارة الموقع والنشر"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-emerald-700/20 bg-white shadow-2xl dark:bg-stone-900 max-h-[min(90vh,850px)]"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-800 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-900 text-amber-200"><ShieldCheck size={20} /></span>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">بوابة إدارة في قلوبنا</h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">إشراف أيوب ضاري سرحان العبيدي</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="إغلاق الإدارة" className="rounded-full p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto">
          {!configured ? (
            <div className="mx-auto max-w-md space-y-4 px-7 py-12 text-center">
              <Cloud className="mx-auto text-emerald-700 dark:text-emerald-400" size={34} />
              <h3 className="text-lg font-bold dark:text-stone-100">يلزم إعداد Supabase أولاً</h3>
              <p className="text-sm leading-8 text-stone-600 dark:text-stone-300">عنوان مشروع Supabase الذي أرسلته مضبوط بالفعل. أضف مفتاح النشر العام إلى VITE_SUPABASE_PUBLISHABLE_KEY عند البناء، ثم شغّل ملف supabase/setup.sql وأضف حسابك إلى قائمة المشرفين.</p>
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">الرمز الشخصي الذي يبدأ بـ sbp_ ليس مفتاحاً عاماً ولا يجوز تضمينه في الموقع. راجع SUPABASE_SETUP.md.</p>
            </div>
          ) : checkingSession ? (
            <div className="flex items-center justify-center gap-2 p-16 text-sm text-stone-500"><LoaderCircle className="animate-spin" size={18} />التحقق من الجلسة...</div>
          ) : !isAdmin ? (
            <form onSubmit={handleLogin} className="mx-auto max-w-sm space-y-5 px-6 py-10 sm:py-12">
              <LockKeyhole className="mx-auto text-emerald-800 dark:text-emerald-300" size={32} />
              <div className="text-center">
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">الدخول للمشرف فقط</h3>
                <p className="mt-1 text-xs leading-6 text-stone-500 dark:text-stone-400">استخدم بريدك وكلمة مرور حسابك في Supabase. لا يُسمح لغير حسابك بالنشر.</p>
              </div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200">البريد الإلكتروني
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" dir="ltr" className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white" placeholder="you@example.com" />
              </label>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200">كلمة المرور
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" dir="ltr" className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white" placeholder="••••••••" />
              </label>
              {errorMessage && <p role="alert" className="text-center text-xs text-rose-600 dark:text-rose-400">{errorMessage}</p>}
              <button disabled={busy} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-amber-100 transition hover:bg-emerald-900 disabled:opacity-50">
                {busy && <LoaderCircle className="animate-spin" size={16} />}دخول آمن
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-1 overflow-x-auto border-b border-stone-200 px-5 dark:border-stone-800 sm:px-7">
                {([
                  ['publish', editingId ? 'تعديل المنشور' : 'نشر جديد', Plus],
                  ['manage', `منشوراتي (${publishedQuotes.length})`, BookOpen],
                  ['settings', 'إعدادات', KeyRound],
                ] as const).map(([key, label, Icon]) => (
                  <button key={key} onClick={() => { setTab(key); setErrorMessage(''); }} className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-semibold transition ${tab === key ? 'border-emerald-700 text-emerald-800 dark:text-emerald-300' : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'}`}>
                    <Icon size={14} />{label}
                  </button>
                ))}
                <button onClick={() => void onLogout().catch(describeError)} className="mr-auto flex shrink-0 items-center gap-1 text-xs text-stone-500 hover:text-rose-600"><LogOut size={15} />خروج</button>
              </div>

              {errorMessage && <p role="alert" className="mx-6 mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{errorMessage}</p>}

              {tab === 'publish' && (
                <form onSubmit={handleSave} className="space-y-4 p-5 sm:p-7">
                  <p className="text-xs leading-6 text-stone-500 dark:text-stone-400">بعد الحفظ يظهر المنشور لكل الزوار على جميع الأجهزة. تحقق من نص الآية أو تخريج الحديث قبل النشر.</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {types.map(({ value, label }) => <button type="button" key={value} onClick={() => setDraft({ ...draft, type: value })} className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition ${draft.type === value ? 'bg-emerald-800 text-amber-100' : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 dark:bg-stone-800 dark:text-stone-300'}`}>{label}</button>)}
                  </div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200">النص
                    <textarea value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} required maxLength={5000} rows={5} placeholder="اكتب النص هنا دون أقواس اقتباس..." className={`mt-2 w-full resize-y rounded-xl border border-stone-200 bg-stone-50 p-3 text-base leading-8 text-stone-900 outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white ${draft.type === 'hadith' ? 'font-iphone' : ''}`} />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200">المصدر أو التخريج
                      <input value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })} required maxLength={300} placeholder="مثال: صحيح مسلم / سورة الرعد: 28" className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
                    </label>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200">القائل (اختياري)
                      <input value={draft.author || ''} onChange={(event) => setDraft({ ...draft, author: event.target.value })} placeholder="مثال: النبي ﷺ" className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
                    </label>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200">التصنيف
                      <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as CategoryId })} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-white">
                        {categories.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200">الوسوم (مفصولة بفواصل)
                      <input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="صبر، يقين، سكينة" className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
                    </label>
                  </div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-200">إضاءة قلبية (اختياري)
                    <input value={draft.explanation || ''} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} placeholder="لمسة تدبر قصيرة..." className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
                  </label>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft()); setTagsInput(''); }} className="px-3 py-2 text-xs text-stone-500">إلغاء التعديل</button>}
                    <button type="submit" disabled={busy} className="flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-xs font-bold text-amber-100 transition hover:bg-emerald-900 disabled:opacity-50">
                      {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}{editingId ? 'حفظ التعديلات' : 'نشر على الموقع'}
                    </button>
                  </div>
                </form>
              )}

              {tab === 'manage' && <div className="space-y-3 p-5 sm:p-7">
                <p className="text-xs text-stone-500 dark:text-stone-400">هذه المنشورات محفوظة في Supabase ومتاحة لجميع زوار الموقع.</p>
                {publishedQuotes.length === 0 ? <p className="py-12 text-center text-sm text-stone-500">لم تنشر شيئاً بعد. ابدأ من تبويب نشر جديد.</p> : publishedQuotes.map((quote) => <div key={quote.id} className="flex items-start justify-between gap-3 border-b border-stone-200 py-4 last:border-0 dark:border-stone-800">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">{quote.source}</span>
                    <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm leading-7 text-stone-800 dark:text-stone-200">{cleanQuoteText(quote.text)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => editPost(quote)} title="تعديل" aria-label="تعديل المنشور" className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-stone-800"><Pencil size={17} /></button>
                    <button disabled={busy} onClick={() => void deletePost(quote.id)} title="حذف" aria-label="حذف المنشور" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-stone-800"><Trash2 size={17} /></button>
                  </div>
                </div>)}
              </div>}

              {tab === 'settings' && <div className="space-y-7 p-5 sm:p-7">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-stone-100"><KeyRound size={16} />تغيير كلمة مرور حسابك</h3>
                  <form onSubmit={changePassword} className="flex flex-wrap gap-2">
                    <input type="password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="كلمة مرور جديدة" className="min-w-36 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
                    <input type="password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="تأكيد كلمة المرور" className="min-w-36 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
                    <button disabled={busy} type="submit" className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-amber-100 disabled:opacity-50">تحديث</button>
                  </form>
                </div>
                <div className="border-t border-stone-200 pt-5 dark:border-stone-800">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-stone-100"><Cloud size={16} />النسخ الاحتياطي والترحيل</h3>
                  <p className="mb-3 text-xs leading-6 text-stone-500 dark:text-stone-400">أنشئ نسخة احتياطية، أو استورد منشوراتك من ملف JSON أو من التخزين المحلي للنسخة السابقة من الموقع.</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={exportBackup} className="flex items-center gap-2 rounded-xl border border-emerald-700/30 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><Download size={15} />تصدير JSON</button>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-700/30 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><Upload size={15} />استيراد ملف<input type="file" accept=".json,application/json" onChange={(event) => void handleImportFile(event)} disabled={busy} className="sr-only" /></label>
                    <button onClick={() => void handleLegacyImport()} disabled={busy} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300">استيراد منشوراتي القديمة</button>
                  </div>
                </div>
              </div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}