'use client';

import { useCallback, useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer';

interface PracticeDetailModalProps {
  speechId: string;
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PracticeData {
  practice: {
    id: string;
    topic_title: string;
    audio_url: string | null;
    transcription: string;
    feedback: {
      score?: number;
      goodPoints?: string[];
      improvements?: string[];
      correctedText?: string;
      detailedScores?: {
        fluency?: number;
        pronunciation?: number;
        vocabulary?: number;
        grammar?: number;
      };
    };
    duration: number | null;
    created_at: string;
    topics?: {
      category: string;
    };
  };
  teacher_note: {
    id: string;
    note: string;
    updated_at: string;
  } | null;
}

export default function PracticeDetailModal({
  speechId,
  studentId,
  isOpen,
  onClose,
}: PracticeDetailModalProps) {
  const [data, setData] = useState<PracticeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const fetchPracticeDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teacher/practices/${speechId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setNoteText(result.teacher_note?.note || '');
      } else {
        console.error('Failed to fetch practice detail');
      }
    } catch (error) {
      console.error('Error fetching practice detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [speechId]);

  useEffect(() => {
    if (isOpen && speechId) {
      fetchPracticeDetail();
    }
  }, [isOpen, speechId, fetchPracticeDetail]);

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      setSaveMessage('メモを入力してください');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/teacher/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          speech_id: speechId,
          note: noteText,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSaveMessage(result.message || 'メモを保存しました');
        setTimeout(() => setSaveMessage(''), 3000);
        await fetchPracticeDetail(); // データを再取得
      } else {
        setSaveMessage('メモの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveMessage('メモの保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* モーダルコンテンツ */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : data ? (
            <div className="p-6 space-y-6">
              {/* ヘッダー */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    🎧 {data.practice.topic_title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(data.practice.created_at)}
                  </p>
                  {data.practice.topics && (
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {data.practice.topics.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 総合スコア */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">⭐ 総合スコア</div>
                <div className="text-4xl font-bold text-blue-600">
                  {data.practice.feedback.score || 0}点
                </div>
              </div>

              {/* 音声プレイヤー */}
              {data.practice.audio_url && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🎤 録音データ
                  </h3>
                  <AudioPlayer
                    audioUrl={data.practice.audio_url}
                    duration={data.practice.duration || undefined}
                  />
                </div>
              )}

              {/* 文字起こし */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📝 文字起こし
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {data.practice.transcription}
                </p>
              </div>

              {/* AIフィードバック */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  🤖 AIフィードバック
                </h3>

                {/* 良かった点 */}
                {data.practice.feedback.goodPoints &&
                  data.practice.feedback.goodPoints.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">
                        ✅ 良かった点
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {data.practice.feedback.goodPoints.map(
                          (point, index) => (
                            <li key={index} className="text-gray-700">
                              {point}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* 改善点 */}
                {data.practice.feedback.improvements &&
                  data.practice.feedback.improvements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2">
                        💡 改善点
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {data.practice.feedback.improvements.map(
                          (point, index) => (
                            <li key={index} className="text-gray-700">
                              {point}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* 詳細スコア */}
                {data.practice.feedback.detailedScores && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      📊 詳細スコア
                    </h4>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        {
                          label: '流暢さ',
                          score:
                            data.practice.feedback.detailedScores.fluency || 0,
                        },
                        {
                          label: '発音',
                          score:
                            data.practice.feedback.detailedScores
                              .pronunciation || 0,
                        },
                        {
                          label: '語彙',
                          score:
                            data.practice.feedback.detailedScores.vocabulary ||
                            0,
                        },
                        {
                          label: '文法',
                          score:
                            data.practice.feedback.detailedScores.grammar || 0,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="text-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="text-sm text-gray-600">
                            {item.label}
                          </div>
                          <div className="text-2xl font-bold text-blue-600 mt-1">
                            {item.score}点
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 講師メモ */}
              <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📝 講師メモ（非公開）
                </h3>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="この練習についてのメモを入力してください..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  {data.teacher_note && (
                    <p className="text-sm text-gray-500">
                      最終更新: {formatDate(data.teacher_note.updated_at)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    {saveMessage && (
                      <span
                        className={`text-sm ${
                          saveMessage.includes('失敗')
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {saveMessage}
                      </span>
                    )}
                    <button
                      onClick={handleSaveNote}
                      disabled={isSaving}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? '保存中...' : '💾 メモを保存'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              データの読み込みに失敗しました
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
