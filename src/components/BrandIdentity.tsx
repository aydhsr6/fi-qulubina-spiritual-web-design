import { useState, type ImgHTMLAttributes } from 'react';

// Place the original image at public/logo.png or public/logo.jpg.
// Relative paths also work when the site is hosted under a GitHub Pages subpath.
export const brandEmblemSrc = './logo.png';
const logoSources = [brandEmblemSrc, './logo.jpg', './images/fi-qulubina-emblem.jpg'];

type BrandEmblemProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'>;

export function BrandEmblem({ className = '', alt = '', ...props }: BrandEmblemProps) {
  const [sourceIndex, setSourceIndex] = useState(0);

  return (
    <img
      src={logoSources[sourceIndex]}
      alt={alt}
      draggable={false}
      className={`block select-none object-cover ${className}`}
      {...props}
      onError={() => setSourceIndex((index) => Math.min(index + 1, logoSources.length - 1))}
    />
  );
}

export function BrandMasthead() {
  return (
    <section aria-label="هوية في قلوبنا" className="relative isolate overflow-hidden py-8 text-center sm:py-11">
      <div aria-hidden="true" className="brand-aura pointer-events-none absolute left-1/2 top-4 -z-10 h-52 w-80 -translate-x-1/2 rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-300/10" />
      <div className="brand-mark-enter mx-auto flex size-28 items-center justify-center rounded-full bg-[#fffefa] shadow-[0_10px_36px_rgba(137,97,37,0.10)] ring-1 ring-amber-700/10 sm:size-32">
        <BrandEmblem
          alt="شعار في قلوبنا الذهبي"
          className="size-full rounded-full"
          fetchPriority="high"
        />
      </div>
      <div className="brand-title-enter mt-2">
        <h1
          className="text-4xl font-bold leading-tight text-[#aa813a] dark:text-[#e1bb71] sm:text-5xl"
          style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
        >
          في قلوبنا
        </h1>
        <p dir="ltr" className="mt-1 font-serif text-[11px] font-semibold tracking-[0.32em] text-[#a68550] dark:text-[#d3b985] sm:text-xs">
          IN OUR HEARTS
        </p>
        <p className="mt-3 text-xs leading-relaxed text-stone-500 dark:text-stone-400 sm:text-sm">
          كلمات تطمئن بها القلوب
        </p>
      </div>
    </section>
  );
}