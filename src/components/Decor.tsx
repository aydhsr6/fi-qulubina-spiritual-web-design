import { cn } from "../utils/cn";
import { SiteAvatar } from "./SiteAvatar";

/** شعار الموقع: نجمة ثمانية مع قلب في القلب */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <SiteAvatar className="h-12 w-12" />
      <span className="flex flex-col leading-none">
        <span className="font-logo text-2xl font-bold tracking-tight text-night-900 dark:text-gold-100">
          في قلوبنا
        </span>
        <span className="mt-1 text-[0.7rem] font-medium tracking-wide text-emerald-700/80 dark:text-emerald-300/70">
          نفحات إيمانية تُدفئ القلب
        </span>
      </span>
    </span>
  );
}

/** فاصل زخرفي ذهبي */
export function Ornament({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center gap-3", className)}
      aria-hidden="true"
    >
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400/70" />
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gold-500" fill="currentColor">
        <path d="M12 2.5 14.2 9.8 21.5 12 14.2 14.2 12 21.5 9.8 14.2 2.5 12 9.8 9.8Z" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400/70" />
    </div>
  );
}

/** توقيع إداري مزخرف */
export function AdminSignature({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2.5", className)}>
      <span className="text-[0.65rem] font-bold tracking-[0.35em] text-night-800/40 dark:text-emerald-100/35">
        إدارة الموقع
      </span>
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold-400/70 sm:w-12" />
        <span className="relative">
          <span className="font-logo bg-gradient-to-l from-gold-600 via-gold-300 to-gold-500 bg-clip-text text-lg font-bold text-transparent sm:text-xl dark:from-gold-300 dark:via-gold-100 dark:to-gold-400">
            أيوب ضاري سرحان العبيدي
          </span>
          <span className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-l from-transparent via-gold-400/50 to-transparent" />
        </span>
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold-400/70 sm:w-12" />
      </div>
    </div>
  );
}

/** هالات ضوئية خلفية للصفحة */
export function AmbientGlow() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-emerald-300/30 blur-[120px] dark:bg-emerald-700/20" />
      <div className="absolute top-1/3 left-[-15%] h-[24rem] w-[24rem] rounded-full bg-gold-200/40 blur-[130px] dark:bg-gold-600/10" />
      <div className="absolute bottom-[-10%] right-1/4 h-[20rem] w-[20rem] rounded-full bg-emerald-200/30 blur-[120px] dark:bg-emerald-800/20" />
    </div>
  );
}
