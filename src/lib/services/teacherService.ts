/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Supabase型推論の問題を回避
import { createServerClient } from '@/lib/supabase/server';
import type {
  ClassesRow,
  UsersRow,
  SpeechesRow,
  TeachersRow,
} from '@/types/database';

/**
 * 現在のユーザーの講師IDを取得
 */
export async function getCurrentTeacherId(): Promise<string | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // teachersテーブルからteacher.idを取得
  const { data, error } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  return (data as { id: string }).id;
}

/**
 * 現在のユーザーの講師情報を取得
 */
export async function getCurrentTeacher(): Promise<TeachersRow | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // teachersテーブルから講師情報を取得
  const result = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (result.error || !result.data) return null;

  return result.data as TeachersRow;
}

// クラス統計情報の型定義
export interface ClassWithStats extends ClassesRow {
  student_count: number;
  active_student_count: number;
  average_score: number;
  this_week_practices: number;
}

// 生徒情報の型定義
export interface StudentInfo extends UsersRow {
  class_id?: string;
  class_name?: string;
  status: 'active' | 'warning' | 'inactive';
  current_streak: number;
  this_week_practices: number;
  this_month_practices: number;
  total_practices: number;
  average_score: number;
  best_score: number;
  last_practice_date: string | null;
}

// 生徒詳細情報の型定義
export interface StudentDetails {
  student: UsersRow;
  stats: {
    total_practices: number;
    total_duration_minutes: number;
    average_score: number;
    best_score: number;
    current_streak: number;
    longest_streak: number;
    this_week_practices: number;
    last_week_practices: number;
    this_month_practices: number;
    last_month_practices: number;
    category_stats: Array<{
      category: string;
      average_score: number;
      practice_count: number;
    }>;
  };
  recent_practices: Array<
    SpeechesRow & {
      topic_category: string;
    }
  >;
  score_trend: Array<{
    date: string;
    score: number;
  }>;
}

/**
 * 講師が担当するクラス一覧を取得
 */
export async function getTeacherClasses(
  teacherId: string
): Promise<ClassWithStats[]> {
  const supabase = await createServerClient();

  // 講師が担当するクラスIDを取得
  const { data: assignments, error: assignmentsError } = await supabase
    .from('teacher_class_assignments')
    .select('class_id')
    .eq('teacher_id', teacherId);

  if (assignmentsError) throw assignmentsError;
  if (!assignments || assignments.length === 0) return [];

  const classIds = assignments.map((a: any) => a.class_id);

  // クラス情報を取得
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('*')
    .in('id', classIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (classesError) throw classesError;
  if (!classes) return [];

  // 各クラスの統計情報を計算
  const classesWithStats: ClassWithStats[] = await Promise.all(
    classes.map(async (classInfo) => {
      // クラスの生徒数を取得
      const { count: studentCount } = await supabase
        .from('student_class_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classInfo.id)
        .eq('status', 'active');

      // クラスの生徒IDを取得
      const { data: studentAssignments } = await supabase
        .from('student_class_assignments')
        .select('student_id')
        .eq('class_id', classInfo.id)
        .eq('status', 'active');

      const studentIds = studentAssignments?.map((s) => s.student_id) || [];

      if (studentIds.length === 0) {
        return {
          ...classInfo,
          student_count: 0,
          active_student_count: 0,
          average_score: 0,
          this_week_practices: 0,
        };
      }

      // アクティブな生徒数（3日以内に練習）
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: activeStudents } = await supabase
        .from('user_streaks')
        .select('user_id')
        .in('user_id', studentIds)
        .gte('last_practice_date', threeDaysAgo.toISOString());

      // 今週の練習数と平均スコアを取得
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: recentSpeeches } = await supabase
        .from('speeches')
        .select('feedback')
        .in('user_id', studentIds)
        .gte('created_at', oneWeekAgo.toISOString());

      const thisWeekPractices = recentSpeeches?.length || 0;
      const averageScore =
        recentSpeeches && recentSpeeches.length > 0
          ? recentSpeeches.reduce((sum, speech) => {
              const feedback = speech.feedback as { score?: number };
              return sum + (feedback.score || 0);
            }, 0) / recentSpeeches.length
          : 0;

      return {
        ...classInfo,
        student_count: studentCount || 0,
        active_student_count: activeStudents?.length || 0,
        average_score: Math.round(averageScore * 10) / 10,
        this_week_practices: thisWeekPractices,
      };
    })
  );

  return classesWithStats;
}

