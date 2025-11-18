import TeacherLayout from '@/components/teacher/TeacherLayout';
import WeeklyTrendChart from '@/components/teacher/WeeklyTrendChart';
import {
  getCurrentTeacher,
  getTeacherAnalytics,
} from '@/lib/services/teacherService';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  // 現在の講師情報を取得
  const teacher = await getCurrentTeacher();

  if (!teacher) {
    redirect('/auth/login');
  }

  // アナリティクスデータを取得
  const analytics = await getTeacherAnalytics(teacher.id);

  return (
    <TeacherLayout teacherName={teacher.name}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 統計分析</h1>
          <p className="text-sm text-gray-600 mt-1">
            直近30日間のクラス全体の練習状況を分析
          </p>
        </div>

        {/* 主要指標サマリー */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">総生徒数</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {analytics.summary.total_students}名
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">アクティブ率</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {Math.round(analytics.summary.active_rate * 100)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">過去3日以内に練習</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">平均スコア</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {analytics.summary.average_score.toFixed(1)}点
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">総練習回数</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {analytics.summary.total_practices}回
            </p>
            <p className="text-xs text-gray-500 mt-1">直近30日間</p>
          </div>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-2 gap-6">
          {/* 週別練習推移 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📈 週別練習回数推移
            </h2>
            <WeeklyTrendChart data={analytics.weekly_trend} />
          </div>

          {/* 要注意・停滞生徒 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                ⚠️ 要注意・停滞生徒
              </h2>
              <span className="text-sm text-gray-500">
                {analytics.at_risk_students.length}名
              </span>
            </div>
            {analytics.at_risk_students.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                要注意生徒はいません
              </p>
            ) : (
              <div className="space-y-2">
                {analytics.at_risk_students.slice(0, 5).map((student) => (
                  <Link
                    key={student.student_id}
                    href={`/teacher/students/${student.student_id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.student_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          平均: {student.average_score.toFixed(1)}点
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {student.days_since_last_practice}日前
                        </p>
                        <p className="text-xs text-gray-500">最終練習</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-2 gap-6">
          {/* トップパフォーマー */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                🏆 トップパフォーマー（今週）
              </h2>
            </div>
            {analytics.top_performers.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                今週の練習データがありません
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.top_performers.map((student, index) => (
                  <Link
                    key={student.student_id}
                    href={`/teacher/students/${student.student_id}`}
                    className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                            ? 'bg-gray-200 text-gray-700'
                            : index === 2
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {student.student_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {student.practice_count}回 ・ 平均
                        {student.average_score.toFixed(1)}点
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* カテゴリ別難易度分析 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                📂 カテゴリ別難易度
              </h2>
            </div>
            {analytics.category_difficulty.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                カテゴリデータがありません
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.category_difficulty.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {cat.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {cat.average_score.toFixed(1)}点（{cat.practice_count}
                          回）
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            cat.difficulty === 'easy'
                              ? 'bg-green-100 text-green-700'
                              : cat.difficulty === 'medium'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {cat.difficulty === 'easy'
                            ? '簡単'
                            : cat.difficulty === 'medium'
                              ? '普通'
                              : '難しい'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          cat.difficulty === 'easy'
                            ? 'bg-green-500'
                            : cat.difficulty === 'medium'
                              ? 'bg-blue-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${cat.average_score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
