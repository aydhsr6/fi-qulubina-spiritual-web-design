import { cn } from "../utils/cn";
import { IconCheck } from "./icons";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  const visible = Boolean(message);
  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-24 left-1/2 z-[90] -translate-x-1/2 transition-all duration-300 lg:bottom-6",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5 rounded-full bg-night-900 px-5 py-3 text-sm font-bold text-gold-100 shadow-2xl ring-1 ring-gold-400/40 dark:bg-night-800">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-night-900">
          <IconCheck className="h-4 w-4" strokeWidth={2.6} />
        </span>
        {message}
      </div>
    </div>
  );
}
