import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentTeacherId } from '@/lib/services/teacherService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/practices/[speech_id]
 * 練習詳細情報を取得（音声URL、文字起こし、フィードバック、講師メモ含む）
 */
export async function GET(
  request: Request,
  { params }: { params: { speech_id: string } }
) {
  try {
    const speechId = params.speech_id;

    if (!speechId) {
      return NextResponse.json(
        { error: '練習IDが指定されていません' },
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

    // 練習データを取得
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: speech, error: speechError } = await (supabase as any)
      .from('speeches')
      .select(
        `
        *,
        topics (
          id,
          category,
          title,
          description
        ),
        users (
          id,
          email,
          display_name
        )
      `
      )
      .eq('id', speechId)
      .single();

    if (speechError || !speech) {
      return NextResponse.json(
        { error: '練習データが見つかりません' },
        { status: 404 }
      );
    }

    // 講師が担当するクラスの生徒かチェック
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: studentClasses } = await (supabase as any)
      .from('student_class_assignments')
      .select('class_id')
      .eq('student_id', speech.user_id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teacherClasses } = await (supabase as any)
      .from('teacher_class_assignments')
      .select('class_id')
      .eq('teacher_id', teacherId);

    const studentClassIds =
      studentClasses?.map((sc: { class_id: string }) => sc.class_id) || [];
    const teacherClassIds =
      teacherClasses?.map((tc: { class_id: string }) => tc.class_id) || [];

    const hasAccess = studentClassIds.some((id: string) =>
      teacherClassIds.includes(id)
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'この練習へのアクセス権限がありません' },
        { status: 403 }
      );
    }

    // 音声ファイルの署名付きURLを生成（1時間有効）
    let audioUrl = null;
    if (speech.audio_url) {
      const { data: signedUrlData } = await supabase.storage
        .from('speech-audio')
        .createSignedUrl(speech.audio_url, 3600);

      audioUrl = signedUrlData?.signedUrl || null;
    }

    // 講師メモを取得
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: teacherNote } = await (supabase as any)
      .from('teacher_notes')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('speech_id', speechId)
      .maybeSingle();

    return NextResponse.json({
      practice: {
        ...speech,
        audio_url: audioUrl,
      },
      teacher_note: teacherNote || null,
    });
  } catch (error) {
    console.error('[API] /api/teacher/practices/[speech_id] エラー:', error);
    return NextResponse.json(
      { error: '練習詳細情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
