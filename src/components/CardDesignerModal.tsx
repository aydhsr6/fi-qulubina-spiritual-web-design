import React, { useState, useEffect, useRef } from 'react';
import { Quote, DesignerConfig, AspectRatioType, CardThemeId } from '../types';
import { CARD_THEMES } from '../data/quotesData';
import { drawCardToCanvas } from '../utils/canvasRenderer';
import { cleanQuoteText } from '../utils/quoteText';
import { 
  X, 
  Download, 
  Copy, 
  Sparkles, 
  Sliders, 
  Check, 
  Palette, 
  Type, 
  Square, 
  Smartphone, 
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

interface CardDesignerModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type?: 'success' | 'favorite' | 'share' | 'info') => void;
}

export const CardDesignerModal: React.FC<CardDesignerModalProps> = ({
  quote,
  isOpen,
  onClose,
  onShowToast
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  const [config, setConfig] = useState<DesignerConfig>({
    themeId: 'emerald',
    aspectRatio: '1:1',
    fontFamily: 'Amiri',
    fontSize: 42,
    showWatermark: true,
    frameStyle: 'ornate',
    textAlign: 'center',
    showBismillah: true
  });

  // Automatically select iPhone font for Hadith on open
  useEffect(() => {
    if (quote && isOpen) {
      if (quote.type === 'hadith') {
        setConfig((prev) => ({ ...prev, fontFamily: 'iPhone' }));
      } else if (quote.type === 'quran') {
        setConfig((prev) => ({ ...prev, fontFamily: 'Amiri' }));
      }
    }
  }, [quote?.id, isOpen]);

  // Re-render canvas when quote or config changes
  useEffect(() => {
    if (isOpen && quote && canvasRef.current) {
      // Ensure fonts are loaded before drawing
      if (document.fonts) {
        document.fonts.ready.then(() => {
          if (canvasRef.current && quote) {
            drawCardToCanvas(canvasRef.current, quote, config);
          }
        });
      } else {
        drawCardToCanvas(canvasRef.current, quote, config);
      }
    }
  }, [isOpen, quote, config]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !quote) return null;

  // Download high-resolution PNG image
  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const cleanAuthor = (quote.author || quote.source).replace(/[^\w\u0600-\u06FF]/g, '_').slice(0, 20);
      link.download = `في_قلوبنا_${cleanAuthor}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      onShowToast('تم تحميل البطاقة بدقة عالية بنجاح ✨', 'success');
    } catch (err) {
      console.error('Download error:', err);
      onShowToast('تعذر تحميل الصورة، يرجى المحاولة مرة أخرى', 'info');
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // Clipboard Item for image
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedImage(true);
          onShowToast('تم نسخ صورة البطاقة للحافظة مباشرة! 📋', 'success');
          setTimeout(() => setCopiedImage(false), 2500);
        } catch (copyErr) {
          // Fallback to text copy
          await navigator.clipboard.writeText(`${cleanQuoteText(quote.text)}\n${quote.source}\n#في_قلوبنا`);
          onShowToast('تم نسخ نص البطاقة للحافظة ✨', 'success');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy image error:', err);
      onShowToast('تم نسخ نص البطاقة بدلاً من ذلك', 'info');
    }
  };

  const aspectRatios: { id: AspectRatioType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: '1:1', label: 'مربع (1:1)', icon: <Square className="w-4 h-4" />, desc: 'إنستغرام وتيليجرام' },
    { id: '4:5', label: 'عمودي (4:5)', icon: <ImageIcon className="w-4 h-4" />, desc: 'منشور إنستغرام كامل' },
    { id: '9:16', label: 'ستوري (9:16)', icon: <Smartphone className="w-4 h-4" />, desc: 'حالة واتساب وستوري' },
    { id: '16:9', label: 'عرضي (16:9)', icon: <Sliders className="w-4 h-4" />, desc: 'منصة إكس وتويتر' }
  ];

  const fonts: { id: DesignerConfig['fontFamily']; label: string; badge?: string }[] = [
    { id: 'iPhone', label: 'خط الآيفون (iOS Arabic)', badge: 'موصى للحديث' },
    { id: 'Amiri', label: 'خط الأميري الأصيل' },
    { id: 'Aref Ruqaa', label: 'خط الرقعة الفني' },
    { id: 'Cairo', label: 'خط القاهرة الحديث' },
    { id: 'Reem Kufi', label: 'خط الكوفي التراثي' }
  ];

  const frames: { id: DesignerConfig['frameStyle']; label: string }[] = [
    { id: 'ornate', label: 'زخرفة أندلسية' },
    { id: 'minimal', label: 'إطار ناعم' },
    { id: 'modern', label: 'تصميم زجاجي' },
    { id: 'none', label: 'بدون إطار' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>مصمّم البطاقات الإيمانية</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-normal">
                  جاهزة للنشر
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                خصص الطابع، الخط، والأبعاد ثم حمّلها كصورة عالية الدقة لستوري أو بوست
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container: Preview + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* Canvas Preview Area (Left/Top) */}
          <div className="lg:col-span-7 bg-stone-100/70 dark:bg-stone-950/60 p-4 sm:p-8 flex flex-col items-center justify-center min-h-[340px] sm:min-h-[480px] border-b lg:border-b-0 lg:border-l border-stone-200 dark:border-stone-800 relative">
            <div className="relative max-w-full max-h-[60vh] flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-700">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[55vh] object-contain block"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-3 text-center">
              * معاينة مباشرة للبطاقة بدقة فائقة عند التصدير
            </p>
          </div>

          {/* Controls Sidebar (Right/Bottom) */}
          <div className="lg:col-span-5 p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[60vh] lg:max-h-[75vh]">
            
            {/* 1. Aspect Ratio */}
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>أبعاد البطاقة والمقاس:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setConfig({ ...config, aspectRatio: ar.id })}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all text-xs font-medium ${
                      config.aspectRatio === ar.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shrink-0">
                      {ar.icon}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold">{ar.label}</div>
                      <div className="text-[10px] text-stone-400 truncate">{ar.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Theme Palette */}
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>النمط اللوني والخلفية:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(CARD_THEMES).map((theme) => {
                  const isSelected = config.themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setConfig({ ...config, themeId: theme.id as CardThemeId })}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center relative ${
                        isSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-500/40 shadow-sm'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded-lg mb-1 shadow-inner border border-white/20"
                        style={{
                          background: `linear-gradient(135deg, ${theme.bgGradient[0]}, ${theme.bgGradient[1]})`
                        }}
                      />
                      <span className="text-[11px] font-medium text-stone-700 dark:text-stone-300 line-clamp-1">
                        {theme.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 left-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Typography Selection */}
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>نوع الخط العربي:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setConfig({ ...config, fontFamily: f.id })}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all relative ${
                      config.fontFamily === f.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="block">{f.label}</span>
                    {f.badge && (
                      <span className="inline-block text-[9px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-semibold mt-0.5">
                        {f.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Frame Style */}
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>شكل الإطار والزخرفة:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {frames.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setConfig({ ...config, frameStyle: frame.id })}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                      config.frameStyle === frame.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                        : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {frame.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Font Size Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                <span>حجم خط النص:</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">{config.fontSize}px</span>
              </div>
              <input
                type="range"
                min="28"
                max="60"
                step="2"
                value={config.fontSize}
                onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* 6. Toggles: Watermark & Bismillah */}
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-stone-700 dark:text-stone-300">
                <span>إظهار البسملة في الأعلى ﷽</span>
                <input
                  type="checkbox"
                  checked={config.showBismillah}
                  onChange={(e) => setConfig({ ...config, showBismillah: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-stone-700 dark:text-stone-300">
                <span>إظهار شعار "في قلوبنا" بالأسفل</span>
                <input
                  type="checkbox"
                  checked={config.showWatermark}
                  onChange={(e) => setConfig({ ...config, showWatermark: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </label>
            </div>

          </div>
        </div>

        {/* Footer Actions: Download & Copy Image */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/80">
          <div className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
            جاهز للنشر على إنستغرام، واتساب، وتيليجرام
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyImage}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                copiedImage
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
              }`}
            >
              {copiedImage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedImage ? 'تم النسخ' : 'نسخ الصورة'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-amber-200 shadow-md hover:shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{isDownloading ? 'جاري التحميل...' : 'تحميل كصورة (PNG)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
