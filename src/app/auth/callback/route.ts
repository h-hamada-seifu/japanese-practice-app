import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { isAllowedDomain } from '@/lib/supabase/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Componentからの呼び出しの場合は無視
            }
          },
        },
      }
    );

    // OAuth認証コードをセッションに交換
    const { error } = await supabase.auth.exchangeCodeForSession(code);

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
