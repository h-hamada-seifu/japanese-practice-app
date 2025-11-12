'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { TopicsRow } from '@/types/database';
import { Recorder } from '@/components/AudioRecorder/Recorder';
import { Feedback } from '@/types';

export default function RecordPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<TopicsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleRecordingComplete = async (
    blob: Blob,
    url: string,
    duration: number
  ) => {
    console.log('録音完了:', {
      size: blob.size,
      type: blob.type,
      url,
      duration,
    });

    setRecordingComplete(true);
    setUploadError(null);
    setTranscription(null);
    setFeedback(null);

    // 自動的にアップロード処理を開始
    try {
      setUploading(true);

      // FormDataを作成
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('topicId', topicId);
      formData.append('topicTitle', topic?.title || '');
      formData.append('duration', duration.toString());

      // APIにアップロード
      const response = await fetch('/api/speech/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'アップロードに失敗しました');
      }

      setUploading(false);
      setAnalyzing(true);

      const result = await response.json();

      // 解析完了
      setAnalyzing(false);
      setTranscription(result.transcription);
      setFeedback(result.feedback);

      console.log('解析完了:', result);
    } catch (err) {
      console.error('アップロードエラー:', err);
      setUploadError(
        err instanceof Error ? err.message : 'アップロードに失敗しました'
      );
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleBackToTopics = () => {
    router.push('/');
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
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

        {/* アップロード中の表示 */}
        {uploading && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
              <p className="text-blue-800 font-medium">
                音声をアップロードしています...
              </p>
            </div>
          </div>
        )}

        {/* 解析中の表示 */}
        {analyzing && (
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500 mr-3"></div>
              <div>
                <p className="text-purple-800 font-medium">
                  音声を解析しています...
                </p>
                <p className="text-purple-700 text-sm mt-1">
                  文字起こしとAI添削を行っています
                </p>
              </div>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {uploadError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500 mt-0.5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-red-800 font-medium">エラーが発生しました</p>
                <p className="text-red-700 text-sm mt-1">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {/* フィードバック表示 */}
        {transcription && feedback && (
          <div className="mt-6 space-y-4">
            {/* スコア表示 */}
            <div
              className={`p-4 border rounded-lg ${getScoreBgColor(feedback.score)}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">総合スコア</span>
                <span
                  className={`text-3xl font-bold ${getScoreColor(feedback.score)}`}
                >
                  {feedback.score}点
                </span>
              </div>
            </div>

            {/* 文字起こし結果 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-2">
                あなたが話した内容
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {transcription}
              </p>
            </div>

            {/* 良い点 */}
            {feedback.goodPoints.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  良い点
                </h3>
                <ul className="list-disc list-inside text-green-800 space-y-1">
                  {feedback.goodPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 改善点 */}
            {feedback.improvements.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-900 mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  改善点
                </h3>
                <ul className="list-disc list-inside text-yellow-800 space-y-1">
                  {feedback.improvements.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 添削例 */}
            {feedback.correctedText && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  添削例
                </h3>
                <p className="text-blue-800 whitespace-pre-wrap">
                  {feedback.correctedText}
                </p>
              </div>
            )}

            {/* 履歴ページへのリンク */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/history')}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                履歴ページで全ての録音を確認
              </button>
            </div>
          </div>
        )}

        {/* 録音完了メッセージ（フィードバックがない場合のみ表示） */}
        {recordingComplete && !transcription && !uploading && !analyzing && (
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
            <li>
              録音完了後、自動的に文字起こしとAI添削が行われます（30秒〜1分程度）
            </li>
            <li>
              はっきりと発音すると、より正確な文字起こしとフィードバックが得られます
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
