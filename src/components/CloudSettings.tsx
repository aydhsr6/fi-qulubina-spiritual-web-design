import { useState } from "react";
import { cn } from "../utils/cn";
import type { CloudApi } from "../lib/store";
import {
  DEFAULT_SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_URL,
  SCHEMA_SQL,
} from "../lib/supabase";
import { copyToClipboard } from "../lib/share";
import { IconCheck, IconCopy, IconLock, IconShield, IconUpload } from "./icons";

interface CloudSettingsProps {
  cloud: CloudApi;
  onToast: (message: string) => void;
}

const inputClass =
  "w-full rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-2.5 text-sm text-night-900 outline-none transition placeholder:text-night-800/35 focus:border-gold-400 dark:border-emerald-400/15 dark:bg-night-900 dark:text-gold-100";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-700 to-emerald-900 px-5 py-2.5 text-sm font-bold text-gold-100 transition hover:brightness-110 disabled:opacity-60";

const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-900/15 bg-white/80 px-4 py-2.5 text-sm font-semibold text-night-800 transition hover:border-gold-400/60 dark:border-emerald-400/15 dark:bg-night-900 dark:text-emerald-100";

export function CloudSettings({ cloud, onToast }: CloudSettingsProps) {
  const [url, setUrl] = useState(cloud.url || DEFAULT_SUPABASE_URL);
  const [anonKey, setAnonKey] = useState(DEFAULT_SUPABASE_ANON_KEY);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showSql, setShowSql] = useState(false);

  const statusMeta = {
    off: { label: "غير مرتبط", dot: "bg-night-800/30" },
    loading: { label: "جارٍ الاتصال…", dot: "bg-gold-400 animate-pulse" },
    ok: { label: "متصل بقاعدة البيانات", dot: "bg-emerald-500" },
    error: { label: "خطأ في الاتصال", dot: "bg-rose-500" },
  }[cloud.status];

  const handleConnect = async () => {
    setBusy(true);
    setMessage("");
    const res = await cloud.connect({ url, anonKey });
    setBusy(false);
    if (res.ok) {
      setAnonKey("");
      onToast("تم ربط Supabase بنجاح ☁️");
    } else {
      setMessage(res.error ?? "تعذّر الربط");
    }
  };

  const handleSignIn = async () => {
    setBusy(true);
    setMessage("");
    const res = await cloud.signIn(email, password);
    setBusy(false);
    if (res.ok) {
      setPassword("");
      onToast("تم تسجيل الدخول — يمكنك النشر الآن ✓");
    } else {
      setMessage(res.error ?? "تعذّر تسجيل الدخول");
    }
  };

  const handleMigrate = async () => {
    setBusy(true);
    const res = await cloud.migrateLocal();
    setBusy(false);
    onToast(res.ok ? "نُقلت اقتباساتك المحلية إلى السحابة ☁️" : (res.error ?? "تعذّر النقل"));
  };

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/70 p-5 dark:border-emerald-400/10 dark:bg-night-800/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-night-900 dark:text-gold-100">
          <IconShield className="h-4.5 w-4.5" />
          ربط Supabase (نشر لكل الزوار)
        </h3>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/5 px-3 py-1 text-[0.7rem] font-bold text-night-800/70 dark:bg-emerald-100/10 dark:text-emerald-100/70">
          <span className={cn("h-2 w-2 rounded-full", statusMeta.dot)} />
          {statusMeta.label}
        </span>
      </div>

      {cloud.status === "error" && cloud.error && (
        <p className="mt-3 rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-500">
          {cloud.error}
        </p>
      )}

      {/* ─── الخطوة 1: بيانات المشروع ─── */}
      {!cloud.configured ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs leading-relaxed text-night-800/55 dark:text-emerald-100/50">
            من لوحة Supabase ← Project Settings ← API، انسخ <b>Project URL</b> و
            مفتاح <b>anon public</b>. لا تستخدم مفتاح service_role أو توكن sbp_ أبدًا.
          </p>
          <input
            dir="ltr"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://xxxxxxxx.supabase.co"
            className={cn(inputClass, "text-left")}
          />
          <input
            dir="ltr"
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            placeholder="anon public key (eyJ… أو sb_publishable_…)"
            className={cn(inputClass, "text-left")}
          />
          <button type="button" onClick={handleConnect} disabled={busy} className={btnPrimary}>
            {busy ? "جارٍ الاتصال…" : "ربط المشروع"}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="break-all text-xs text-night-800/55 dark:text-emerald-100/50" dir="ltr">
            {cloud.url}
          </p>

          {/* ─── الخطوة 3: تسجيل الدخول ─── */}
          {cloud.user ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-900/5 px-4 py-3 dark:bg-emerald-100/10">
              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-gold-200">
                <IconCheck className="h-4 w-4" />
                <span dir="ltr">{cloud.user.email}</span>
              </span>
              <button type="button" onClick={() => void cloud.signOut()} className={btnGhost}>
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSignIn();
              }}
            >
              <p className="flex items-center gap-2 text-xs font-bold text-night-800/70 dark:text-emerald-100/70">
                <IconLock className="h-4 w-4" />
                تسجيل دخول المالك (للنشر والتعديل)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  dir="ltr"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  autoComplete="username"
                  className={cn(inputClass, "text-left")}
                />
                <input
                  dir="ltr"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  autoComplete="current-password"
                  className={cn(inputClass, "text-left")}
                />
              </div>
              <button type="submit" disabled={busy} className={btnPrimary}>
                {busy ? "جارٍ الدخول…" : "تسجيل الدخول"}
              </button>
            </form>
          )}

          {cloud.user && cloud.localCount > 0 && (
            <button type="button" onClick={handleMigrate} disabled={busy} className={btnGhost}>
              <IconUpload className="h-4.5 w-4.5" />
              نقل اقتباساتي المحلية ({cloud.localCount}) إلى السحابة
            </button>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void cloud.refresh()} className={btnGhost}>
              تحديث
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("فصل الربط مع Supabase؟ (لن تُحذف بياناتك من السحابة)")) {
                  cloud.disconnect();
                  onToast("تم فصل الربط");
                }
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-300/50 bg-rose-500/5 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10"
            >
              فصل الربط
            </button>
          </div>
        </div>
      )}

      {message && <p className="mt-3 text-xs font-semibold text-rose-500">{message}</p>}

      {/* ─── الخطوة 2: مخطط SQL ─── */}
      <div className="mt-5 border-t border-emerald-900/10 pt-4 dark:border-emerald-400/10">
        <button
          type="button"
          onClick={() => setShowSql((v) => !v)}
          className="text-xs font-bold text-emerald-800 underline-offset-4 hover:underline dark:text-gold-200"
        >
          {showSql ? "إخفاء" : "عرض"} مخطط قاعدة البيانات (SQL) — يُنفَّذ مرة واحدة
        </button>
        {showSql && (
          <div className="mt-3 space-y-3">
            <ol className="list-decimal space-y-1 ps-5 text-xs leading-relaxed text-night-800/60 dark:text-emerald-100/55">
              <li>افتح Supabase ← SQL Editor ← New query.</li>
              <li>الصق الكود أدناه ثم اضغط Run.</li>
              <li>
                من Authentication ← Users أنشئ مستخدمًا (بريدك وكلمة مرور قوية)، ثم من
                Sign In / Providers عطّل <b>Allow new users to sign up</b> حتى لا يستطيع غيرك
                التسجيل.
              </li>
            </ol>
            <pre
              dir="ltr"
              className="max-h-56 overflow-auto rounded-2xl bg-night-900 p-4 text-left text-[0.7rem] leading-relaxed text-emerald-100/90"
            >
              {SCHEMA_SQL}
            </pre>
            <button
              type="button"
              onClick={async () => {
                const ok = await copyToClipboard(SCHEMA_SQL);
                onToast(ok ? "تم نسخ كود SQL ✓" : "تعذّر النسخ");
              }}
              className={btnGhost}
            >
              <IconCopy className="h-4.5 w-4.5" />
              نسخ كود SQL
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
