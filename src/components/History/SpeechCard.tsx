'use client';

import { SpeechesRow } from '@/types/database';

interface SpeechCardProps {
  speech: SpeechesRow;
}

interface Feedback {
  goodPoints?: string[];
  improvements?: string[];
  correctedText?: string;
  score?: number;
}

export default function SpeechCard({ speech }: SpeechCardProps) {
  const feedback = speech.feedback as Feedback;
  const createdAt = new Date(speech.created_at);
  const formattedDate = createdAt.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = createdAt.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score?: number): string => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
      {/* ヘッダー部分 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {speech.topic_title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {formattedDate} {formattedTime}
            </span>
            <span>• {formatDuration(speech.duration)}</span>
          </div>
        </div>
        {feedback?.score !== undefined && (
          <div className="ml-4">
            <div
              className={`text-3xl font-bold ${getScoreColor(feedback.score)}`}
            >
              {feedback.score}
            </div>
            <div className="text-xs text-gray-500 text-center">点</div>
          </div>
        )}
      </div>

      {/* 文字起こしテキスト */}
      {speech.transcription && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">発話内容</h4>
          <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-200">
            {speech.transcription}
          </p>
        </div>
      )}

      {/* フィードバック */}
      {feedback && (
        <div className="space-y-3">
          {feedback.goodPoints && feedback.goodPoints.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-700 mb-2">
                良い点
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {feedback.goodPoints.map((point, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements && feedback.improvements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-700 mb-2">
                改善点
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {feedback.improvements.map((point, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.correctedText && (
            <div>
              <h4 className="text-sm font-semibold text-purple-700 mb-2">
                添削例
              </h4>
              <p className="text-sm text-gray-800 bg-purple-50 p-3 rounded-md border border-purple-200">
                {feedback.correctedText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 音声再生 */}
      {speech.audio_url && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <audio controls className="w-full">
            <source src={speech.audio_url} type="audio/webm" />
            <source src={speech.audio_url} type="audio/mp4" />
            お使いのブラウザは音声再生に対応していません。
          </audio>
        </div>
      )}
    </div>
  );
}
