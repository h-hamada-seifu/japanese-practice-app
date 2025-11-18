import { NextResponse } from 'next/server';
import {
  getCurrentTeacherId,
  getAllTeacherStudents,
} from '@/lib/services/teacherService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/students?class_id=[optional]
 * 全担当生徒一覧を取得（クラスフィルタ可能）
 */
export async function GET(request: Request) {
  try {
    // 現在のログイン講師のIDを取得
    const teacherId = await getCurrentTeacherId();

    if (!teacherId) {
      return NextResponse.json(
        { error: '講師情報が見つかりません' },
        { status: 404 }
      );
    }

    // クエリパラメータからclass_idを取得
    const { searchParams } = new URL(request.url);
    const classIdFilter = searchParams.get('class_id') || undefined;

    // 全担当生徒一覧を取得
    const result = await getAllTeacherStudents(teacherId, classIdFilter);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] /api/teacher/students エラー:', error);
    return NextResponse.json(
      { error: '生徒一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
