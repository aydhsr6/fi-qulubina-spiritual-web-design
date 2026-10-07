import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const IconCopy = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M6.5 15H5.5A1.5 1.5 0 0 1 4 13.5V5.5A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5v1" />
  </svg>
);

export const IconShare = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.5v11" />
    <path d="m8 7.5 4-4 4 4" />
    <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
  </svg>
);

export const IconHeart = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <svg {...base} fill={filled ? "currentColor" : "none"} {...p}>
    <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7.6a4.5 4.5 0 0 1 7 2.9c0 5.15-7 9.5-7 9.5Z" />
  </svg>
);

export const IconSparkles = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.5 13.6 8l4.4 1.6L13.6 11 12 15.5 10.4 11 6 9.6 10.4 8Z" />
    <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z" />
    <path d="M5.5 14.5l.5 1.4 1.4.6-1.4.6-.5 1.4-.5-1.4L3.6 16.5l1.4-.6Z" />
  </svg>
);

export const IconPalette = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-1 2-2s-.6-1.6-.6-2.4c0-1 .8-1.6 1.9-1.6h1.7c2.2 0 3.5-1.4 3.5-3.6C20.5 6.5 16.7 3.5 12 3.5Z" />
    <circle cx="8" cy="10" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="10" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconDownload = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.5v11" />
    <path d="m7.5 10.5 4.5 4 4.5-4" />
    <path d="M4.5 17v1.5A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 2-2V17" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconSun = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </svg>
);

export const IconMoon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
  </svg>
);

export const IconMenu = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconHome = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19Z" />
    <path d="M9.5 20.5V14h5v6.5" />
  </svg>
);

export const IconBook = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1.2A2.5 2.5 0 0 1 14 4h4.5A1.5 1.5 0 0 1 20 5.5v12A1.5 1.5 0 0 1 18.5 19H14a2.5 2.5 0 0 0-2 1.2A2.5 2.5 0 0 0 10 19H5.5A1.5 1.5 0 0 1 4 17.5Z" />
    <path d="M12 5.2V20.2" />
  </svg>
);

export const IconMosque = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.5c1.6 1.2 2.6 2.6 2.6 4.2 0 .9-.3 1.6-.8 2.2h-3.6c-.5-.6-.8-1.3-.8-2.2 0-1.6 1-3 2.6-4.2Z" />
    <path d="M5 20.5v-7.2A2.8 2.8 0 0 1 7.8 10.5h8.4a2.8 2.8 0 0 1 2.8 2.8v7.2" />
    <path d="M3 20.5h18" />
    <path d="M10 20.5v-3.4a2 2 0 0 1 4 0v3.4" />
  </svg>
);

export const IconStar = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.8l2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2L4.5 9.3l5.2-.8Z" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconShuffle = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h3.5l9 10H20" />
    <path d="M17 3.5 20 7l-3 3.5" />
    <path d="M4 17h3.5l2.2-2.5" />
    <path d="M14.5 9.5 16.7 7H20" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconTrash = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4.5 7.5h15" />
    <path d="M9.5 7.5V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5v2" />
    <path d="M6.5 7.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-11.5" />
    <path d="M10.5 11v6M13.5 11v6" />
  </svg>
);

export const IconEdit = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4.5 19.5h4l10-10a2.5 2.5 0 0 0-3.5-3.5l-10 10Z" />
    <path d="M14.5 6.5 17.5 9.5" />
  </svg>
);

export const IconUpload = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 16V5" />
    <path d="m7.5 9.5 4.5-4.5 4.5 4.5" />
    <path d="M4.5 16v2.5A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 2-2V16" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.5 19.5 6v6c0 4.2-3 7.4-7.5 8.5C7.5 19.4 4.5 16.2 4.5 12V6Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
);

export const IconQuote = (p: IconProps) => (
  <svg {...p} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.2 5.5C6.4 6.7 4.8 9 4.8 12v6.5h6.3V12H7.6c0-1.9.9-3.4 2.6-4.3ZM19 5.5c-2.8 1.2-4.4 3.5-4.4 6.5v6.5h6.3V12h-3.5c0-1.9.9-3.4 2.6-4.3Z" />
  </svg>
);

