import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, return a dummy client
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      return createClient(
        'https://placeholder.supabase.co',
        'placeholder-anon-key'
      );
    }
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
