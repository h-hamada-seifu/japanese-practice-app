'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isAllowedDomain } from '@/lib/supabase/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let processed = false;

    // 認証状態の変化を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth Callback Page] Auth state change:', event);
      console.log('[Auth Callback Page] Session:', session ? 'exists' : 'null');

      if (processed) return;

      if (event === 'SIGNED_IN' && session?.user) {
        processed = true;
        console.log('[Auth Callback Page] User signed in:', session.user.email);

        // ドメインチェック
        if (!isAllowedDomain(session.user.email || '')) {
          console.log('[Auth Callback Page] Domain not allowed');
          await supabase.auth.signOut();
          router.push('/?error=domain_not_allowed');
          return;
        }

        // 認証成功 - ダッシュボードにリダイレクト
        console.log('[Auth Callback Page] Authentication successful, redirecting to dashboard');
        router.push('/dashboard');
      } else if (event === 'SIGNED_OUT' || (!session && event === 'INITIAL_SESSION')) {
        if (!processed) {
          processed = true;
          console.log('[Auth Callback Page] No session, redirecting to home');
          router.push('/');
        }
      }
    });

    // URLハッシュが存在する場合は、手動でセッション確認
    const checkHash = async () => {
      const hash = window.location.hash;
      console.log('[Auth Callback Page] URL hash:', hash);

      if (hash && hash.includes('access_token')) {
        console.log('[Auth Callback Page] Found access_token in hash, waiting for Supabase to process...');
        // Supabaseが処理するまで少し待つ
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && !processed) {
          processed = true;
          console.log('[Auth Callback Page] Session detected after hash processing');

          // ドメインチェック
          if (!isAllowedDomain(session.user.email || '')) {
            console.log('[Auth Callback Page] Domain not allowed');
            await supabase.auth.signOut();
            router.push('/?error=domain_not_allowed');
            return;
          }

          router.push('/dashboard');
        }
      }
    };

    checkHash();

    // クリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">トップページにリダイレクトします...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">認証処理中...</div>
    </div>
  );
}
