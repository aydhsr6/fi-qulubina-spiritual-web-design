import { useEffect, useState } from "react";
import { cn } from "../utils/cn";

/** زر العودة للأعلى — يظهر بعد التمرير */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="العودة إلى الأعلى"
      title="العودة إلى الأعلى"
      className={cn(
        "fixed bottom-24 left-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold-300/50 bg-white/80 text-emerald-800 shadow-lg backdrop-blur transition-all duration-300 hover:border-gold-400 hover:text-gold-600 dark:border-gold-300/25 dark:bg-night-800/80 dark:text-gold-200 dark:hover:text-gold-100 lg:bottom-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m6.5 10.5 5.5-5.5 5.5 5.5" />
      </svg>
    </button>
  );
}
