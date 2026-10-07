import { useRef, useState } from "react";
import { processLogoFile, setStoredLogo, useSiteLogo } from "../lib/logo";
import { SiteAvatar } from "./SiteAvatar";
import { IconUpload, IconTrash } from "./icons";

interface LogoSettingsProps {
  onToast: (message: string) => void;
}

export function LogoSettings({ onToast }: LogoSettingsProps) {
  const { src, isCustom } = useSiteLogo();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onToast("اختر ملف صورة (PNG أو JPG)");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await processLogoFile(file);
      setStoredLogo(dataUrl);
      onToast("تم تعيين الشعار كصورة شخصية للموقع ✓");
    } catch {
      onToast("تعذّرت معالجة الصورة");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white/70 p-5 dark:border-emerald-400/10 dark:bg-night-800/60">
      <h3 className="text-sm font-bold text-night-900 dark:text-gold-100">
        الصورة الشخصية للموقع (الشعار)
      </h3>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <SiteAvatar className="h-24 w-24" />
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-xs leading-relaxed text-night-800/55 dark:text-emerald-100/50">
            تظهر في الترويسة والفوتر وأيقونة التبويب وأيقونة التطبيق. الصورة المرفوعة
            من هنا تُحفظ في هذا المتصفح. ولتظهر لكل الزوار ضع الملف باسم{" "}
            <b dir="ltr">public/logo.png</b> في المشروع.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-700 to-emerald-900 px-4 py-2.5 text-sm font-bold text-gold-100 transition hover:brightness-110 disabled:opacity-60"
            >
              <IconUpload className="h-4.5 w-4.5" />
              {busy ? "جارٍ المعالجة…" : "رفع الشعار"}
            </button>
            {isCustom && (
              <button
                type="button"
                onClick={() => {
                  setStoredLogo(null);
                  onToast("عاد الشعار إلى الملف الافتراضي");
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-300/50 bg-rose-500/5 px-4 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10"
              >
                <IconTrash className="h-4.5 w-4.5" />
                إزالة المرفوع
              </button>
            )}
          </div>
          <p className="text-[0.7rem] text-night-800/40 dark:text-emerald-100/35" dir="ltr">
            {isCustom ? "source: uploaded" : `source: /${src}`}
          </p>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </section>
  );
}
