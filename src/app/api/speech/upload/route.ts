import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { transcribeAudio } from '@/lib/services/speechToText';
import { generateFeedback } from '@/lib/services/feedbackGenerator';
import { randomUUID } from 'crypto';
import { Json } from '@/types/database';
import { cookies } from 'next/headers';
import { updateStreak } from '@/lib/services/streakService';

/**
 * POST /api/speech/upload
 * 音声ファイルをアップロードし、文字起こしとフィードバック生成を行う
 */
export async function POST(request: NextRequest) {
  try {
    // Supabaseクライアントの初期化
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // middlewareで管理されるため無視
            }
          },
        },
      }
    );

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in' },
        { status: 401 }
      );
    }

    // FormDataの取得
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const topicId = formData.get('topicId') as string | null;
    const topicTitle = formData.get('topicTitle') as string | null;
    const durationStr = formData.get('duration') as string | null;

    // バリデーション
    if (!audioFile || !topicId || !topicTitle || !durationStr) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: audio, topicId, topicTitle, duration',
        },
        { status: 400 }
      );
    }

    const duration = parseInt(durationStr, 10);
    if (isNaN(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration value' },
        { status: 400 }
      );
    }

    // 音声ファイルをBufferに変換
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // 1. Supabase Storageに音声ファイルを保存
    const speechId = randomUUID();
    const storageFilePath = `speeches/${user.id}/${speechId}.webm`;

    const { error: uploadError } = await supabase.storage
      .from('speech-audio')
      .upload(storageFilePath, audioBuffer, {
        contentType: 'audio/webm',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload audio file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // ストレージURLの取得
    const {
      data: { publicUrl },
    } = supabase.storage.from('speech-audio').getPublicUrl(storageFilePath);

    // 2. Google Speech-to-Text APIで文字起こし
    let transcription: string;
    try {
      transcription = await transcribeAudio(audioBuffer);
    } catch (error) {
      console.error('Transcription error:', error);
      return NextResponse.json(
        {
          error: `Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        { status: 500 }
      );
    }

    // 3. Gemini APIでフィードバック生成
    let feedback;
    try {
      feedback = await generateFeedback(transcription, topicTitle);
    } catch (error) {
      console.error('Feedback generation error:', error);
      return NextResponse.json(
        {
          error: `Failed to generate feedback: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        { status: 500 }
      );
    }

    // 4. Supabase DBに保存
    const { data: speechRecord, error: dbError } =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('speeches') as any)
        .insert({
          id: speechId,
          user_id: user.id,
          topic_id: topicId,
          topic_title: topicTitle,
          audio_url: publicUrl,
          transcription,
          feedback: feedback as unknown as Json,
          duration,
        })
        .select()
        .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return NextResponse.json(
        { error: `Failed to save speech record: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 5. ストリークを更新
    try {
      await updateStreak(user.id);
    } catch (error) {
      // ストリーク更新のエラーは致命的ではないのでログのみ
      console.error('Streak update error:', error);
    }

    // 6. レスポンスを返す
    return NextResponse.json(
      {
        speechId: speechRecord.id,
        audioUrl: speechRecord.audio_url,
        transcription: speechRecord.transcription,
        feedback: speechRecord.feedback,
        duration: speechRecord.duration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in /api/speech/upload:', error);
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
