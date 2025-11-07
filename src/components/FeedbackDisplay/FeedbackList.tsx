import { Feedback } from '@/types';

export interface FeedbackListProps {
  feedback: Feedback;
  transcription: string;
}

export default function FeedbackList({
  feedback,
  transcription,
}: FeedbackListProps) {
  return (
    <div className="space-y-6">
      {/* あなたの発話 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🎤</span>
          あなたの発話:
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          「{transcription}」
        </p>
      </div>

      {/* 良い点 */}
      {feedback.goodPoints && feedback.goodPoints.length > 0 && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
            <span className="mr-2">✅</span>
            良い点:
          </h3>
          <ul className="space-y-2">
            {feedback.goodPoints.map((point, index) => (
              <li
                key={index}
                className="text-green-800 flex items-start leading-relaxed"
              >
                <span className="mr-2 mt-1 flex-shrink-0">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 改善点 */}
      {feedback.improvements && feedback.improvements.length > 0 && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            改善点:
          </h3>
          <ul className="space-y-2">
            {feedback.improvements.map((improvement, index) => (
              <li
                key={index}
                className="text-yellow-800 flex items-start leading-relaxed"
              >
                <span className="mr-2 mt-1 flex-shrink-0">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 修正例 */}
      {feedback.correctedText && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">📝</span>
            修正例:
          </h3>
          <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
            「{feedback.correctedText}」
          </p>
        </div>
      )}
    </div>
  );
}
