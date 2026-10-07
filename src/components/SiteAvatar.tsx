import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { useSiteLogo } from "../lib/logo";

/** الأيقونة الاحتياطية عند غياب ملف الشعار */
function Emblem() {
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-600 via-emerald-800 to-night-900" />
      <svg
        viewBox="0 0 40 40"
        className="relative h-[62%] w-[62%] text-gold-300"
        aria-hidden="true"
      >
        <path
          d="M20 5.5 24 15.5 34 20 24 24.5 20 34.5 16 24.5 6 20 16 15.5Z"
          fill="currentColor"
          fillOpacity="0.22"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M20 17.4c-.9-1.1-3.1-.7-3.1 1.3 0 1.5 2 3.2 3.1 4 1.1-.8 3.1-2.5 3.1-4 0-2-2.2-2.4-3.1-1.3Z"
          fill="currentColor"
        />
      </svg>
    </>
  );
}

interface SiteAvatarProps {
  className?: string;
}

/**
 * الصورة الشخصية للموقع (شعار قطرة الخط الذهبي).
 * تُقصّ دائريًا وتُكبَّر لتتمركز القطرة في الإطار.
 */
export function SiteAvatar({ className }: SiteAvatarProps) {
  const { src } = useSiteLogo();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => setFailedSrc(null), [src]);

  const showImage = failedSrc !== src;

  return (
    <span
      className={cn(
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg shadow-gold-900/15 ring-2 ring-gold-300/70",
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt="شعار في قلوبنا"
          draggable={false}
          onError={() => setFailedSrc(src)}
          className="h-full w-full origin-[50%_42%] scale-[1.4] select-none object-cover"
        />
      ) : (
        <Emblem />
      )}
    </span>
  );
}
