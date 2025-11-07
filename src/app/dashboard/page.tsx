'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/supabase/auth';

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
      } else {
        setUserEmail(user.email || null);
      }
    } catch (error) {
      console.error('User check error:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                日本語練習アプリ
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{userEmail}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                サインアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ダッシュボード
            </h2>
            <p className="text-gray-600 mb-6">
              ようこそ！今後、ここに話題選択や会話練習機能が実装されます。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                認証成功
              </h3>
              <p className="text-sm text-blue-700">
                あなたのアカウント（{userEmail}
                ）で正常にサインインしました。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
