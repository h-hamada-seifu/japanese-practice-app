'use client';

import { exportStudentsCSV } from '@/lib/utils/csvExport';

interface Student {
  id: string;
  display_name: string | null;
  email: string;
  class_name?: string | null;
  status: string;
  current_streak: number;
  this_week_practices: number;
  this_month_practices: number;
  total_practices: number;
  average_score: number;
  best_score: number;
  last_practice_date: string | null;
}

interface ExportCSVButtonProps {
  students: Student[];
  className?: string;
}

export default function ExportCSVButton({
  students,
  className,
}: ExportCSVButtonProps) {
  const handleExport = () => {
    exportStudentsCSV(students, className);
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
    >
      CSV出力
    </button>
  );
}
