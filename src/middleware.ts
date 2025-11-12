import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('[Middleware] パス:', request.nextUrl.pathname);
  console.log('[Middleware] Full URL:', request.url);
  console.log('[Middleware] Search params:', Object.fromEntries(request.nextUrl.searchParams));
  console.log(
    '[Middleware] リクエストCookie数:',
    request.cookies.getAll().length
  );

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          console.log('[Middleware] getAll呼び出し:', cookies.length);
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log('[Middleware] setAll呼び出し:', cookiesToSet.length);
          cookiesToSet.forEach(({ name, value }) => {
            console.log('[Middleware] Cookie設定:', name);
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: セッションをリフレッシュして、認証状態を維持
  // これにより、Server ComponentsでもCookieが読み取れるようになる
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('[Middleware] User:', user ? user.email : 'なし');

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのリクエストパスにマッチ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
