import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { isAllowedDomain } from '@/lib/supabase/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('[Auth Callback] Code:', code ? 'あり' : 'なし');

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies = cookieStore.getAll();
            console.log('[Auth Callback] getAll:', cookies.length);
            return cookies;
          },
          setAll(cookiesToSet) {
            console.log('[Auth Callback] setAll:', cookiesToSet.length);
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                console.log('[Auth Callback] Cookie設定:', name);
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              console.error('[Auth Callback] Cookie設定エラー:', error);
            }
          },
        },
      }
    );

    // OAuth認証コードをセッションに交換
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    console.log(
      '[Auth Callback] exchangeCodeForSession:',
      error ? 'エラー' : '成功'
    );

    if (!error) {
      // ユーザー情報を取得してドメインチェック
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        if (!isAllowedDomain(user.email)) {
          // 許可されていないドメインの場合はサインアウト
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${requestUrl.origin}?error=domain_not_allowed`
          );
        }
      }

      // 認証成功後はダッシュボードにリダイレクト
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    }
  }

  // エラーまたはcodeなしの場合はトップページへ
  return NextResponse.redirect(requestUrl.origin);
}