/**
 * クラスの生徒一覧を取得
 */
export async function getClassStudents(classId: string): Promise<{
  class: ClassesRow;
  students: StudentInfo[];
  summary: {
    total_students: number;
    active_students: number;
    warning_students: number;
    inactive_students: number;
    class_average_score: number;
    this_week_total_practices: number;
  };
}> {
  const supabase = await createServerClient();

  // クラス情報を取得
  const { data: classInfo, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  if (classError) throw classError;

  // クラスの生徒を取得
  const { data: studentAssignments, error: assignmentsError } = await supabase
    .from('student_class_assignments')
    .select('student_id')
    .eq('class_id', classId)
    .eq('status', 'active');

  if (assignmentsError) throw assignmentsError;

  const studentIds = studentAssignments?.map((s) => s.student_id) || [];

  if (studentIds.length === 0) {
    return {
      class: classInfo,
      students: [],
      summary: {
        total_students: 0,
        active_students: 0,
        warning_students: 0,
        inactive_students: 0,
        class_average_score: 0,
        this_week_total_practices: 0,
      },
    };
  }

  // 生徒情報を取得して統計情報を追加
  const students = await getStudentInfoList(
    studentIds,
    classId,
    classInfo.name
  );

  // サマリーを計算
  const summary = {
    total_students: students.length,
    active_students: students.filter((s) => s.status === 'active').length,
    warning_students: students.filter((s) => s.status === 'warning').length,
    inactive_students: students.filter((s) => s.status === 'inactive').length,
    class_average_score:
      students.length > 0
        ? Math.round(
            (students.reduce((sum, s) => sum + s.average_score, 0) /
              students.length) *
              10
          ) / 10
        : 0,
    this_week_total_practices: students.reduce(
      (sum, s) => sum + s.this_week_practices,
      0
    ),
  };

  return { class: classInfo, students, summary };
}

/**
 * 全担当生徒一覧を取得（複数クラス統合）
 */
export async function getAllTeacherStudents(
  teacherId: string,
  classIdFilter?: string
): Promise<{
  students: StudentInfo[];
  summary: {
    total_students: number;
    active_students: number;
    warning_students: number;
    inactive_students: number;
    average_score: number;
    this_week_total_practices: number;
  };
}> {
  const supabase = await createServerClient();

  // 講師が担当するクラスIDを取得
  const { data: assignments, error: assignmentsError } = await supabase
    .from('teacher_class_assignments')
    .select('class_id')
    .eq('teacher_id', teacherId);

  if (assignmentsError) throw assignmentsError;
  if (!assignments || assignments.length === 0) {
    return {
      students: [],
      summary: {
        total_students: 0,
        active_students: 0,
        warning_students: 0,
        inactive_students: 0,
        average_score: 0,
        this_week_total_practices: 0,
      },
    };
  }

  let classIds = assignments.map((a) => a.class_id);

  // クラスフィルタが指定されている場合
  if (classIdFilter) {
    classIds = classIds.filter((id) => id === classIdFilter);
  }

  // 各クラスの生徒を取得
  const { data: studentAssignments, error: studentError } = await supabase
    .from('student_class_assignments')
    .select('student_id, class_id')
    .in('class_id', classIds)
    .eq('status', 'active');

  if (studentError) throw studentError;
  if (!studentAssignments || studentAssignments.length === 0) {
    return {
      students: [],
      summary: {
        total_students: 0,
        active_students: 0,
        warning_students: 0,
        inactive_students: 0,
        average_score: 0,
        this_week_total_practices: 0,
      },
    };
  }

  // クラス情報を取得（クラス名を表示するため）
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .in('id', classIds);

  const classMap = new Map(classes?.map((c) => [c.id, c.name]) || []);

  // 重複を排除して生徒IDリストを作成
  const uniqueStudentIds = Array.from(
    new Set(studentAssignments.map((s) => s.student_id))
  );

  // 生徒とクラスのマッピング（最初に見つかったクラスを使用）
  const studentClassMap = new Map(
    studentAssignments.map((s) => [s.student_id, s.class_id])
  );

  // 生徒情報を取得
  const students: StudentInfo[] = [];
  for (const studentId of uniqueStudentIds) {
    const classId = studentClassMap.get(studentId);
    const className = classId ? classMap.get(classId) : undefined;
    const studentInfoList = await getStudentInfoList(
      [studentId],
      classId,
      className
    );
    students.push(...studentInfoList);
  }

  // サマリーを計算
  const summary = {
    total_students: students.length,
    active_students: students.filter((s) => s.status === 'active').length,
    warning_students: students.filter((s) => s.status === 'warning').length,
    inactive_students: students.filter((s) => s.status === 'inactive').length,
    average_score:
      students.length > 0
        ? Math.round(
            (students.reduce((sum, s) => sum + s.average_score, 0) /
              students.length) *
              10
          ) / 10
        : 0,
    this_week_total_practices: students.reduce(
      (sum, s) => sum + s.this_week_practices,
      0
    ),
  };

  return { students, summary };
}

/**
 * 生徒詳細情報を取得
 */
export async function getStudentDetails(
  studentId: string
): Promise<StudentDetails> {
  const supabase = await createServerClient();

  // 生徒情報を取得
  const { data: student, error: studentError } = await supabase
    .from('users')
    .select('*')
    .eq('id', studentId)
    .single();

  if (studentError) throw studentError;

  // ストリーク情報を取得
  const { data: streakData } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', studentId)
    .single();

  // 全ての練習を取得
  const { data: allSpeeches } = await supabase
    .from('speeches')
    .select('*, topics(category)')
    .eq('user_id', studentId)
    .order('created_at', { ascending: false });

  // 今週・先週の練習数を計算
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const thisWeekPractices =
    allSpeeches?.filter((s) => new Date(s.created_at) >= oneWeekAgo).length ||
    0;
  const lastWeekPractices =
    allSpeeches?.filter(
      (s) =>
        new Date(s.created_at) >= twoWeeksAgo &&
        new Date(s.created_at) < oneWeekAgo
    ).length || 0;
  const thisMonthPractices =
    allSpeeches?.filter((s) => new Date(s.created_at) >= oneMonthAgo).length ||
    0;
  const lastMonthPractices =
    allSpeeches?.filter(
      (s) =>
        new Date(s.created_at) >= twoMonthsAgo &&
        new Date(s.created_at) < oneMonthAgo
    ).length || 0;

  // スコア統計を計算
  const scores =
    allSpeeches?.map((s) => {
      const feedback = s.feedback as { score?: number };
      return feedback.score || 0;
    }) || [];

  const averageScore =
    scores.length > 0
      ? Math.round(
          (scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10
        ) / 10
      : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  // 総練習時間を計算
  const totalDurationMinutes =
    allSpeeches?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0;

  // カテゴリ別統計を計算
  const categoryMap = new Map<
    string,
    { total: number; count: number; scores: number[] }
  >();

  allSpeeches?.forEach((speech) => {
    const category = (speech as any).topics?.category || '未分類';
    const feedback = speech.feedback as { score?: number };
    const score = feedback.score || 0;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, { total: 0, count: 0, scores: [] });
    }

    const cat = categoryMap.get(category)!;
    cat.total += score;
    cat.count += 1;
    cat.scores.push(score);
  });

  const categoryStats = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      average_score: Math.round((data.total / data.count) * 10) / 10,
      practice_count: data.count,
    })
  );

  // スコア推移データを作成（直近30日分）
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentSpeeches = allSpeeches?.filter(
    (s) => new Date(s.created_at) >= thirtyDaysAgo
  );

  const scoreTrend =
    recentSpeeches?.map((speech) => {
      const feedback = speech.feedback as { score?: number };
      return {
        date: new Date(speech.created_at).toISOString().split('T')[0],
        score: feedback.score || 0,
      };
    }) || [];

  // 最近の練習（最新10件）
  const recentPractices =
    allSpeeches?.slice(0, 10).map((speech) => ({
      ...speech,
      topic_category: (speech as any).topics?.category || '未分類',
    })) || [];

  return {
    student,
    stats: {
      total_practices: allSpeeches?.length || 0,
      total_duration_minutes: Math.round(totalDurationMinutes / 60),
      average_score: averageScore,
      best_score: bestScore,
      current_streak: streakData?.current_streak || 0,
      longest_streak: streakData?.longest_streak || 0,
      this_week_practices: thisWeekPractices,
      last_week_practices: lastWeekPractices,
      this_month_practices: thisMonthPractices,
      last_month_practices: lastMonthPractices,
      category_stats: categoryStats,
    },
    recent_practices: recentPractices,
    score_trend: scoreTrend,
  };
}

