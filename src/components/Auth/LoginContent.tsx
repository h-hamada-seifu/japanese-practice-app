'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SignInButton from './SignInButton';
import { getCurrentUser } from '@/lib/supabase/auth';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const [domainError, setDomainError] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        // すでに認証済みの場合はダッシュボードにリダイレクト
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsChecking(false);
    }
  }, [router]);

  useEffect(() => {
    // エラーパラメータをチェック
    const error = searchParams.get('error');
    if (error === 'domain_not_allowed') {
      setDomainError(true);
    }

    // すでに認証済みかチェック
    checkAuth();
  }, [searchParams, checkAuth]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-8 py-12 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            日本語練習アプリ
          </h1>
          <p className="text-gray-600">
            話題に基づいた日本語の会話練習をサポートします
          </p>
        </div>

        {domainError && (
          <div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <p className="text-sm text-red-800">
              申し訳ございません。このアプリは @i-seifu.jp または @i-seifu.ac.jp
              のドメインのアカウントのみご利用いただけます。
            </p>
          </div>
        )}

        <div className="mb-6">
          <SignInButton />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>サインインすることで、利用規約に同意したものとみなされます。</p>
          <p className="mt-2">対象ドメイン: @i-seifu.jp, @i-seifu.ac.jp</p>
        </div>
      </div>
    </div>
  );
}
