export type QuoteType = 'quran' | 'hadith' | 'scholar' | 'reflection';

export type CategoryId =
  | 'all'
  | 'patience'
  | 'contemplation'
  | 'love'
  | 'softeners'
  | 'scholars'
  | 'duaa'
  | 'favorites';

export interface Category {
  id: CategoryId;
  label: string;
  iconName: string;
  description: string;
}

export interface Quote {
  id: string;
  type: QuoteType;
  text: string;
  source: string; // e.g. "سورة الرعد: 28" or "الإمام ابن القيم - الفوائد"
  author?: string; // e.g. "ابن القيم"
  category: CategoryId;
  tags: string[];
  reference?: string; // Additional authentication or context
  audioUrl?: string; // Audio recitation clip if available
  explanation?: string; // Brief spiritual touch/reflection
  isCustom?: boolean; // Published from the page
  createdAt?: number;
}

export type QuoteDraft = Pick<Quote, 'type' | 'text' | 'source' | 'category' | 'tags'> &
  Partial<Pick<Quote, 'author' | 'explanation'>>;

export type AspectRatioType = '1:1' | '4:5' | '9:16' | '16:9';

export type CardThemeId =
  | 'emerald'
  | 'night'
  | 'sand'
  | 'terracotta'
  | 'royal-amethyst'
  | 'pure-pearl';

export interface CardTheme {
  id: CardThemeId;
  name: string;
  bgGradient: [string, string];
  textColor: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
}

export interface DesignerConfig {
  themeId: CardThemeId;
  aspectRatio: AspectRatioType;
  fontFamily: 'iPhone' | 'Amiri' | 'Aref Ruqaa' | 'Cairo' | 'Reem Kufi';
  fontSize: number;
  showWatermark: boolean;
  frameStyle: 'ornate' | 'minimal' | 'modern' | 'none';
  textAlign: 'center' | 'right';
  showBismillah: boolean;
}
