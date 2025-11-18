import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentTeacherId } from '@/lib/services/teacherService';

export const dynamic = 'force-dynamic';

/**
 * POST /api/teacher/notes
 * 講師メモを保存または更新
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, speech_id, note } = body;

    if (!student_id || !speech_id || !note) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const teacherId = await getCurrentTeacherId();

    if (!teacherId) {
      return NextResponse.json(
        { error: '講師情報が見つかりません' },
        { status: 404 }
      );
    }

    // 既存のメモをチェック
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingNote } = await (supabase as any)
      .from('teacher_notes')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('speech_id', speech_id)
      .maybeSingle();

    if (existingNote) {
      // 更新
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('teacher_notes')
        .update({
          note,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingNote.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        note_id: data.id,
        message: 'メモを更新しました',
      });
    } else {
      // 新規作成
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('teacher_notes')
        .insert({
          teacher_id: teacherId,
          student_id,
          speech_id,
          note,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        note_id: data.id,
        message: 'メモを保存しました',
      });
    }
  } catch (error) {
    console.error('[API] /api/teacher/notes エラー:', error);
    return NextResponse.json(
      { error: 'メモの保存に失敗しました' },
      { status: 500 }
    );
  }
}
