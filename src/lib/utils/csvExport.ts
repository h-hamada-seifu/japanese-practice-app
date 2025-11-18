import Papa from 'papaparse';

/**
 * CSVをダウンロードする汎用関数
 */
export function downloadCSV(data: unknown[], filename: string) {
  const csv = Papa.unparse(data, {
    header: true,
  });

  // BOM付きでエンコード（Excelで文字化けしないように）
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 生徒一覧データをCSV形式に変換
 */
export function exportStudentsCSV(
  students: Array<{
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
  }>,
  className?: string
) {
  const csvData = students.map((student) => ({
    名前: student.display_name || student.email.split('@')[0],
    メールアドレス: student.email,
    クラス: student.class_name || '-',
    状態: getStatusText(student.status),
    ストリーク: `${student.current_streak}日`,
    今週練習: `${student.this_week_practices}回`,
    今月練習: `${student.this_month_practices}回`,
    総練習回数: `${student.total_practices}回`,
    平均スコア: `${student.average_score.toFixed(1)}点`,
    最高スコア: `${student.best_score}点`,
    最終練習日: formatDate(student.last_practice_date),
  }));

  const filename = className
    ? `生徒一覧_${className}_${getDateString()}.csv`
    : `全生徒一覧_${getDateString()}.csv`;

  downloadCSV(csvData, filename);
}

/**
 * 統計データをCSV形式に変換
 */
export function exportAnalyticsCSV(analytics: {
  summary: {
    total_students: number;
    active_rate: number;
    average_score: number;
    total_practices: number;
    retention_rate_7days: number;
  };
  top_performers: Array<{
    student_name: string;
    practice_count: number;
    average_score: number;
  }>;
  at_risk_students: Array<{
    student_name: string;
    days_since_last_practice: number;
    average_score: number;
  }>;
  category_difficulty: Array<{
    category: string;
    average_score: number;
    difficulty: string;
    practice_count: number;
  }>;
}) {
  // サマリーデータ
  const summaryData = [
    { 項目: '総生徒数', 値: `${analytics.summary.total_students}名` },
    {
      項目: 'アクティブ率',
      値: `${Math.round(analytics.summary.active_rate * 100)}%`,
    },
    {
      項目: '平均スコア',
      値: `${analytics.summary.average_score.toFixed(1)}点`,
    },
    { 項目: '総練習回数', 値: `${analytics.summary.total_practices}回` },
    {
      項目: '7日間継続率',
      値: `${Math.round(analytics.summary.retention_rate_7days * 100)}%`,
    },
  ];

  // トップパフォーマーデータ
  const topPerformersData = analytics.top_performers.map((p, index) => ({
    順位: index + 1,
    名前: p.student_name,
    練習回数: `${p.practice_count}回`,
    平均スコア: `${p.average_score.toFixed(1)}点`,
  }));

  // 要注意生徒データ
  const atRiskData = analytics.at_risk_students.map((s) => ({
    名前: s.student_name,
    最終練習: `${s.days_since_last_practice}日前`,
    平均スコア: `${s.average_score.toFixed(1)}点`,
  }));

  // カテゴリ別データ
  const categoryData = analytics.category_difficulty.map((c) => ({
    カテゴリ: c.category,
    平均スコア: `${c.average_score.toFixed(1)}点`,
    難易度: getDifficultyText(c.difficulty),
    練習回数: `${c.practice_count}回`,
  }));

  // 全データを結合
  const allData = [
    { セクション: '=== サマリー ===' },
    ...summaryData,
    { セクション: '' },
    { セクション: '=== トップパフォーマー（今週） ===' },
    ...topPerformersData,
    { セクション: '' },
    { セクション: '=== 要注意・停滞生徒 ===' },
    ...atRiskData,
    { セクション: '' },
    { セクション: '=== カテゴリ別難易度 ===' },
    ...categoryData,
  ];

  const filename = `統計分析_${getDateString()}.csv`;
  downloadCSV(allData, filename);
}

// ヘルパー関数
function getStatusText(status: string): string {
  switch (status) {
    case 'active':
      return 'アクティブ';
    case 'warning':
      return '要注意';
    case 'inactive':
      return '停滞';
    default:
      return status;
  }
}

function getDifficultyText(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return '簡単';
    case 'medium':
      return '普通';
    case 'hard':
      return '難しい';
    default:
      return difficulty;
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '練習なし';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `今日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `昨日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return `${diffDays}日前`;
  }
}

function getDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
