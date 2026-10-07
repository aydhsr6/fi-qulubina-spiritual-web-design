import { Quote, DesignerConfig } from '../types';
import { CARD_THEMES } from '../data/quotesData';
import { cleanQuoteText } from './quoteText';

export function getCanvasDimensions(aspectRatio: DesignerConfig['aspectRatio']): { width: number; height: number } {
  switch (aspectRatio) {
    case '1:1':
      return { width: 1080, height: 1080 };
    case '4:5':
      return { width: 1080, height: 1350 };
    case '9:16':
      return { width: 1080, height: 1920 };
    case '16:9':
      return { width: 1280, height: 720 };
    default:
      return { width: 1080, height: 1080 };
  }
}

// Helper to wrap Arabic text nicely into lines for canvas
function wrapArabicText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  // Respect user or seed manual line breaks if present
  const paragraphs = text.split('\n');
  const allLines: string[] = [];

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/);
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        allLines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      allLines.push(currentLine);
    }
  }

  return allLines;
}

export function drawCardToCanvas(
  canvas: HTMLCanvasElement,
  quote: Quote,
  config: DesignerConfig
): void {
  const { width, height } = getCanvasDimensions(config.aspectRatio);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = CARD_THEMES[config.themeId] || CARD_THEMES.emerald;

  // 1. Draw Background Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, theme.bgGradient[0]);
  grad.addColorStop(1, theme.bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Decorative subtle background patterns (Islamic geometric stars & glows)
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = theme.accentColor;
  
  // Center large circular flourish
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // Subtle corner decorative circles
  ctx.beginPath();
  ctx.arc(0, 0, width * 0.35, 0, Math.PI * 2);
  ctx.arc(width, 0, width * 0.35, 0, Math.PI * 2);
  ctx.arc(0, height, width * 0.35, 0, Math.PI * 2);
  ctx.arc(width, height, width * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Draw Ornate Frames if requested
  const margin = Math.round(width * 0.055);
  const innerMargin = margin + 14;

  if (config.frameStyle === 'ornate') {
    ctx.save();
    // Outer border
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.75;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Inner thin border
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.45;
    ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);

    // Corner diamond flourishes
    const cornerSize = 16;
    const corners = [
      [innerMargin, innerMargin],
      [width - innerMargin, innerMargin],
      [innerMargin, height - innerMargin],
      [width - innerMargin, height - innerMargin]
    ];

    ctx.fillStyle = theme.accentColor;
    ctx.globalAlpha = 0.9;
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - cornerSize);
      ctx.lineTo(cx + cornerSize, cy);
      ctx.lineTo(cx, cy + cornerSize);
      ctx.lineTo(cx - cornerSize, cy);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else if (config.frameStyle === 'minimal') {
    ctx.save();
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    ctx.restore();
  } else if (config.frameStyle === 'modern') {
    // Glassmorphic rounded container in center
    ctx.save();
    const pad = margin * 0.8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    
    // Rounded rect
    const r = 24;
    const rx = pad;
    const ry = pad;
    const rw = width - pad * 2;
    const rh = height - pad * 2;
    
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + rw - r, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
    ctx.lineTo(rx + rw, ry + rh - r);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
    ctx.lineTo(rx + r, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 4. Draw Header / Bismillah
  let currentY = margin + Math.round(height * 0.07);

  if (config.showBismillah) {
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accentColor;
    ctx.font = `600 ${Math.round(width * 0.038)}px 'Amiri', serif`;
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, currentY);

    // Decorative mini divider
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    const divWidth = width * 0.22;
    ctx.moveTo((width - divWidth) / 2, currentY + 18);
    ctx.lineTo((width + divWidth) / 2, currentY + 18);
    ctx.stroke();

    // Center star dot
    ctx.fillStyle = theme.accentColor;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(width / 2, currentY + 18, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    currentY += Math.round(height * 0.06);
  }

  // 5. Draw Quote Content
  const maxContentWidth = width - margin * 3.4;
  const quoteFontSize = Math.round(config.fontSize * (width / 1000));
  const lineHeight = Math.round(quoteFontSize * 1.68);

  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = config.textAlign;
  ctx.fillStyle = theme.textColor;
  
  // Choose font family based on user config
  const fontFam =
    config.fontFamily === 'iPhone'
      ? `-apple-system, BlinkMacSystemFont, 'SF Pro Arabic', 'IBM Plex Sans Arabic', 'Geeza Pro', sans-serif`
      : config.fontFamily === 'Amiri'
      ? `'Amiri', serif`
      : config.fontFamily === 'Aref Ruqaa'
      ? `'Aref Ruqaa', cursive`
      : config.fontFamily === 'Reem Kufi'
      ? `'Reem Kufi', sans-serif`
      : `'Cairo', sans-serif`;

  ctx.font = `500 ${quoteFontSize}px ${fontFam}`;

  const wrappedLines = wrapArabicText(ctx, cleanQuoteText(quote.text), maxContentWidth);
  const totalTextHeight = wrappedLines.length * lineHeight;

  // Dynamically calculate vertical center
  const availableCenterY = currentY + (height - currentY - margin * 2.2 - 120) / 2;
  const textStartY = Math.max(currentY + 20, availableCenterY - totalTextHeight / 2);

  // Draw lines
  const textX = config.textAlign === 'center' ? width / 2 : width - margin * 1.8;

  for (let i = 0; i < wrappedLines.length; i++) {
    ctx.fillText(wrappedLines[i], textX, textStartY + i * lineHeight);
  }

  ctx.restore();

  // 6. Draw Author / Source Badge
  const badgeY = Math.min(
    height - margin - Math.round(height * 0.12),
    textStartY + totalTextHeight + Math.round(height * 0.07)
  );

  ctx.save();
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';

  // Attribution text
  const sourceLabel = quote.author ? `${quote.author} • ${quote.source}` : quote.source;
  const sourceFontSize = Math.round(width * 0.034);
  ctx.font = `600 ${sourceFontSize}px 'Cairo', sans-serif`;
  const badgeTextWidth = ctx.measureText(sourceLabel).width;
  const badgePadX = 36;
  const badgePadY = 16;
  const badgeW = badgeTextWidth + badgePadX * 2;
  const badgeH = sourceFontSize + badgePadY * 2;

  // Badge background
  ctx.fillStyle = theme.badgeBg;
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 1;
  const br = badgeH / 2;
  const bx = (width - badgeW) / 2;
  const by = badgeY - badgeH / 2;

  ctx.beginPath();
  ctx.moveTo(bx + br, by);
  ctx.lineTo(bx + badgeW - br, by);
  ctx.arcTo(bx + badgeW, by, bx + badgeW, by + br, br);
  ctx.arcTo(bx + badgeW, by + badgeH, bx + badgeW - br, by + badgeH, br);
  ctx.lineTo(bx + br, by + badgeH);
  ctx.arcTo(bx, by + badgeH, bx, by + br, br);
  ctx.arcTo(bx, by, bx + br, by, br);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Text inside badge
  ctx.fillStyle = theme.accentColor;
  ctx.fillText(sourceLabel, width / 2, badgeY + sourceFontSize * 0.35);
  ctx.restore();

  // 7. Brand watermark
  if (config.showWatermark) {
    ctx.save();
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accentColor;
    ctx.globalAlpha = 0.55;
    const wmFontSize = Math.max(16, Math.round(width * 0.026));
    ctx.font = `500 ${wmFontSize}px 'Cairo', sans-serif`;
    ctx.fillText('في قلوبنا  •  IN OUR HEARTS', width / 2, height - margin * 0.55);
    ctx.restore();
  }
}
