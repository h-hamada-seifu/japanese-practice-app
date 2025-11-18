import TeacherLayout from '@/components/teacher/TeacherLayout';
import {
  getCurrentTeacher,
  getTeacherClasses,
} from '@/lib/services/teacherService';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TeacherClassesPage() {
  // 現在の講師情報を取得
  const teacher = await getCurrentTeacher();

  if (!teacher) {
    redirect('/auth/login');
  }

  // 担当クラス一覧を取得
  const classes = await getTeacherClasses(teacher.id);

  return (
    <TeacherLayout teacherName={teacher.name}>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">担当クラス一覧</h1>
            <p className="text-sm text-gray-600 mt-1">
              あなたが担当している{classes.length}件のクラス
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ➕ 新規クラス作成
          </button>
        </div>

        {/* クラス一覧テーブル */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">担当クラスがありません</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クラス名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    コード
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    生徒数
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平均スコア
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    今週練習数
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.map((classInfo) => (
                  <tr key={classInfo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {classInfo.name}
                        </p>
                        {classInfo.description && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {classInfo.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {classInfo.code || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {classInfo.student_count}名
                        </p>
                        <p className="text-xs text-gray-500">
                          アクティブ: {classInfo.active_student_count}名
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          classInfo.average_score >= 80
                            ? 'bg-green-100 text-green-800'
                            : classInfo.average_score >= 60
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {classInfo.average_score.toFixed(1)}点
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {classInfo.this_week_practices}回
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/teacher/classes/${classInfo.id}/students`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
