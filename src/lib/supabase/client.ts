import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// ビルド時以外は環境変数の存在をチェック
if (
  typeof window !== 'undefined' &&
  (supabaseUrl === 'https://placeholder.supabase.co' ||
    supabaseAnonKey === 'placeholder-anon-key')
) {
  console.error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// ブラウザクライアント用のSupabaseクライアント（Cookieベース）
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
