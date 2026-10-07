import { createClient } from '@supabase/supabase-js';
import type { CategoryId, Quote, QuoteType } from '../types';

// Both the project URL and publishable key are public; RLS controls data access.
// Environment variables can override these defaults for a different project.
const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || 'https://vhbpcuwgyjvyoyaucyzh.supabase.co';
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || 'sb_publishable_NyFXE3JehFymzPsQxjMo4Q_CHY1y9ld';

// Never accept personal-access or secret keys in a browser build.
export const supabaseConfigured = Boolean(
  projectUrl &&
  /^https:\/\/[^/]+\.supabase\.co\/?$/.test(projectUrl) &&
  publishableKey?.startsWith('sb_publishable_') &&
  !publishableKey.includes('YOUR_')
);

export const supabase = supabaseConfigured
  ? createClient(projectUrl!, publishableKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export interface PostRow {
  id: string;
  owner_id: string;
  type: QuoteType;
  text: string;
  source: string;
  author: string | null;
  category: CategoryId;
  tags: string[];
  explanation: string | null;
  created_at: string;
}

export function postToQuote(row: PostRow): Quote {
  return {
    id: row.id,
    type: row.type,
    text: row.text,
    source: row.source,
    author: row.author ?? undefined,
    category: row.category,
    tags: row.tags ?? [],
    explanation: row.explanation ?? undefined,
    createdAt: Date.parse(row.created_at),
    isCustom: true,
  };
}