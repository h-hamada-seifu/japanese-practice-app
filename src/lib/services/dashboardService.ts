import { createServerClient } from '@/lib/supabase/server';
import { Feedback } from '@/types';

export interface DashboardStats {
  totalPractices: number;
  averageScore: number;
  thisWeekPractices: number;
  thisMonthPractices: number;
  bestScore: number;
  recentScores: Array<{ date: string; score: number }>;
  categoryStats: Array<{ category: string; avgScore: number; count: number }>;
}

/**
 * ダッシュボード用の統計データを取得
 */
export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const supabase = createServerClient();

  // すべてのspeeches を取得
  const { data, error } = await supabase
    .from('speeches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speeches = data as any[] | null;

  if (error) {
    console.error('Error fetching speeches for stats:', error);
    throw error;
  }

  if (!speeches || speeches.length === 0) {
    return {
      totalPractices: 0,
      averageScore: 0,
      thisWeekPractices: 0,
      thisMonthPractices: 0,
      bestScore: 0,
      recentScores: [],
      categoryStats: [],
    };
  }

  // スコアを抽出
  const scores = speeches
    .map((speech) => {
      const feedback = speech.feedback as unknown as Feedback;
      return feedback?.score ?? 0;
    })
    .filter((score) => score > 0);

  // 平均スコア計算
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  // 最高スコア
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  // 今週の練習数
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekPractices = speeches.filter(
    (speech) => new Date(speech.created_at) >= oneWeekAgo
  ).length;

  // 今月の練習数
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const thisMonthPractices = speeches.filter(
    (speech) => new Date(speech.created_at) >= oneMonthAgo
  ).length;

  // 最近7日のスコア推移（グラフ用）
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const recentScores = last7Days.map((date) => {
    const daySpeeches = speeches.filter(
      (speech) => speech.created_at.split('T')[0] === date
    );
    if (daySpeeches.length === 0) {
      return { date, score: 0 };
    }
    const dayScores = daySpeeches
      .map((speech) => {
        const feedback = speech.feedback as unknown as Feedback;
        return feedback?.score ?? 0;
      })
      .filter((score) => score > 0);
    const avgScore =
      dayScores.length > 0
        ? Math.round(dayScores.reduce((a, b) => a + b, 0) / dayScores.length)
        : 0;
    return { date, score: avgScore };
  });

  // カテゴリ別統計を取得するため、topicsテーブルも読み込む
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topicIds = Array.from(new Set(speeches.map((s: any) => s.topic_id)));
  const { data: topicsData } = await supabase
    .from('topics')
    .select('id, category')
    .in('id', topicIds);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topics = topicsData as any[] | null;

  const topicCategoryMap = new Map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    topics?.map((t: any) => [t.id, t.category]) ?? []
  );

  // カテゴリ別に集計
  const categoryMap = new Map<string, { scores: number[]; count: number }>();

  speeches.forEach((speech) => {
    const category = topicCategoryMap.get(speech.topic_id) ?? '不明';
    const feedback = speech.feedback as unknown as Feedback;
    const score = feedback?.score ?? 0;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, { scores: [], count: 0 });
    }
    const catData = categoryMap.get(category)!;
    if (score > 0) {
      catData.scores.push(score);
    }
    catData.count++;
  });

  const categoryStats = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      avgScore:
        data.scores.length > 0
          ? Math.round(
              data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            )
          : 0,
      count: data.count,
    })
  );

  return {
    totalPractices: speeches.length,
    averageScore,
    thisWeekPractices,
    thisMonthPractices,
    bestScore,
    recentScores,
    categoryStats,
  };
}
