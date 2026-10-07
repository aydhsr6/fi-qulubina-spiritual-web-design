import { AdminSignature, Logo, Ornament } from "./Decor";
import { IconLock } from "./icons";
import { QUOTES } from "../data/quotes";

interface FooterProps {
  onOpenAdmin: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-emerald-900/10 bg-white/50 backdrop-blur-sm dark:border-gold-300/10 dark:bg-night-900/40">
      <div className="geo-pattern pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-12 sm:px-6 lg:pb-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo />
          <Ornament className="w-full max-w-xs" />
          <p className="max-w-2xl text-sm leading-loose text-night-800/65 dark:text-emerald-100/60">
            في قلوبنا… مساحةٌ هادئة نجمع فيها الآيات القرآنية، والأحاديث النبوية،
            ودرر العلماء، وتأملاتٍ إيمانية… علّ قلبًا يجد فيها ما يطمئن به.
            <br />
            <span className="text-xs">
              النقول على المشهور في تداولها بين الناس، والله تعالى أعلم.
            </span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-night-800/50 dark:text-emerald-100/45">
            <span>{QUOTES.length} اقتباسًا مختارًا</span>
            <span className="h-1 w-1 rounded-full bg-gold-400/70" />
            <span>حفظ المفضلة في متصفحك</span>
            <span className="h-1 w-1 rounded-full bg-gold-400/70" />
            <span>بطاقات جاهزة للنشر</span>
          </div>

          <p className="font-logo text-lg text-emerald-800 dark:text-gold-200">
            وَاذْكُرْ رَبَّكَ كَثِيرًا
          </p>

          {/* ═══ التوقيع الإداري المزخرف ═══ */}
          <div className="w-full max-w-md rounded-3xl border border-gold-300/40 bg-gradient-to-b from-gold-50/70 to-white/40 px-6 py-6 dark:border-gold-300/20 dark:from-gold-400/[0.07] dark:to-transparent">
            <AdminSignature />
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/60 px-4 py-2 text-xs font-semibold text-night-800/45 transition hover:border-gold-400/50 hover:text-gold-600 dark:border-gold-300/10 dark:bg-night-900/50 dark:text-emerald-100/40 dark:hover:text-gold-200"
            >
              <IconLock className="h-3.5 w-3.5" />
              لوحة إدارة الموقع
            </button>
            <p className="text-xs text-night-800/40 dark:text-emerald-100/35">
              صُنع بمحبةٍ لوجه الله تعالى · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
