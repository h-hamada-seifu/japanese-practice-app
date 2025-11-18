import { NextResponse } from 'next/server';
import {
  getCurrentTeacherId,
  getTeacherAnalytics,
} from '@/lib/services/teacherService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/analytics
 * 講師のアナリティクスデータを取得
 */
export async function GET(request: Request) {
  try {
    const teacherId = await getCurrentTeacherId();

    if (!teacherId) {
      return NextResponse.json(
        { error: '講師情報が見つかりません' },
        { status: 404 }
      );
    }

    // クエリパラメータから期間を取得（デフォルト30日）
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30', 10);

    // アナリティクスデータを取得
    const analytics = await getTeacherAnalytics(teacherId, period);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('[API] /api/teacher/analytics エラー:', error);
    return NextResponse.json(
      { error: 'アナリティクスデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}
