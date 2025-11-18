'use client';

import { DashboardStats } from '@/lib/services/dashboardService';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* 総練習回数 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-sm text-gray-600 mb-1">総練習回数</div>
        <div className="text-3xl font-bold text-blue-600">
          {stats.totalPractices}
        </div>
        <div className="text-xs text-gray-500 mt-1">回</div>
      </div>

      {/* 平均スコア */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-sm text-gray-600 mb-1">平均スコア</div>
        <div className="text-3xl font-bold text-green-600">
          {stats.averageScore}
        </div>
        <div className="text-xs text-gray-500 mt-1">点</div>
      </div>

      {/* 最高スコア */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-sm text-gray-600 mb-1">最高スコア</div>
        <div className="text-3xl font-bold text-purple-600">
          {stats.bestScore}
        </div>
        <div className="text-xs text-gray-500 mt-1">点</div>
      </div>

      {/* 今週の練習 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-sm text-gray-600 mb-1">今週の練習</div>
        <div className="text-3xl font-bold text-orange-600">
          {stats.thisWeekPractices}
        </div>
        <div className="text-xs text-gray-500 mt-1">回</div>
      </div>
    </div>
  );
}
