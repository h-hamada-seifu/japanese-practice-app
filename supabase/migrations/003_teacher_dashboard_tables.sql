-- ====================================
-- 講師ダッシュボード - Database Migration (Phase 1)
-- ====================================
-- 作成日: 2025-11-18
-- 説明: 講師用テーブル、クラス管理、RLSポリシーを作成
-- 参照: TEACHER_DASHBOARD_DESIGN.md

-- ====================================
-- 1. テーブル作成
-- ====================================

-- 1.1 teachersテーブル（講師アカウント情報）
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT,  -- 所属部署
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 classesテーブル（クラス情報）
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,  -- 例: '2025年度 春期クラスA', 'N3レベルクラス'
  code TEXT UNIQUE,    -- 例: '2025-SPRING-A', 'N3-01'
  description TEXT,
  academic_year TEXT,  -- 例: '2025'
  semester TEXT,       -- 例: 'spring', 'fall'
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 teacher_class_assignmentsテーブル（講師とクラスの紐付け）
CREATE TABLE teacher_class_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'homeroom_teacher',  -- 'homeroom_teacher', 'assistant', 'supervisor'
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),  -- 誰が割り当てたか

  UNIQUE(teacher_id, class_id)
);

-- 1.4 student_class_assignmentsテーブル（生徒とクラスの紐付け）
CREATE TABLE student_class_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',  -- 'active', 'completed', 'withdrawn'

  UNIQUE(student_id, class_id)
);

-- 1.5 teacher_notesテーブル（講師メモ - 非公開）
CREATE TABLE teacher_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  speech_id UUID REFERENCES speeches(id) ON DELETE CASCADE,  -- 対象の練習
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.6 teacher_alertsテーブル（講師向け通知・アラート）
CREATE TABLE teacher_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,  -- 'inactive_7days', 'low_score_streak', 'milestone'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 2. インデックス作成
-- ====================================

-- teachersテーブルのインデックス
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_email ON teachers(email);

-- teacher_class_assignmentsテーブルのインデックス
CREATE INDEX idx_teacher_class_assignments_teacher_id ON teacher_class_assignments(teacher_id);
CREATE INDEX idx_teacher_class_assignments_class_id ON teacher_class_assignments(class_id);

-- student_class_assignmentsテーブルのインデックス
CREATE INDEX idx_student_class_assignments_student_id ON student_class_assignments(student_id);
CREATE INDEX idx_student_class_assignments_class_id ON student_class_assignments(class_id);

-- teacher_notesテーブルのインデックス
CREATE INDEX idx_teacher_notes_teacher_id ON teacher_notes(teacher_id);
CREATE INDEX idx_teacher_notes_student_id ON teacher_notes(student_id);
CREATE INDEX idx_teacher_notes_speech_id ON teacher_notes(speech_id);

-- teacher_alertsテーブルのインデックス
CREATE INDEX idx_teacher_alerts_teacher_id ON teacher_alerts(teacher_id);
CREATE INDEX idx_teacher_alerts_is_read ON teacher_alerts(is_read);
CREATE INDEX idx_teacher_alerts_created_at ON teacher_alerts(created_at DESC);

-- ====================================
-- 3. Row Level Security (RLS) 設定
-- ====================================

-- 3.1 teachersテーブルのRLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own profile" ON teachers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update own profile" ON teachers
  FOR UPDATE USING (auth.uid() = user_id);

-- 3.2 classesテーブルのRLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- 講師は自分が担任のクラスを閲覧可能
CREATE POLICY "Teachers can view assigned classes" ON classes
  FOR SELECT USING (
    id IN (
      SELECT class_id FROM teacher_class_assignments
      WHERE teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
    )
  );

-- 生徒は自分が所属するクラスを閲覧可能
CREATE POLICY "Students can view own classes" ON classes
  FOR SELECT USING (
    id IN (
      SELECT class_id FROM student_class_assignments
      WHERE student_id = auth.uid()
    )
  );

-- 3.3 teacher_class_assignmentsテーブルのRLS
ALTER TABLE teacher_class_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own class assignments" ON teacher_class_assignments
  FOR SELECT USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );

-- 3.4 student_class_assignmentsテーブルのRLS
ALTER TABLE student_class_assignments ENABLE ROW LEVEL SECURITY;

-- 講師は担当クラスの生徒割り当てを閲覧可能
CREATE POLICY "Teachers can view class students" ON student_class_assignments
  FOR SELECT USING (
    class_id IN (
      SELECT class_id FROM teacher_class_assignments
      WHERE teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
    )
  );

-- 生徒は自分のクラス割り当てを閲覧可能
CREATE POLICY "Students can view own assignments" ON student_class_assignments
  FOR SELECT USING (student_id = auth.uid());

-- 3.5 teacher_notesテーブルのRLS
ALTER TABLE teacher_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own notes" ON teacher_notes
  FOR ALL USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );

-- 3.6 teacher_alertsテーブルのRLS
ALTER TABLE teacher_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own alerts" ON teacher_alerts
  FOR SELECT USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );

CREATE POLICY "Teachers can update own alerts" ON teacher_alerts
  FOR UPDATE USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );

-- ====================================
-- 4. 既存speechesテーブルへのRLSポリシー追加
-- ====================================

-- 講師が担当クラスの生徒の練習データを閲覧可能
CREATE POLICY "Teachers can view class students speeches" ON speeches
  FOR SELECT USING (
    user_id IN (
      SELECT student_id
      FROM student_class_assignments
      WHERE class_id IN (
        SELECT class_id
        FROM teacher_class_assignments
        WHERE teacher_id IN (
          SELECT id FROM teachers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- ====================================
-- 5. user_streaksテーブルへのRLSポリシー追加
-- ====================================

-- 講師が担当クラスの生徒のストリークデータを閲覧可能
CREATE POLICY "Teachers can view class students streaks" ON user_streaks
  FOR SELECT USING (
    user_id IN (
      SELECT student_id
      FROM student_class_assignments
      WHERE class_id IN (
        SELECT class_id
        FROM teacher_class_assignments
        WHERE teacher_id IN (
          SELECT id FROM teachers WHERE user_id = auth.uid()
        )
      )
    )
  );

-- ====================================
-- マイグレーション完了
-- ====================================
