import TeacherLayout from '@/components/teacher/TeacherLayout';
import StudentDetailClient from '@/components/teacher/StudentDetailClient';
import {
  getCurrentTeacher,
  getStudentDetails,
} from '@/lib/services/teacherService';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: {
    student_id: string;
  };
}

export default async function StudentDetailPage({ params }: Props) {
  // 現在の講師情報を取得
  const teacher = await getCurrentTeacher();

  if (!teacher) {
    redirect('/auth/login');
  }

  // 生徒詳細情報を取得
  const { student, stats, recent_practices, score_trend } =
    await getStudentDetails(params.student_id);

  return (
    <TeacherLayout teacherName={teacher.name}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Link href="/teacher/students" className="hover:text-blue-600">
                全生徒一覧
              </Link>
              <span>›</span>
              <span>{student.display_name || student.email.split('@')[0]}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              👤 {student.display_name || student.email.split('@')[0]}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{student.email}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              ← 一覧に戻る
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              PDF出力
            </button>
          </div>
        </div>

        {/* 基本統計 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📊 基本統計
          </h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">🔥 ストリーク</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {stats.current_streak}日連続
              </p>
              <p className="text-xs text-gray-500 mt-1">
                最長: {stats.longest_streak}日
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">📊 総練習回数</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.total_practices}回
              </p>
              <p className="text-xs text-gray-500 mt-1">
                総時間: {stats.total_duration_minutes}分
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">⭐ 平均スコア</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.average_score.toFixed(1)}点
              </p>
              <p className="text-xs text-gray-500 mt-1">
                最高: {stats.best_score}点
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">📅 最終練習</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">今日</p>
              <p className="text-xs text-gray-500 mt-1">
                登録: {new Date(student.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-12 gap-6">
          {/* 左カラム（統計・グラフ） */}
          <div className="col-span-7 space-y-6">
            {/* スコア推移 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📈 スコア推移（直近30日）
              </h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">
                  グラフ: Chart.js実装予定（{score_trend.length}件のデータ）
                </p>
              </div>
            </div>

            {/* カテゴリ別パフォーマンス */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 カテゴリ別パフォーマンス
              </h3>
              <div className="space-y-3">
                {stats.category_stats.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {cat.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        {cat.average_score.toFixed(1)}点（{cat.practice_count}
                        回）
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          cat.average_score >= 80
                            ? 'bg-green-500'
                            : cat.average_score >= 60
                              ? 'bg-blue-500'
                              : cat.average_score >= 40
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${cat.average_score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 週次・月次統計 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 週次・月次統計
              </h3>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      期間
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                      練習数
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                      比較
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">今週</td>
                    <td className="px-4 py-3 text-center text-sm font-medium">
                      {stats.this_week_practices}回
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {stats.this_week_practices >=
                      stats.last_week_practices ? (
                        <span className="text-green-600">
                          +
                          {stats.this_week_practices -
                            stats.last_week_practices}
                          回
                        </span>
                      ) : (
                        <span className="text-red-600">
                          {stats.this_week_practices -
                            stats.last_week_practices}
                          回
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">先週</td>
                    <td className="px-4 py-3 text-center text-sm font-medium">
                      {stats.last_week_practices}回
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-400">
                      -
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">今月</td>
                    <td className="px-4 py-3 text-center text-sm font-medium">
                      {stats.this_month_practices}回
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {stats.this_month_practices >=
                      stats.last_month_practices ? (
                        <span className="text-green-600">
                          +
                          {stats.this_month_practices -
                            stats.last_month_practices}
                          回
                        </span>
                      ) : (
                        <span className="text-red-600">
                          {stats.this_month_practices -
                            stats.last_month_practices}
                          回
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">先月</td>
                    <td className="px-4 py-3 text-center text-sm font-medium">
                      {stats.last_month_practices}回
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-400">
                      -
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 右カラム（練習履歴） - クライアントコンポーネント */}
          <StudentDetailClient
            studentId={params.student_id}
            student={student}
            stats={stats}
            recent_practices={recent_practices}
          />
        </div>
      </div>
    </TeacherLayout>
  );
}
