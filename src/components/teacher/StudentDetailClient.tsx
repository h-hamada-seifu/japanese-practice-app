'use client';

import { useState } from 'react';
import Link from 'next/link';
import PracticeDetailModal from './PracticeDetailModal';

interface Stats {
  total_practices: number;
}

interface Practice {
  id: string;
  topic_title: string;
  topic_category: string;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feedback: any;
}

interface StudentDetailClientProps {
  studentId: string;
  student: {
    id: string;
    email: string;
    display_name: string | null;
  };
  stats: Stats;
  recent_practices: Practice[];
}

export default function StudentDetailClient({
  studentId,
  stats,
  recent_practices,
}: StudentDetailClientProps) {
  const [selectedSpeechId, setSelectedSpeechId] = useState<string | null>(null);

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
    <>
      {/* 右カラム（練習履歴） */}
      <div className="col-span-5 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              📝 練習履歴（全{stats.total_practices}件）
            </h3>
          </div>

          {recent_practices.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              練習履歴がありません
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recent_practices.map((practice) => {
                const feedback = (practice.feedback as {
                  score?: number;
                } | null) || { score: 0 };
                return (
                  <div
                    key={practice.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {practice.topic_title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {practice.topic_category}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(practice.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                            (feedback.score || 0) >= 80
                              ? 'bg-green-100 text-green-800'
                              : (feedback.score || 0) >= 60
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {feedback.score || 0}点
                        </span>
                        <button
                          onClick={() => setSelectedSpeechId(practice.id)}
                          className="text-blue-600 hover:text-blue-800 text-xl transition-colors"
                          title="音声を再生"
                        >
                          🎧
                        </button>
                        <Link
                          href={`/teacher/students/${studentId}/notes/${practice.id}`}
                          className="text-gray-600 hover:text-gray-800 text-xl transition-colors"
                          title="メモを表示"
                        >
                          📝
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {recent_practices.length > 0 && (
            <div className="p-4 bg-gray-50 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                すべて表示 →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 練習詳細モーダル */}
      {selectedSpeechId && (
        <PracticeDetailModal
          speechId={selectedSpeechId}
          studentId={studentId}
          isOpen={!!selectedSpeechId}
          onClose={() => setSelectedSpeechId(null)}
        />
      )}
    </>
  );
}
