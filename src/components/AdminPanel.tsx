import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";
import {
  CATEGORIES,
  KIND_META,
  formatQuoteForShare,
  stripBrackets,
  type CategoryKey,
  type Quote,
  type QuoteKind,
} from "../data/quotes";
import { ADMIN, type CloudApi, type NewQuote, type Result } from "../lib/store";
import { downloadDataUrl } from "../lib/share";
import { AdminSignature } from "./Decor";
import { CloudSettings } from "./CloudSettings";
import { LogoSettings } from "./LogoSettings";
import { QuoteCard } from "./QuoteCard";
import {
  IconClose,
  IconDownload,
  IconEdit,
  IconLock,
  IconPlus,
  IconShield,
  IconTrash,
  IconUpload,
} from "./icons";

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
  customQuotes: Quote[];
  cloud: CloudApi;
  onAdd: (quote: NewQuote) => Promise<Result>;
  onUpdate: (id: string, patch: Partial<Quote>) => Promise<Result>;
  onDelete: (id: string) => Promise<Result>;
  onImport: (quotes: Quote[]) => Promise<Result>;
  onClear: () => Promise<Result>;
  onToast: (message: string) => void;
}

type TabKey = "new" | "mine" | "settings";

const EMPTY_FORM = {
  kind: "scholar" as QuoteKind,
  category: "raqqaq" as CategoryKey,
  text: "",
  author: "",
  source: "",
  translation: "",
};

