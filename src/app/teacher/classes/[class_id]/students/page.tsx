import TeacherLayout from '@/components/teacher/TeacherLayout';
import ExportCSVButton from '@/components/teacher/ExportCSVButton';
import {
  getCurrentTeacher,
  getClassStudents,
} from '@/lib/services/teacherService';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: {
    class_id: string;
  };
}

export default async function ClassStudentsPage({ params }: Props) {
  // 現在の講師情報を取得
  const teacher = await getCurrentTeacher();

  if (!teacher) {
    redirect('/auth/login');
  }

  // クラスの生徒一覧を取得
  const {
    class: classInfo,
    students,
    summary,
  } = await getClassStudents(params.class_id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { text: '✅ アクティブ', color: 'bg-green-100 text-green-800' };
      case 'warning':
        return { text: '⚠️ 要注意', color: 'bg-yellow-100 text-yellow-800' };
      case 'inactive':
        return { text: '🔴 停滞', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '練習なし';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `今日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `昨日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${diffDays}日前`;
    }
  };

  return (
    <TeacherLayout teacherName={teacher.name}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Link href="/teacher/classes" className="hover:text-blue-600">
                担当クラス
              </Link>
              <span>›</span>
              <span>{classInfo.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {classInfo.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {classInfo.code && `コード: ${classInfo.code}`}
            </p>
          </div>
          <ExportCSVButton students={students} className={classInfo.name} />
        </div>

        {/* クラス概要 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📊 クラス概要
          </h2>
          <div className="grid grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">登録生徒数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.total_students}名
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">アクティブ</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {summary.active_students}名
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {summary.total_students > 0
                  ? Math.round(
                      (summary.active_students / summary.total_students) * 100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">要注意</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {summary.warning_students}名
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {summary.total_students > 0
                  ? Math.round(
                      (summary.warning_students / summary.total_students) * 100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">停滞</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {summary.inactive_students}名
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {summary.total_students > 0
                  ? Math.round(
                      (summary.inactive_students / summary.total_students) * 100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">平均スコア</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {summary.class_average_score.toFixed(1)}点
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">今週総練習</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {summary.this_week_total_practices}回
              </p>
            </div>
          </div>
        </div>

        {/* 生徒一覧 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              👥 生徒一覧（{students.length}名）
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="🔍 検索: 名前・メール"
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                <option>すべて</option>
                <option>アクティブのみ</option>
                <option>要注意のみ</option>
                <option>停滞のみ</option>
              </select>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              このクラスに生徒がいません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ストリーク
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      今週練習
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      今月練習
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      総練習回数
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平均スコア
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最高スコア
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最終練習日
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => {
                    const statusBadge = getStatusBadge(student.status);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/teacher/students/${student.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {student.display_name ||
                              student.email.split('@')[0]}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium">
                            {student.current_streak > 0 ? (
                              <>🔥 {student.current_streak}日</>
                            ) : (
                              <span className="text-gray-400">0日</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          {student.this_week_practices}回
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          {student.this_month_practices}回
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          {student.total_practices}回
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${
                              student.average_score >= 80
                                ? 'bg-green-100 text-green-800'
                                : student.average_score >= 60
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {student.average_score.toFixed(1)}点
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          {student.best_score}点
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(student.last_practice_date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
