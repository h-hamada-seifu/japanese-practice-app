import { createServerClient } from '@/lib/supabase/server';
import { UserStreaksRow } from '@/types/database';

/**
 * ストリーク機能のサービス
 */

/**
 * 2つの日付が連続しているかチェック
 */
function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * 2つの日付が同じ日かチェック
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * ユーザーのストリークデータを取得
 */
export async function getUserStreak(
  userId: string
): Promise<UserStreaksRow | null> {
  const supabase = createServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // レコードがない場合はnullを返す
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching user streak:', error);
    throw error;
  }

  return data;
}

/**
 * ストリークを更新する
 * 練習完了時に呼ばれる
 */
export async function updateStreak(userId: string): Promise<UserStreaksRow> {
  const supabase = createServerClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 時刻を00:00:00にリセット

  // 既存のストリークデータを取得
  const existingStreak = await getUserStreak(userId);

  if (!existingStreak) {
    // 初回練習の場合、新規作成
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('user_streaks')
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_practice_date: today.toISOString().split('T')[0],
        total_practice_days: 1,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user streak:', error);
      throw error;
    }

    return data;
  }

  // 最後の練習日
  const lastPracticeDate = new Date(existingStreak.last_practice_date);
  lastPracticeDate.setHours(0, 0, 0, 0);

  // 今日既に練習済みの場合は更新不要
  if (isSameDay(today, lastPracticeDate)) {
    return existingStreak;
  }

  let newCurrentStreak: number;
  const newTotalPracticeDays: number = existingStreak.total_practice_days + 1;

  // 連続日チェック
  if (isConsecutiveDay(lastPracticeDate, today)) {
    // 連続している場合、ストリークを+1
    newCurrentStreak = existingStreak.current_streak + 1;
  } else {
    // 連続していない場合、ストリークリセット
    newCurrentStreak = 1;
  }

  // 最長ストリーク更新チェック
  const newLongestStreak = Math.max(
    existingStreak.longest_streak,
    newCurrentStreak
  );

  // 更新
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('user_streaks')
    .update({
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      last_practice_date: today.toISOString().split('T')[0],
      total_practice_days: newTotalPracticeDays,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user streak:', error);
    throw error;
  }

  return data;
}

/**
 * ストリークが途切れるリスクがあるかチェック
 * (最後の練習から24時間以上経過している場合)
 */
export async function isStreakAtRisk(userId: string): Promise<boolean> {
  const streak = await getUserStreak(userId);

  if (!streak || streak.current_streak === 0) {
    return false;
  }

  const lastPracticeDate = new Date(streak.last_practice_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastPracticeDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastPracticeDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 最後の練習から1日経過している場合、リスクあり
  return diffDays >= 1;
}
