import React from 'react';
import { Category, CategoryId, QuoteType } from '../types';
import { 
  Sparkles, 
  Anchor, 
  Compass, 
  HeartHandshake, 
  Feather, 
  BookMarked, 
  Flame, 
  Bookmark, 
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface CategoryFiltersProps {
  categories: Category[];
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  selectedType: 'all' | QuoteType;
  onSelectType: (type: 'all' | QuoteType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  counts: Record<string, number>;
  totalCount: number;
  availableTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  selectedType,
  onSelectType,
  searchQuery,
  onSearchChange,
  counts,
  totalCount,
  availableTags,
  selectedTag,
  onSelectTag
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 shrink-0" />;
      case 'Anchor':
        return <Anchor className="w-4 h-4 shrink-0" />;
      case 'Compass':
        return <Compass className="w-4 h-4 shrink-0" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4 shrink-0" />;
      case 'Feather':
        return <Feather className="w-4 h-4 shrink-0" />;
      case 'BookMarked':
        return <BookMarked className="w-4 h-4 shrink-0" />;
      case 'Flame':
        return <Flame className="w-4 h-4 shrink-0" />;
      case 'Bookmark':
        return <Bookmark className="w-4 h-4 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 shrink-0" />;
    }
  };

  const typeOptions: { id: 'all' | QuoteType; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'quran', label: 'آيات قرآنية' },
    { id: 'hadith', label: 'أحاديث نبوية' },
    { id: 'scholar', label: 'درر العلماء' },
    { id: 'reflection', label: 'خواطر إيمانية' }
  ];

  return (
    <div id="feed-section" className="space-y-6 pt-4">
      {/* Search and Secondary Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث في نص الآيات، الأحاديث، أو اسم القائل..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm shadow-sm transition-all"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-stone-400 hidden md:inline-flex items-center gap-1 ml-1 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            التصنيف:
          </span>
          {typeOptions.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => onSelectType(type.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-amber-200 shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-800'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Category Cards / Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = counts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-all duration-200 group relative border ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-800 to-emerald-900 text-white shadow-md shadow-emerald-900/20 border-emerald-700 ring-2 ring-emerald-500/20 scale-[1.02]'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-emerald-50/60 dark:hover:bg-stone-800/80 border-stone-200/70 dark:border-stone-800 hover:border-emerald-300/50 dark:hover:border-emerald-700/50'
              }`}
            >
              <div
                className={`p-2 rounded-xl mb-1.5 transition-colors ${
                  isActive
                    ? 'bg-emerald-700/70 text-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-600'
                }`}
              >
                {getIcon(cat.iconName)}
              </div>

              <span className="text-xs font-semibold line-clamp-1">{cat.label}</span>

              <span
                className={`text-[10px] mt-0.5 px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-emerald-950/60 text-amber-200'
                    : 'text-stone-400 group-hover:text-stone-500'
                }`}
              >
                {cat.id === 'all' ? totalCount : count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tag Filter row (if user wants to drill down by tags) */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
          <span className="text-stone-400 shrink-0 font-light ml-1">وسوم شائعة:</span>
          {selectedTag && (
            <button
              onClick={() => onSelectTag(null)}
              className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1 shrink-0 font-medium"
            >
              <span>إلغاء ({selectedTag})</span>
              <X className="w-3 h-3" />
            </button>
          )}
          {availableTags.slice(0, 10).map((tag) => {
            const isTagActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isTagActive ? null : tag)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium ${
                  isTagActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:bg-emerald-100/60 dark:hover:bg-stone-700 hover:text-emerald-800'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
