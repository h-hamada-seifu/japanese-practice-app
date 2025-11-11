'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { TopicsRow } from '@/types/database';
import { Recorder } from '@/components/AudioRecorder/Recorder';

export default function RecordPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<TopicsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordingComplete, setRecordingComplete] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('topics')
          .select('*')
          .eq('id', topicId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setError('指定された話題が見つかりませんでした。');
          return;
        }

        setTopic(data);
      } catch (err) {
        console.error('トピック取得エラー:', err);
        setError('話題の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      fetchTopic();
    }
  }, [topicId]);

  const handleRecordingComplete = (blob: Blob, url: string) => {
    console.log('録音完了:', {
      size: blob.size,
      type: blob.type,
      url,
    });
    setRecordingComplete(true);

    // TODO: 将来的にSupabase Storageにアップロードする処理を追加
    // 現在はローカルでのプレビューのみ
  };

  const handleBackToTopics = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">話題を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
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
            {error || '話題が見つかりませんでした。'}
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

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:py-8">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={handleBackToTopics}
            className="flex items-center text-blue-500 hover:text-blue-600 mb-4 transition-colors active:text-blue-700"
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

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {topic.title}
            </h1>
            {topic.description && (
              <p className="text-sm sm:text-base text-gray-600 mb-3">
                {topic.description}
              </p>
            )}
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded-full">
              対象レベル: {topic.target_level}
            </span>
          </div>
        </div>

        {/* 録音コンポーネント */}
        <Recorder
          onRecordingComplete={handleRecordingComplete}
          maxDuration={180}
        />

        {/* 録音完了メッセージ */}
        {recordingComplete && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mt-0.5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-green-800 font-medium">
                  録音が完了しました！
                </p>
                <p className="text-green-700 text-sm mt-1">
                  録音した音声は上のプレーヤーで確認できます。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 使い方のヒント */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-900 font-medium mb-2 text-sm sm:text-base">
            📝 録音のヒント
          </h3>
          <ul className="text-blue-800 text-xs sm:text-sm space-y-1 list-disc list-inside">
            <li>録音開始前に、マイクへのアクセス許可が求められます</li>
            <li>静かな環境で録音することをお勧めします</li>
            <li>録音中は一時停止・再開が可能です</li>
            <li>最大録音時間は3分です</li>
            <li>録音完了後、プレビューで内容を確認できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
