import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { isAllowedDomain } from '@/lib/supabase/auth';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const supabase = createRouteHandlerClient(request);

  if (code) {
    // OAuth認証コードをセッションに交換
    await supabase.auth.exchangeCodeForSession(code);

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
  }

  // 認証成功後はダッシュボードにリダイレクト
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
