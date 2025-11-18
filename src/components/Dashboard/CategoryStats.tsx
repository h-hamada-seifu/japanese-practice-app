'use client';

interface CategoryStat {
  category: string;
  avgScore: number;
  count: number;
}

interface CategoryStatsProps {
  categoryStats: CategoryStat[];
}

export default function CategoryStats({ categoryStats }: CategoryStatsProps) {
  if (categoryStats.length === 0) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">カテゴリ別の成績</h3>
      <div className="space-y-4">
        {categoryStats.map((stat) => (
          <div key={stat.category}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {stat.category}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  ({stat.count}回練習)
                </span>
              </div>
              <span
                className={`text-lg font-bold ${getScoreColor(stat.avgScore)}`}
              >
                {stat.avgScore}点
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getBarColor(stat.avgScore)}`}
                style={{ width: `${stat.avgScore}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          💡 ヒント:
          苦手なカテゴリを集中的に練習すると、全体的なスコアが向上します
        </p>
      </div>
    </div>
  );
}
