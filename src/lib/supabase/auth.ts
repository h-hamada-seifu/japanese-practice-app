import { supabase } from './client';

// 許可されたドメインリスト
const ALLOWED_DOMAINS = ['i-seifu.jp', 'i-seifu.ac.jp'];

/**
 * メールアドレスのドメインが許可されているか確認
 */
export function isAllowedDomain(email: string): boolean {
  const domain = email.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
}

/**
 * Googleでサインイン
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      skipBrowserRedirect: false,
      // PKCEフローを使用（codeパラメータを受け取る）
      flowType: 'pkce',
    },
  });

  if (error) {
    console.error('Google sign in error:', error);
    throw error;
  }

  return data;
}

/**
 * サインアウト
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Get user error:', error);
    return null;
  }

  return user;
}

/**
 * 認証状態の変更を監視
 */
export function onAuthStateChange(
  callback: (
    event: string,
    session: {
      access_token: string;
      refresh_token?: string;
      user?: unknown;
    } | null
  ) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
