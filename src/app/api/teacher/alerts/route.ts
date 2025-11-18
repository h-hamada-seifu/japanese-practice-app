import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentTeacherId } from '@/lib/services/teacherService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/alerts
 * 講師向けアラート一覧を取得
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

    const supabase = await createServerClient();

    // クエリパラメータから未読のみフィルタを取得
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('teacher_alerts')
      .select(
        `
        id,
        alert_type,
        message,
        is_read,
        created_at,
        student_id,
        users:student_id (
          id,
          display_name,
          email
        )
      `
      )
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: alerts, error } = await query;

    if (error) {
      throw error;
    }

    // フォーマットを整形
    const formattedAlerts = alerts?.map(
      (alert: {
        id: string;
        student_id: string;
        users: { id: string; display_name: string | null; email: string };
        alert_type: string;
        message: string;
        is_read: boolean;
        created_at: string;
      }) => ({
        id: alert.id,
        student_id: alert.student_id,
        student_name:
          alert.users?.display_name ||
          alert.users?.email?.split('@')[0] ||
          '不明',
        alert_type: alert.alert_type,
        message: alert.message,
        is_read: alert.is_read,
        created_at: alert.created_at,
      })
    );

    return NextResponse.json({ alerts: formattedAlerts || [] });
  } catch (error) {
    console.error('[API] /api/teacher/alerts エラー:', error);
    return NextResponse.json(
      { error: 'アラートの取得に失敗しました' },
      { status: 500 }
    );
  }
}
