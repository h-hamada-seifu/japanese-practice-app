import { NextResponse } from 'next/server';
import {
  getCurrentTeacherId,
  getTeacherClasses,
} from '@/lib/services/teacherService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/classes
 * 講師が担当するクラス一覧を取得
 */
export async function GET() {
  try {
    // 現在のログイン講師のIDを取得
    const teacherId = await getCurrentTeacherId();

    if (!teacherId) {
      return NextResponse.json(
        { error: '講師情報が見つかりません' },
        { status: 404 }
      );
    }

    // 担当クラス一覧を取得
    const classes = await getTeacherClasses(teacherId);

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('[API] /api/teacher/classes エラー:', error);
    return NextResponse.json(
      { error: 'クラス一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
