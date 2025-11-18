export interface ScoreCardProps {
  score: number; // 0-100
}

export default function ScoreCard({ score }: ScoreCardProps) {
  // スコアに応じた色を決定
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div
      className={`rounded-lg border p-6 ${getScoreBgColor(score)} transition-all duration-200`}
    >
      <div className="text-center">
        <div className="text-sm font-medium text-gray-600 mb-2">
          📊 総合スコア
        </div>
        <div className={`text-5xl font-bold ${getScoreColor(score)} mb-2`}>
          {score}
          <span className="text-2xl">点</span>
        </div>
        <div className="text-sm text-gray-500">100点満点</div>
      </div>
    </div>
  );
}
