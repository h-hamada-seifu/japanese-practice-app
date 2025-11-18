import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getUserStreak } from '@/lib/services/streakService';
import { getDashboardStats } from '@/lib/services/dashboardService';
import DashboardNav from '@/components/Dashboard/DashboardNav';
import StreakDisplay from '@/components/Dashboard/StreakDisplay';
import StatsCards from '@/components/Dashboard/StatsCards';
import ScoreChart from '@/components/Dashboard/ScoreChart';
import CategoryStats from '@/components/Dashboard/CategoryStats';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const supabase = createServerClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // ストリークデータと統計データを並行取得
  const [streak, stats] = await Promise.all([
    getUserStreak(user.id),
    getDashboardStats(user.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav userEmail={user.email || null} />

      <main className="max-w-6xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ダッシュボード
          </h2>
          <p className="text-gray-600 text-sm">
            あなたの学習状況を確認しましょう
          </p>
        </div>

        <div className="space-y-6">
          {/* ストリーク表示 */}
          <StreakDisplay streak={streak} />

          {/* 統計カード */}
          <StatsCards stats={stats} />

          {/* スコアグラフ */}
          {stats.totalPractices > 0 && <ScoreChart data={stats.recentScores} />}

          {/* カテゴリ別統計 */}
          {stats.categoryStats.length > 0 && (
            <CategoryStats categoryStats={stats.categoryStats} />
          )}

          {/* アクションボタン */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/topics"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 shadow-sm transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">話題を選んで練習</h3>
                  <p className="text-sm text-blue-100">
                    15種類の話題から選べます
                  </p>
                </div>
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>

            <Link
              href="/history"
              className="block w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg p-6 shadow-sm transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">発話履歴</h3>
                  <p className="text-sm text-gray-600">
                    これまでの練習記録を確認
                  </p>
                </div>
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          </div>

          {/* 初回ユーザー向けメッセージ */}
          {stats.totalPractices === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                👋 ようこそ！
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                まだ練習記録がありません。「話題を選んで練習」から始めましょう！
              </p>
              <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                <li>15種類の話題から選んで練習できます</li>
                <li>AIが自動で発音を評価してフィードバックします</li>
                <li>毎日練習するとストリーク記録が伸びます</li>
                <li>継続することでスコアが向上します</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
