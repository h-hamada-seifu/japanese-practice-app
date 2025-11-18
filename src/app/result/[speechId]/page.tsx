'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { SpeechesRow } from '@/types/database';
import { Feedback } from '@/types';
import ScoreCard from '@/components/FeedbackDisplay/ScoreCard';
import FeedbackList from '@/components/FeedbackDisplay/FeedbackList';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const speechId = params.speechId as string;

  const [speech, setSpeech] = useState<SpeechesRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchSpeech = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('ログインが必要です。');
          return;
        }

        // Fetch speech data
        const { data, error: fetchError } = await supabase
          .from('speeches')
          .select('*')
          .eq('id', speechId)
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setError('指定された発話記録が見つかりませんでした。');
          return;
        }

        setSpeech(data);
      } catch (err) {
        console.error('発話記録取得エラー:', err);
        setError('発話記録の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    if (speechId) {
      fetchSpeech();
    }
  }, [speechId]);

  const handleBackToTopics = () => {
    router.push('/topics');
  };

  const handleRetry = () => {
    if (speech) {
      router.push(`/record/${speech.topic_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">結果を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error || !speech) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">エラー</h1>
          <p className="text-gray-600 mb-6">
            {error || '発話記録が見つかりませんでした。'}
          </p>
          <button
            onClick={handleBackToTopics}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            話題一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const feedback = speech.feedback as unknown as Feedback;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={handleBackToTopics}
            className="flex items-center text-blue-500 hover:text-blue-600 mb-4 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            話題一覧に戻る
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">結果</h1>
          <p className="text-gray-600">話題: {speech.topic_title}</p>
        </div>

        {/* スコアカード */}
        <div className="mb-6">
          <ScoreCard score={feedback.score} />
        </div>

        {/* 音声再生 */}
        {speech.audio_url && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">🔊</span>
              録音を聞き直す:
            </h3>
            <audio
              ref={audioRef}
              controls
              className="w-full"
              src={speech.audio_url}
            >
              お使いのブラウザは音声再生に対応していません。
            </audio>
          </div>
        )}

        {/* フィードバックリスト */}
        <FeedbackList
          feedback={feedback}
          transcription={speech.transcription}
        />

        {/* アクションボタン */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleRetry}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            もう一度録音
          </button>
          <button
            onClick={handleBackToTopics}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
          >
            別の話題を選ぶ
          </button>
        </div>

        {/* 録音時間情報 */}
        {speech.duration && (
          <div className="mt-6 text-center text-sm text-gray-500">
            録音時間: {Math.floor(speech.duration / 60)}分{speech.duration % 60}
            秒
          </div>
        )}
      </div>
    </div>
  );
}
