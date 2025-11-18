'use client';

import { exportAnalyticsCSV } from '@/lib/utils/csvExport';

interface ExportAnalyticsCSVButtonProps {
  analytics: {
    summary: {
      total_students: number;
      active_rate: number;
      average_score: number;
      total_practices: number;
      retention_rate_7days: number;
    };
    top_performers: Array<{
      student_id: string;
      student_name: string;
      practice_count: number;
      average_score: number;
    }>;
    at_risk_students: Array<{
      student_id: string;
      student_name: string;
      days_since_last_practice: number;
      average_score: number;
    }>;
    category_difficulty: Array<{
      category: string;
      average_score: number;
      difficulty: 'easy' | 'medium' | 'hard';
      practice_count: number;
    }>;
  };
}

export default function ExportAnalyticsCSVButton({
  analytics,
}: ExportAnalyticsCSVButtonProps) {
  const handleExport = () => {
    exportAnalyticsCSV(analytics);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2"
    >
      📊 CSV出力
    </button>
  );
}