export function AdminPanel({
  open,
  onClose,
  customQuotes,
  cloud,
  onAdd,
  onUpdate,
  onDelete,
  onImport,
  onClear,
  onToast,
}: AdminPanelProps) {
  const [unlocked, setUnlocked] = useState(() => ADMIN.isUnlocked());
  const [password, setPassword] = useState("");
  const [gateError, setGateError] = useState("");

  const [tab, setTab] = useState<TabKey>("new");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // قفل اللوحة تلقائيًا عند إغلاقها
  useEffect(() => {
    if (!open) {
      setPassword("");
      setGateError("");
      setFormError("");
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const draftQuote = useMemo<Quote>(
    () => ({
      id: editingId ?? "preview",
      kind: form.kind,
      category: form.category,
      text: form.text.trim() || "…نص الاقتباس سيظهر هنا…",
      author: form.author.trim() || "المصدر",
      source: form.source.trim() || "المصدر",
      translation:
        form.kind === "quran" && form.translation.trim()
          ? form.translation.trim()
          : undefined,
    }),
    [form, editingId],
  );

  if (!open) return null;

  const noop = () => {};

  const tryUnlock = () => {
    if (password.trim() === ADMIN.getPassword()) {
      ADMIN.unlock();
      setUnlocked(true);
      setGateError("");
      onToast("أهلًا بك في لوحة الإدارة 🤍");
    } else {
      setGateError("كلمة المرور غير صحيحة… حاولي مرة أخرى");
    }
  };

  const submitForm = async () => {
    if (!form.text.trim() || !form.author.trim()) {
      setFormError("النص واسم المصدر مطلوبان على الأقل");
      return;
    }
    const payload: NewQuote = {
      kind: form.kind,
      category: form.category,
      text: stripBrackets(form.text),
      author: stripBrackets(form.author),
      source: stripBrackets(form.source) || "من إعدادك",
      ...(form.kind === "quran" && form.translation.trim()
        ? { translation: stripBrackets(form.translation) }
        : {}),
    };

    const res = editingId
      ? await onUpdate(editingId, payload)
      : await onAdd(payload);
    if (!res.ok) {
      setFormError(res.error ?? "تعذّر الحفظ");
      if (cloud.needsLogin) setTab("settings");
      return;
    }
    onToast(
      editingId
        ? "تم تحديث الاقتباس ✓"
        : cloud.configured
          ? "تم النشر لكل الزوار ☁️🎉"
          : "تم نشر الاقتباس في الصفحة 🎉",
    );
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
  };

  const startEdit = (quote: Quote) => {
    setEditingId(quote.id);
    setForm({
      kind: quote.kind,
      category: quote.category,
      text: quote.text,
      author: quote.author,
      source: quote.source,
      translation: quote.translation ?? "",
    });
    setTab("new");
    window.setTimeout(() => textRef.current?.focus(), 60);
  };

  const handleExport = () => {
    if (customQuotes.length === 0) {
      onToast("لا توجد اقتباسات منشورة للتصدير");
      return;
    }
    const blob = new Blob([JSON.stringify(customQuotes, null, 2)], {
      type: "application/json",
    });
    downloadDataUrl(URL.createObjectURL(blob), "fiqulubina-quotes.json");
    onToast("تم تصدير الاقتباسات كملف JSON ⬇️");
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const valid = list.filter(
        (q): q is Quote =>
          Boolean(q) && typeof q.text === "string" && typeof q.author === "string",
      );
      if (valid.length === 0) {
        onToast("الملف لا يحتوي على اقتباسات صالحة");
        return;
      }
      const res = await onImport(valid);
      onToast(
        res.ok ? `تم استيراد ${valid.length} اقتباسًا ✓` : (res.error ?? "تعذّر الاستيراد"),
      );
    } catch {
      onToast("تعذّر قراءة الملف… تأكدي من أنه JSON صالح");
    }
  };

  const savePassword = () => {
    if (newPassword.trim().length < 4) {
      onToast("كلمة المرور قصيرة جدًا (٤ أحرف على الأقل)");
      return;
    }
    if (newPassword !== confirmPassword) {
      onToast("كلمتا المرور غير متطابقتين");
      return;
    }
    ADMIN.setPassword(newPassword.trim());
    setNewPassword("");
    setConfirmPassword("");
    onToast("تم تغيير كلمة المرور ✓");
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-end justify-center bg-night-950/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="لوحة إدارة الموقع"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-pop flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] border border-gold-300/30 bg-[#f7faf7] shadow-2xl dark:border-gold-300/15 dark:bg-night-900 sm:rounded-[2rem]">
        {/* ═══ الترويسة ═══ */}
        <div className="relative overflow-hidden border-b border-emerald-900/10 bg-gradient-to-l from-emerald-800 to-night-900 px-5 py-5 text-emerald-50 dark:border-gold-300/10 sm:px-7">
          <div className="geo-pattern pointer-events-none absolute inset-0 opacity-[0.1]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-300/15 text-gold-200 ring-1 ring-gold-300/40">
                <IconShield className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-logo text-xl font-bold text-gold-100">
                  لوحة إدارة الموقع
                </h2>
                <p className="text-[0.7rem] text-emerald-200/70">
                  نشر وإدارة الاقتباسات من داخل الصفحة
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-200/25 bg-emerald-950/40 text-emerald-100 transition hover:border-gold-300/50 hover:text-gold-200"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>
          <AdminSignature className="relative mt-4" />
        </div>

        {/* ═══ بوابة كلمة المرور ═══ */}
        {!unlocked ? (
          <div className="px-6 py-10 sm:px-10">
            <div className="mx-auto max-w-sm text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900/5 text-emerald-800 dark:bg-emerald-100/10 dark:text-gold-200">
                <IconLock className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-logo text-lg font-bold text-night-900 dark:text-gold-100">
                منطقة خاصة
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-night-800/60 dark:text-emerald-100/55">
                هذه المنطقة مخصّصة لصاحب الموقع فقط. أدخلي كلمة المرور للدخول إلى
                لوحة الإدارة.
              </p>

              <form
                className="mt-6 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  tryUnlock();
                }}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  autoFocus
                  className="w-full rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-3 text-center text-sm font-semibold text-night-900 outline-none transition placeholder:font-normal placeholder:text-night-800/35 focus:border-gold-400 dark:border-emerald-400/15 dark:bg-night-800 dark:text-gold-100"
                />
                {gateError && (
                  <p className="text-xs font-semibold text-rose-500">
                    {gateError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-l from-emerald-700 to-emerald-900 px-5 py-3.5 text-sm font-bold text-gold-100 shadow-lg shadow-emerald-900/20 transition hover:brightness-110 active:scale-[0.98]"
                >
                  دخول إلى اللوحة
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* ═══ التبويبات ═══ */}
            <div className="flex gap-1.5 border-b border-emerald-900/10 px-4 pt-4 dark:border-gold-300/10 sm:px-6">
              {(
                [
                  { key: "new", label: "اقتباس جديد", icon: IconPlus },
                  {
                    key: "mine",
                    label: `اقتباساتي (${customQuotes.length})`,
                    icon: IconEdit,
                  },
                  { key: "settings", label: "الإعدادات", icon: IconShield },
                ] as { key: TabKey; label: string; icon: typeof IconPlus }[]
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-t-2xl px-3.5 py-3 text-xs font-bold transition sm:text-sm",
                    tab === item.key
                      ? "text-emerald-900 dark:text-gold-100"
                      : "text-night-800/45 hover:text-night-800/70 dark:text-emerald-100/40 dark:hover:text-emerald-100/70",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {tab === item.key && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-l from-gold-300 to-emerald-600" />
                  )}
                </button>
              ))}
            </div>

            {/* ═══ المحتوى ═══ */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {tab === "new" && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold text-night-800/70 dark:text-emerald-100/70">
                          النوع
                        </span>
                        <select
                          value={form.kind}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              kind: e.target.value as QuoteKind,
                            }))
                          }
                          className="w-full rounded-2xl border border-emerald-900/15 bg-white/80 px-3.5 py-2.5 text-sm font-semibold text-night-900 outline-none focus:border-gold-400 dark:border-emerald-400/15 dark:bg-night-800 dark:text-gold-100"
                        >
                          {(Object.keys(KIND_META) as QuoteKind[]).map((k) => (
                            <option key={k} value={k}>
                              {KIND_META[k].label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold text-night-800/70 dark:text-emerald-100/70">
                          القسم
                        </span>
                        <select
                          value={form.category}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              category: e.target.value as CategoryKey,
                            }))
                          }
                          className="w-full rounded-2xl border border-emerald-900/15 bg-white/80 px-3.5 py-2.5 text-sm font-semibold text-night-900 outline-none focus:border-gold-400 dark:border-emerald-400/15 dark:bg-night-800 dark:text-gold-100"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c.key} value={c.key}>
                              {c.icon} {c.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-night-800/70 dark:text-emerald-100/70">
                        النص *
                      </span>
                      <textarea
                        ref={textRef}
                        value={form.text}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, text: e.target.value }))
                        }
                        rows={5}
                        placeholder="اكتبي الاقتباس هنا…"
                        className="w-full resize-none rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-3 font-serif text-base leading-loose text-night-900 outline-none transition placeholder:font-sans placeholder:text-sm placeholder:leading-normal placeholder:text-night-800/35 focus:border-gold-400 dark:border-emerald-400/15 dark:bg-night-800 dark:text-gold-100"
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold text-night-800/70 dark:text-emerald-100/70">
                          المصدر / القائل *
                        </span>
                        <input
                          value={form.author}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, author: e.target.value }))
                          }
                          placeholder="مثال: ابن القيم الجوزية"
                          className="w-full rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-2.5 text-sm text-night-900 outline-none focus:border-gold-400 dark:border-emerald-400/15 dark:bg-night-800 dark:text-gold-100"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold text-night-800/70 dark:text-emerald-100/70">
                          الكتاب / السورة
                        </span>
                        <input
                          value={form.source}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, source: e.target.value }))
                          }
                          placeholder="مثال: مدارج السالكين"
                          className="w-full rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-2.5 text-sm text-night-900 outline-none focus:border-gold-400 dark:border-emerald-400/15 dark:bg-night-800 dark:text-gold-100"
                        />
                      </label>
                    </div>

                    {form.kind === "quran" && (
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold text-night-800/70 dark:text-emerald-100/70">
                          الترجمة (اختياري)
                        </span>
                        <input
                          dir="ltr"
                          value={form.translation}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              translation: e.target.value,
                            }))
                          }
                          placeholder="English translation"
                          className="w-full rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-2.5 text-left text-sm text-night-900 outline-none focus:border-gold-400 dark:border-emerald-400/15 dark:bg-night-800 dark:text-gold-100"
                        />
                      </label>
                    )}

                    {formError && (
                      <p className="text-xs font-semibold text-rose-500">
                        {formError}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={submitForm}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-gold-300 via-gold-400 to-gold-500 px-5 py-3.5 text-sm font-bold text-night-900 shadow-lg shadow-gold-900/20 transition hover:brightness-110 active:scale-[0.98]"
                      >
                        <IconPlus className="h-5 w-5" />
                        {editingId ? "حفظ التعديلات" : "نشر الاقتباس"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setForm(EMPTY_FORM);
                            setFormError("");
                          }}
                          className="rounded-2xl border border-emerald-900/15 bg-white/70 px-4 py-3.5 text-sm font-semibold text-night-800/70 transition hover:border-gold-400/60 dark:border-emerald-400/15 dark:bg-night-800 dark:text-emerald-100/70"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  </div>

                  {/* معاينة مباشرة */}
                  <div>
                    <p className="mb-2.5 text-xs font-bold text-night-800/60 dark:text-emerald-100/55">
                      معاينة مباشرة
                    </p>
                    <QuoteCard
                      quote={draftQuote}
                      isFavorite={false}
                      onCopy={noop}
                      onShare={noop}
                      onToggleFavorite={noop}
                      onDesign={noop}
                    />
                    <p className="mt-3 text-[0.7rem] leading-relaxed text-night-800/45 dark:text-emerald-100/40">
                      النص المُنسَخ: {formatQuoteForShare(draftQuote)}
                    </p>
                  </div>
                </div>
              )}

              {tab === "mine" && (
                <div className="space-y-3">
                  {customQuotes.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-emerald-900/15 px-6 py-12 text-center dark:border-gold-300/15">
                      <p className="text-sm font-semibold text-night-800/60 dark:text-emerald-100/55">
                        لم تنشئي أي اقتباس بعد.
                      </p>
                      <button
                        type="button"
                        onClick={() => setTab("new")}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-emerald-700 to-emerald-900 px-5 py-2.5 text-sm font-bold text-gold-100"
                      >
                        <IconPlus className="h-4 w-4" />
                        إنشاء اقتباس
                      </button>
                    </div>
                  ) : (
                    customQuotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="flex items-start gap-3 rounded-2xl border border-emerald-900/10 bg-white/70 p-4 dark:border-emerald-400/10 dark:bg-night-800/60"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-serif text-sm leading-relaxed text-night-900 dark:text-emerald-50">
                            {quote.text}
                          </p>
                          <p className="mt-1.5 text-xs text-night-800/50 dark:text-emerald-100/45">
                            {quote.author} · {quote.source} ·{" "}
                            {KIND_META[quote.kind].short}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(quote)}
                            aria-label="تعديل"
                            title="تعديل"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-night-800/55 transition hover:bg-emerald-900/5 hover:text-emerald-800 dark:text-emerald-100/55 dark:hover:bg-emerald-100/10 dark:hover:text-gold-200"
                          >
                            <IconEdit className="h-4.5 w-4.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm("حذف هذا الاقتباس نهائيًا؟")
                              ) {
                                void onDelete(quote.id).then((r) =>
                                  onToast(
                                    r.ok ? "تم حذف الاقتباس" : (r.error ?? "تعذّر الحذف"),
                                  ),
                                );
                                if (editingId === quote.id) {
                                  setEditingId(null);
                                  setForm(EMPTY_FORM);
                                }
                              }
                            }}
                            aria-label="حذف"
                            title="حذف"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-night-800/55 transition hover:bg-rose-500/10 hover:text-rose-500 dark:text-emerald-100/55"
                          >
                            <IconTrash className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "settings" && (
                <div className="space-y-5">
                  <LogoSettings onToast={onToast} />

                  <CloudSettings cloud={cloud} onToast={onToast} />

                  <section className="rounded-2xl border border-emerald-900/10 bg-white/70 p-5 dark:border-emerald-400/10 dark:bg-night-800/60">
                    <h3 className="text-sm font-bold text-night-900 dark:text-gold-100">
                      تغيير كلمة المرور
                    </h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="كلمة المرور الجديدة"
                        className="rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-2.5 text-sm text-night-900 outline-none focus:border-gold-400 dark:border-emerald-400/15 dark:bg-night-900 dark:text-gold-100"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="تأكيد كلمة المرور"
                        className="rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-2.5 text-sm text-night-900 outline-none focus:border-gold-400 dark:border-emerald-400/15 dark:bg-night-900 dark:text-gold-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={savePassword}
                      className="mt-3 rounded-2xl bg-gradient-to-l from-emerald-700 to-emerald-900 px-5 py-2.5 text-sm font-bold text-gold-100 transition hover:brightness-110"
                    >
                      حفظ كلمة المرور
                    </button>
                  </section>

                  <section className="rounded-2xl border border-emerald-900/10 bg-white/70 p-5 dark:border-emerald-400/10 dark:bg-night-800/60">
                    <h3 className="text-sm font-bold text-night-900 dark:text-gold-100">
                      نسخة احتياطية
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-night-800/55 dark:text-emerald-100/50">
                      اقتباساتك محفوظة في متصفح هذا الجهاز. صدّريها ملفًا
                      للاحتفاظ بها، أو استورديها على جهاز آخر.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-2.5 text-sm font-semibold text-night-800 transition hover:border-gold-400/60 dark:border-emerald-400/15 dark:bg-night-900 dark:text-emerald-100"
                      >
                        <IconDownload className="h-4.5 w-4.5" />
                        تصدير
                      </button>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-2.5 text-sm font-semibold text-night-800 transition hover:border-gold-400/60 dark:border-emerald-400/15 dark:bg-night-900 dark:text-emerald-100"
                      >
                        <IconUpload className="h-4.5 w-4.5" />
                        استيراد
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="application/json,.json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImportFile(file);
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "حذف كل الاقتباسات التي أنشأتها؟ لا يمكن التراجع.",
                            )
                          ) {
                            void onClear().then((r) =>
                              onToast(r.ok ? "تم حذف كل اقتباساتك" : (r.error ?? "تعذّر الحذف")),
                            );
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-300/50 bg-rose-500/5 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10"
                      >
                        <IconTrash className="h-4.5 w-4.5" />
                        حذف الكل
                      </button>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-gold-300/40 bg-gold-50/60 p-5 dark:border-gold-300/20 dark:bg-gold-400/5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-gold-700 dark:text-gold-200">
                      <IconShield className="h-4.5 w-4.5" />
                      ملاحظة عن الخصوصية
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-night-800/60 dark:text-emerald-100/55">
                      كلمة مرور اللوحة هي بوابة محلية فقط. عند ربط Supabase
                      تكون الحماية الحقيقية من تسجيل الدخول وسياسات RLS: يقرأ
                      الجميع الاقتباسات، ولا يكتب إلا حسابك. وبدون الربط تبقى
                      اقتباساتك في هذا المتصفح فقط.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        ADMIN.lock();
                        setUnlocked(false);
                        setPassword("");
                        onToast("تم قفل اللوحة 🔒");
                      }}
                      className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-2.5 text-sm font-semibold text-night-800 transition hover:border-gold-400/60 dark:border-emerald-400/15 dark:bg-night-900 dark:text-emerald-100"
                    >
                      <IconLock className="h-4.5 w-4.5" />
                      قفل اللوحة الآن
                    </button>
                  </section>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
