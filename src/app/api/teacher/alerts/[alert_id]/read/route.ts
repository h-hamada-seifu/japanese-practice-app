import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentTeacherId } from '@/lib/services/teacherService';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/teacher/alerts/[alert_id]/read
 * アラートを既読にする
 */
export async function PATCH(
  request: Request,
  { params }: { params: { alert_id: string } }
) {
  try {
    const alertId = params.alert_id;

    if (!alertId) {
      return NextResponse.json(
        { error: 'アラートIDが指定されていません' },
        { status: 400 }
      );
    }

    const teacherId = await getCurrentTeacherId();

    if (!teacherId) {
      return NextResponse.json(
        { error: '講師情報が見つかりません' },
        { status: 404 }
      );
    }

    const supabase = await createServerClient();

    // アラートが講師のものか確認し、既読にする
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('teacher_alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .eq('teacher_id', teacherId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] /api/teacher/alerts/[alert_id]/read エラー:', error);
    return NextResponse.json(
      { error: 'アラートの更新に失敗しました' },
      { status: 500 }
    );
  }
}
