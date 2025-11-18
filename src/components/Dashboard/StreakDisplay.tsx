'use client';

import { UserStreaksRow } from '@/types/database';

interface StreakDisplayProps {
  streak: UserStreaksRow | null;
}

export default function StreakDisplay({ streak }: StreakDisplayProps) {
  if (!streak) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🔥</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            ストリーク記録
          </h3>
          <p className="text-gray-600 text-sm">
            まだ練習記録がありません。今日から始めましょう！
          </p>
        </div>
      </div>
    );
  }

  const { current_streak, longest_streak, total_practice_days } = streak;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-sm p-6 border-2 border-orange-200">
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">🔥</div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">連続練習記録</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-3xl font-bold text-orange-600">
            {current_streak}
          </div>
          <div className="text-xs text-gray-600 mt-1">現在の連続</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-red-600">
            {longest_streak}
          </div>
          <div className="text-xs text-gray-600 mt-1">最長記録</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-blue-600">
            {total_practice_days}
          </div>
          <div className="text-xs text-gray-600 mt-1">総練習日数</div>
        </div>
      </div>

      {current_streak > 0 && (
        <div className="mt-4 pt-4 border-t border-orange-200">
          <p className="text-center text-sm text-orange-800 font-medium">
            {current_streak >= 7
              ? '素晴らしい！この調子で続けましょう！ 🎉'
              : current_streak >= 3
                ? 'いい感じです！継続は力なり！ 💪'
                : '良いスタートです！毎日続けましょう！ ✨'}
          </p>
        </div>
      )}
    </div>
  );
}