/**
 * 生徒情報リストを取得（内部ヘルパー関数）
 */
async function getStudentInfoList(
  studentIds: string[],
  classId?: string,
  className?: string
): Promise<StudentInfo[]> {
  const supabase = await createServerClient();

  // 生徒基本情報を取得
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .in('id', studentIds);

  if (!users) return [];

  // ストリーク情報を取得
  const { data: streaks } = await supabase
    .from('user_streaks')
    .select('*')
    .in('user_id', studentIds);

  const streakMap = new Map(streaks?.map((s) => [s.user_id, s]) || []);

  // 各生徒の練習回数とスコアを取得
  const students: StudentInfo[] = await Promise.all(
    users.map(async (user) => {
      const streak = streakMap.get(user.id);

      // 今週の練習数
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: thisWeekSpeeches } = await supabase
        .from('speeches')
        .select('feedback')
        .eq('user_id', user.id)
        .gte('created_at', oneWeekAgo.toISOString());

      // 今月の練習数
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

      const { data: thisMonthSpeeches } = await supabase
        .from('speeches')
        .select('feedback')
        .eq('user_id', user.id)
        .gte('created_at', oneMonthAgo.toISOString());

      // 全ての練習を取得してスコアを計算
      const { data: allSpeeches } = await supabase
        .from('speeches')
        .select('feedback')
        .eq('user_id', user.id);

      const scores =
        allSpeeches?.map((s) => {
          const feedback = s.feedback as { score?: number };
          return feedback.score || 0;
        }) || [];

      const averageScore =
        scores.length > 0
          ? Math.round(
              (scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10
            ) / 10
          : 0;

      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      // ステータスを判定
      let status: 'active' | 'warning' | 'inactive' = 'active';
      const lastPracticeDate = streak?.last_practice_date
        ? new Date(streak.last_practice_date)
        : null;

      if (lastPracticeDate) {
        const daysSinceLastPractice = Math.floor(
          (Date.now() - lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastPractice >= 8) {
          status = 'inactive';
        } else if (daysSinceLastPractice >= 4) {
          status = 'warning';
        }
      } else {
        status = 'inactive';
      }

      return {
        ...user,
        class_id: classId,
        class_name: className,
        status,
        current_streak: streak?.current_streak || 0,
        this_week_practices: thisWeekSpeeches?.length || 0,
        this_month_practices: thisMonthSpeeches?.length || 0,
        total_practices: allSpeeches?.length || 0,
        average_score: averageScore,
        best_score: bestScore,
        last_practice_date: streak?.last_practice_date || null,
      };
    })
  );

  return students;
}
