import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { SpeechesRow } from '@/types/database';
import SpeechList from '@/components/History/SpeechList';
import Link from 'next/link';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

async function getUserSpeeches(): Promise<SpeechesRow[]> {
  const supabase = createServerClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // 発話履歴を取得
  const { data, error } = await supabase
    .from('speeches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching speeches:', error);
    return [];
  }

  return data || [];
}

export default async function HistoryPage() {
  const speeches = await getUserSpeeches();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              発話履歴
            </h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-center sm:text-left"
            >
              ダッシュボードへ戻る
            </Link>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            これまでの発話練習の記録を確認できます。
          </p>
        </div>

        {/* 発話リスト */}
        {speeches.length > 0 ? (
          <SpeechList speeches={speeches} />
        ) : (
          <div className="bg-white p-8 sm:p-12 rounded-lg border border-gray-200 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              発話履歴がありません
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              話題を選択して発話練習を始めましょう。
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              話題を選ぶ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
