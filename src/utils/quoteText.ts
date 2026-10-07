// The reader and exported images use the same uncluttered text, including older posts.
export function cleanQuoteText(text: string): string {
  return text.replace(/[«»]/g, '').trim();
}