# 講師用ダッシュボード設計書

## 📋 概要

### 目的
留学生の日本語会話練習の進捗を講師が一元管理・把握できるダッシュボードを提供し、効果的な指導サポートを実現する。

### 対象ユーザー
- **プライマリ**: 日本語講師（i-seifu.jpドメインの教職員）
- **セカンダリ**: クラス担任、日本語教育コーディネーター

### コアバリュー
1. **可視化**: 生徒全員の練習状況を一目で把握
2. **早期介入**: 練習が停滞している生徒を早期発見
3. **データドリブン指導**: 客観的データに基づくフィードバック
4. **効率化**: 個別確認の手間を削減

---

## 🎯 主要機能

### 1. 担当クラス一覧ビュー

**パス**: `/teacher/classes`

```
┌─────────────────────────────────────────────────────────────────┐
│ 📚 担当クラス一覧                          [➕ 新規クラス作成]   │
├──────────────┬─────────┬────────┬────────┬────────┬──────────┤
│ クラス名      │ コード   │ 生徒数 │ 平均   │ 今週   │ アクション│
│              │         │        │ スコア │ 練習数  │          │
├──────────────┼─────────┼────────┼────────┼────────┼──────────┤
│ 2025春期クラスA│ 2025-S-A│ 15名   │ 78点   │ 42回   │ [詳細]   │
│ N3レベルクラス │ N3-01   │ 10名   │ 72点   │ 26回   │ [詳細]   │
│ 上級会話クラス │ ADV-01  │ 8名    │ 85点   │ 35回   │ [詳細]   │
└──────────────┴─────────┴────────┴────────┴────────┴──────────┘
```

---

### 2. クラス別生徒一覧＆概要ビュー

**パス**: `/teacher/classes/[class_id]/students`

```
┌─────────────────────────────────────────────────────────────────┐
│ 📚 クラス: 2025春期クラスA (2025-S-A)                            │
├─────────────────────────────────────────────────────────────────┤
│ 登録生徒数: 15名 | アクティブ: 12名 | 要注意: 2名 | 停滞: 1名  │
│ 平均スコア: 78.2点 (+3.1↑) | 今週の総練習回数: 42回           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 👥 生徒一覧                    [🔍検索] [📊CSV出力] [🔄更新]   │
├──────┬────────┬────────┬────────┬────────┬────────┬──────────┤
│ 状態 │ 名前    │ストリーク│ 今週  │ 平均   │ 最終   │ アクション│
│      │        │         │ 練習数 │ スコア │ 練習日  │          │
├──────┼────────┼────────┼────────┼────────┼────────┼──────────┤
│ ✅   │田中太郎 │🔥 12日  │ 4回   │ 82点   │ 今日    │ [詳細]   │
│ ⚠️   │鈴木花子 │🔥 2日   │ 1回   │ 68点   │ 3日前   │ [詳細]   │
│ 🔴   │佐藤次郎 │ - 0日   │ 0回   │ 55点   │ 10日前  │ [詳細]   │
│ ✅   │山田美咲 │🔥 25日  │ 5回   │ 88点   │ 今日    │ [詳細]   │
└──────┴────────┴────────┴────────┴────────┴────────┴──────────┘

ステータス凡例:
✅ アクティブ (3日以内に練習)
⚠️ 要注意 (4-7日練習なし)
🔴 停滞 (8日以上練習なし)
```

**フィルタリング・ソート機能**:
- ステータスフィルタ（アクティブ/要注意/停滞）
- ソート（名前/ストリーク/スコア/最終練習日）
- 検索（名前、メールアドレス）

---

### 3. 全担当生徒一覧ビュー（複数クラス統合）

**パス**: `/teacher/students`

```
┌─────────────────────────────────────────────────────────────────┐
│ 👥 全担当生徒                  [🏷クラスフィルタ▼] [🔍検索]    │
├──────┬────────┬──────────┬────────┬────────┬────────┬────────┤
│ 状態 │ 名前    │ クラス    │ストリーク│ 今週  │ 平均   │ 最終   │
│      │        │          │         │ 練習数 │ スコア │ 練習日  │
├──────┼────────┼──────────┼────────┼────────┼────────┼────────┤
│ ✅   │田中太郎 │2025春期A  │🔥 12日  │ 4回   │ 82点   │ 今日   │
│ ⚠️   │鈴木花子 │2025春期A  │🔥 2日   │ 1回   │ 68点   │ 3日前  │
│ ✅   │高橋春樹 │N3レベル   │🔥 8日   │ 3回   │ 75点   │ 昨日   │
│ 🔴   │佐藤次郎 │2025春期A  │ - 0日   │ 0回   │ 55点   │10日前  │
└──────┴────────┴──────────┴────────┴────────┴────────┴────────┘
```

**クラスフィルタ**:
- すべてのクラス
- 2025春期クラスA
- N3レベルクラス
- 上級会話クラス

---

### 4. 生徒詳細ビュー

**パス**: `/teacher/students/[student_id]`

#### 4.1 基本情報＆サマリー

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 田中太郎 (tanaka.taro@i-seifu.jp)                        │
├─────────────────────────────────────────────────────────────┤
│ 🔥 ストリーク: 12日連続 (最長: 18日)                        │
│ 📊 総練習回数: 45回 | 総練習時間: 2時間15分                 │
│ ⭐ 平均スコア: 82点 | 最高スコア: 95点                      │
│ 📅 登録日: 2025-09-15 | 最終練習: 2025-11-18 14:32         │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2 スコア推移グラフ

```
┌─────────────────────────────────────────────────────────────┐
│ 📈 スコア推移（直近30日）                                    │
├─────────────────────────────────────────────────────────────┤
│  100 ┤                                    ●                 │
│   90 ┤               ●        ●       ●       ●             │
│   80 ┤          ●        ●        ●                ●        │
│   70 ┤      ●                                               │
│   60 ┤  ●                                                   │
│   50 ┤                                                      │
│      └──────────────────────────────────────────────────── │
│       10/19  10/26  11/2   11/9   11/16                     │
│                                                              │
│ 📊 カテゴリ別平均:                                           │
│   自己紹介: 85点 | 日常・趣味: 82点 | 意見・提案: 78点      │
└─────────────────────────────────────────────────────────────┘
```

#### 4.3 練習履歴一覧

```
┌─────────────────────────────────────────────────────────────┐
│ 📝 練習履歴（全45件）           [📅期間フィルタ] [🏷カテゴリ] │
├──────┬──────────┬──────────────┬───────┬─────────────────┤
│ 日時  │ トピック  │ カテゴリ      │ スコア │ フィードバック   │
├──────┼──────────┼──────────────┼───────┼─────────────────┤
│11/18 │自己紹介   │ 自己紹介      │ 88点  │ [詳細を見る] 🎧 │
│14:32 │          │              │       │                 │
├──────┼──────────┼──────────────┼───────┼─────────────────┤
│11/17 │好きな食べ │ 日常・趣味    │ 82点  │ [詳細を見る] 🎧 │
│09:15 │物        │              │       │                 │
├──────┼──────────┼──────────────┼───────┼─────────────────┤
│11/16 │環境問題   │ 意見・提案    │ 75点  │ [詳細を見る] 🎧 │
│20:45 │          │              │       │                 │
└──────┴──────────┴──────────────┴───────┴─────────────────┘
```

#### 4.4 個別練習詳細（モーダル/別ページ）

```
┌─────────────────────────────────────────────────────────────┐
│ 🎧 練習詳細: 自己紹介 (2025-11-18 14:32)                     │
├─────────────────────────────────────────────────────────────┤
│ 📌 トピック: 自己紹介                                        │
│ 🏷 カテゴリ: 自己紹介                                        │
│ ⭐ 総合スコア: 88点                                          │
│                                                              │
│ ─────────────────────────────────────                        │
│ 🎤 録音データ:                                               │
│ [▶️ 再生] (0:00 / 1:23) [⬇️ ダウンロード]                   │
│                                                              │
│ ─────────────────────────────────────                        │
│ 📝 文字起こし:                                               │
│ 「こんにちは。私の名前は田中太郎です。大阪から来ました。      │
│ 趣味は音楽を聞くことです。将来は国際ビジネスの仕事を         │
│ したいと思っています。よろしくお願いします。」               │
│                                                              │
│ ─────────────────────────────────────                        │
│ 🤖 AIフィードバック:                                         │
│                                                              │
│ ✅ 良かった点:                                               │
│ • 明瞭な発音で聞き取りやすい                                 │
│ • 適切な敬語の使用                                           │
│ • 話の構成が論理的                                           │
│                                                              │
│ 💡 改善点:                                                   │
│ • 「聞く」→「聴く」がより適切                               │
│ • 「国際的な」を追加するとより自然                           │
│                                                              │
│ 📊 詳細スコア:                                               │
│ • 流暢さ: 85点                                               │
│ • 発音: 90点                                                 │
│ • 語彙: 88点                                                 │
│ • 文法: 90点                                                 │
│                                                              │
│ ─────────────────────────────────────                        │
│ 📝 講師メモ（非公開）:                                       │
│ [テキストエリア]                                             │
│ 「発音が前回より改善している。次は抽象的なトピックに         │
│ チャレンジしてもらいたい。」                                 │
│                                                              │
│ [💾 メモを保存]                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. クラス統計ビュー

**パス**: `/teacher/analytics`

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 クラス全体の統計分析                    [📅 期間: 直近30日] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 🎯 主要指標                                                  │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ アクティブ │ 平均スコア │ 総練習回数│ 継続率   │              │
│ │   率      │          │          │ (7日)    │              │
│ ├──────────┼──────────┼──────────┼──────────┤              │
│ │  72%     │  76.5点  │  268回   │  68%     │              │
│ │  (+5%)   │  (+2.3)  │  (+45)   │  (+12%)  │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
│                                                              │
│ ─────────────────────────────────────                        │
│ 📈 週別練習回数推移                                          │
│  80┤                                           ●            │
│  60┤                        ●        ●                      │
│  40┤          ●        ●                                    │
│  20┤     ●                                                  │
│   0└────────────────────────────────────                    │
│     W1    W2    W3    W4    W5                              │
│                                                              │
│ ─────────────────────────────────────                        │
│ 🏆 トップパフォーマー（今週）                                │
│ 1. 山田美咲 (5回, 平均88点)                                  │
│ 2. 田中太郎 (4回, 平均82点)                                  │
│ 3. 高橋春樹 (4回, 平均80点)                                  │
│                                                              │
│ ─────────────────────────────────────                        │
│ ⚠️ 要注意生徒（7日以上未練習）                               │
│ • 佐藤次郎 (最終: 10日前, 平均55点)                          │
│ • 伊藤夏美 (最終: 8日前, 平均62点)                           │
│ • 加藤秋人 (最終: 7日前, 平均58点)                           │
│                                                              │
│ ─────────────────────────────────────                        │
│ 📂 カテゴリ別難易度分析                                      │
│ 自己紹介:    ████████░░ 80点 (簡単)                         │
│ 日常・趣味:  ███████░░░ 75点 (普通)                         │
│ 意見・提案:  █████░░░░░ 68点 (難しい) ← 要強化              │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. 通知＆アラート機能

```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 通知センター                                   [既読にする] │
├─────────────────────────────────────────────────────────────┤
│ 🔴 佐藤次郎さんが10日間練習していません (2時間前)           │
│ ⚠️ 鈴木花子さんのスコアが3回連続で60点未満です (1日前)      │
│ ✅ 山田美咲さんが25日ストリーク達成しました！ (2日前)       │
│ 📊 週次レポートが利用可能です (3日前)                        │
└─────────────────────────────────────────────────────────────┘
```

**アラートトリガー**:
- 生徒が7日以上未練習
- ストリークが途切れた（特に長期ストリーク）
- スコアが3回連続で60点未満
- マイルストーン達成（10/25/50/100回練習、ストリーク記録更新）

---

### 7. レポート出力機能

**出力形式**: CSV, PDF

**週次レポート内容**:
```
┌─────────────────────────────────────────┐
│ 📄 週次レポート (2025-11-11 〜 11-17)   │
├─────────────────────────────────────────┤
│ • 生徒別練習回数・平均スコア            │
│ • 新規練習開始者                        │
│ • 停滞生徒リスト                        │
│ • カテゴリ別スコア分布                  │
│ • 先週比の増減率                        │
└─────────────────────────────────────────┘
```

---

## 🗄️ データベース設計

### 新規テーブル

#### 1. `teachers` テーブル
講師アカウント情報

```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT,  -- 所属部署
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS設定
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own profile" ON teachers
  FOR SELECT USING (auth.uid() = user_id);
```

#### 2. `classes` テーブル
クラス情報

```sql
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

-- RLS設定
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
```

#### 3. `teacher_class_assignments` テーブル
講師とクラスの紐付け（担任）

```sql
CREATE TABLE teacher_class_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'homeroom_teacher',  -- 'homeroom_teacher', 'assistant', 'supervisor'
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),  -- 誰が割り当てたか

  UNIQUE(teacher_id, class_id)
);

-- RLS設定
ALTER TABLE teacher_class_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own class assignments" ON teacher_class_assignments
  FOR SELECT USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );
```

#### 4. `student_class_assignments` テーブル
生徒とクラスの紐付け

```sql
CREATE TABLE student_class_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',  -- 'active', 'completed', 'withdrawn'

  UNIQUE(student_id, class_id)
);

-- RLS設定
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
```

#### 5. `teacher_notes` テーブル
講師が生徒の練習に対して記録するメモ（非公開）

```sql
CREATE TABLE teacher_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  speech_id UUID REFERENCES speeches(id) ON DELETE CASCADE,  -- 対象の練習
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS設定
ALTER TABLE teacher_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own notes" ON teacher_notes
  FOR ALL USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );
```

#### 6. `teacher_alerts` テーブル
講師向け通知・アラート

```sql
CREATE TABLE teacher_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,  -- 'inactive_7days', 'low_score_streak', 'milestone'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS設定
ALTER TABLE teacher_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own alerts" ON teacher_alerts
  FOR SELECT USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );

CREATE POLICY "Teachers can update own alerts" ON teacher_alerts
  FOR UPDATE USING (
    teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  );
```

### 既存テーブルの拡張

#### `auth.users` テーブル
ユーザーの役割を区別

```sql
-- メタデータにroleを追加（Supabase Auth）
-- user_metadata: { role: 'student' | 'teacher' | 'admin' }
```

---

## 🔌 API設計

### エンドポイント一覧

#### 1. 担当クラス一覧取得
```typescript
GET /api/teacher/classes

Response:
{
  classes: [
    {
      id: string,
      name: string,
      code: string,
      description: string,
      academic_year: string,
      semester: string,
      student_count: number,
      active_student_count: number,
      average_score: number,
      is_active: boolean
    }
  ]
}
```

#### 2. クラスの生徒一覧取得
```typescript
GET /api/teacher/classes/[class_id]/students

Response:
{
  class: {
    id: string,
    name: string,
    code: string
  },
  students: [
    {
      id: string,
      name: string,
      email: string,
      status: 'active' | 'warning' | 'inactive',
      current_streak: number,
      this_week_practices: number,
      average_score: number,
      last_practice_date: string,
      total_practices: number
    }
  ],
  summary: {
    total_students: number,
    active_students: number,
    warning_students: number,
    inactive_students: number,
    class_average_score: number,
    this_week_total_practices: number
  }
}
```

#### 3. 全担当生徒一覧取得（複数クラス統合）
```typescript
GET /api/teacher/students?class_id=[optional_class_id]

// class_idを指定した場合は特定クラスのみ、指定しない場合は全担当クラスの生徒

Response:
{
  students: [
    {
      id: string,
      name: string,
      email: string,
      class_id: string,
      class_name: string,
      status: 'active' | 'warning' | 'inactive',
      current_streak: number,
      this_week_practices: number,
      average_score: number,
      last_practice_date: string,
      total_practices: number
    }
  ],
  summary: {
    total_students: number,
    active_students: number,
    warning_students: number,
    inactive_students: number,
    class_average_score: number,
    this_week_total_practices: number
  }
}
```

#### 4. 生徒詳細取得
```typescript
GET /api/teacher/students/[student_id]

Response:
{
  student: {
    id: string,
    name: string,
    email: string,
    registered_at: string,
    last_practice_date: string
  },
  stats: {
    total_practices: number,
    total_duration_minutes: number,
    average_score: number,
    best_score: number,
    current_streak: number,
    longest_streak: number,
    category_stats: [
      {
        category: string,
        average_score: number,
        practice_count: number
      }
    ]
  },
  recent_practices: [
    {
      id: string,
      topic_id: string,
      topic_title: string,
      category: string,
      score: number,
      created_at: string,
      duration_seconds: number
    }
  ],
  score_trend: [
    { date: string, score: number }
  ]
}
```

#### 5. 練習詳細取得（音声再生用）
```typescript
GET /api/teacher/practices/[speech_id]

Response:
{
  practice: {
    id: string,
    student_id: string,
    student_name: string,
    topic_id: string,
    topic_title: string,
    category: string,
    audio_url: string,  // 署名付きURL（有効期限付き）
    transcript: string,
    feedback: {
      score: number,
      good_points: string[],
      improvements: string[],
      detailed_scores: {
        fluency: number,
        pronunciation: number,
        vocabulary: number,
        grammar: number
      }
    },
    created_at: string,
    duration_seconds: number
  },
  teacher_note: {
    id: string,
    note: string,
    updated_at: string
  } | null
}
```

#### 6. 講師メモ保存
```typescript
POST /api/teacher/notes

Body:
{
  student_id: string,
  speech_id: string,
  note: string
}

Response:
{
  success: boolean,
  note_id: string
}
```

#### 7. クラス統計取得
```typescript
GET /api/teacher/analytics?period=30

Response:
{
  summary: {
    active_rate: number,
    average_score: number,
    total_practices: number,
    retention_rate_7days: number
  },
  weekly_trend: [
    { week: string, practice_count: number }
  ],
  top_performers: [
    {
      student_name: string,
      practice_count: number,
      average_score: number
    }
  ],
  at_risk_students: [
    {
      student_id: string,
      student_name: string,
      days_since_last_practice: number,
      average_score: number
    }
  ],
  category_difficulty: [
    {
      category: string,
      average_score: number,
      difficulty: 'easy' | 'medium' | 'hard'
    }
  ]
}
```

#### 8. アラート一覧取得
```typescript
GET /api/teacher/alerts?unread_only=true

Response:
{
  alerts: [
    {
      id: string,
      student_id: string,
      student_name: string,
      alert_type: string,
      message: string,
      is_read: boolean,
      created_at: string
    }
  ]
}
```

#### 9. アラート既読化
```typescript
PATCH /api/teacher/alerts/[alert_id]/read

Response:
{
  success: boolean
}
```

#### 10. レポート出力
```typescript
GET /api/teacher/reports/weekly?format=csv&start_date=2025-11-11&end_date=2025-11-17

Response:
CSV or PDF file download
```

---

## 🔐 セキュリティ＆権限管理

### 認証・認可フロー

```typescript
// ミドルウェアで講師権限チェック
export async function middleware(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect('/auth/login');
  }

  // user_metadataで役割確認
  const role = user.user_metadata?.role;

  if (request.nextUrl.pathname.startsWith('/teacher')) {
    if (role !== 'teacher' && role !== 'admin') {
      return NextResponse.redirect('/dashboard');  // 生徒ダッシュボードへ
    }
  }

  return NextResponse.next();
}
```

### RLS（Row Level Security）ポリシー

**原則**:
1. 講師は自分が担任を務めるクラスの生徒のデータのみ閲覧可能
2. 生徒は講師メモを見ることができない
3. 音声データへのアクセスは署名付きURL（有効期限付き）

**speeches テーブルの拡張ポリシー**:
```sql
-- 講師が担当クラスの生徒の練習データを閲覧可能
CREATE POLICY "Teachers can view class students' speeches" ON speeches
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
```

### 音声ファイルアクセス制御

```typescript
// 署名付きURL生成（有効期限: 1時間）
async function getSignedAudioUrl(speechId: string, teacherId: string) {
  const supabase = createServerClient();

  // 1. 講師が担当するクラスの生徒IDリストを取得
  const { data: teacherClasses } = await supabase
    .from('teacher_class_assignments')
    .select('class_id')
    .eq('teacher_id', teacherId);

  if (!teacherClasses || teacherClasses.length === 0) {
    throw new Error('No assigned classes');
  }

  const classIds = teacherClasses.map(tc => tc.class_id);

  // 2. 担当クラスの生徒IDリストを取得
  const { data: students } = await supabase
    .from('student_class_assignments')
    .select('student_id')
    .in('class_id', classIds);

  if (!students || students.length === 0) {
    throw new Error('No students in assigned classes');
  }

  const studentIds = students.map(s => s.student_id);

  // 3. 練習データが担当クラスの生徒のものか確認
  const { data: speech } = await supabase
    .from('speeches')
    .select('user_id, audio_path')
    .eq('id', speechId)
    .single();

  if (!studentIds.includes(speech.user_id)) {
    throw new Error('Unauthorized: Student not in assigned classes');
  }

  // 4. 署名付きURL生成
  const { data: signedUrl } = await supabase.storage
    .from('audio-recordings')
    .createSignedUrl(speech.audio_path, 3600);  // 1時間有効

  return signedUrl;
}
```

---

## 📱 画面遷移図

```
/teacher (講師ダッシュボード TOP)
│
├─ /teacher/classes (担当クラス一覧)
│   │
│   └─ /teacher/classes/[class_id]/students (クラスの生徒一覧)
│       │
│       └─ /teacher/students/[student_id] (生徒詳細)
│           │
│           └─ Modal: 練習詳細 (音声再生、メモ入力)
│
├─ /teacher/students (全担当生徒一覧)
│   │
│   └─ /teacher/students/[student_id] (生徒詳細)
│       │
│       └─ Modal: 練習詳細 (音声再生、メモ入力)
│
├─ /teacher/analytics (クラス統計)
│
├─ /teacher/alerts (通知センター)
│
└─ /teacher/reports (レポート出力)
```

---

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **React Server Components** (データ取得の効率化)
- **TailwindCSS** (スタイリング)
- **Chart.js / react-chartjs-2** (グラフ表示)
- **Wavesurfer.js** (音声波形表示・再生)

### バックエンド
- **Next.js API Routes**
- **Supabase**
  - PostgreSQL (データベース)
  - Row Level Security (権限管理)
  - Storage (音声ファイル、署名付きURL)
  - Realtime (オプション: リアルタイム通知)

### その他
- **CSV生成**: `papaparse`
- **PDF生成**: `jsPDF` or `react-pdf`

---

## 📅 実装計画

### Phase 1: 基盤構築（1週間）
- [ ] データベーステーブル作成
  - `teachers`: 講師情報
  - `classes`: クラス情報
  - `teacher_class_assignments`: 講師とクラスの紐付け
  - `student_class_assignments`: 生徒とクラスの紐付け
  - `teacher_notes`: 講師メモ
  - `teacher_alerts`: 通知・アラート
- [ ] RLSポリシー設定（全テーブル）
- [ ] 認証・認可ミドルウェア実装
- [ ] 講師アカウント作成フロー
- [ ] クラス作成・管理機能

### Phase 2: クラス管理＆生徒一覧ビュー（1.5週間）
- [ ] `/teacher/classes` ページ実装
  - 担当クラス一覧
  - クラス別統計表示
  - クラス選択機能

- [ ] `/teacher/classes/[class_id]/students` ページ実装
  - クラスの生徒一覧テーブル
  - フィルタリング・ソート機能
  - ステータス表示（アクティブ/要注意/停滞）

- [ ] `/teacher/students` ページ実装（全担当生徒統合ビュー）
  - 複数クラスの生徒を統合表示
  - クラスフィルタ機能

- [ ] `/teacher/students/[student_id]` ページ実装
  - サマリー表示
  - スコア推移グラフ
  - 練習履歴一覧

### Phase 3: 練習詳細＆メモ機能（4日間）
- [ ] 練習詳細モーダル実装
  - 音声再生プレイヤー（Wavesurfer.js）
  - 文字起こし・フィードバック表示
  - 講師メモ入力・保存機能

- [ ] API実装
  - `GET /api/teacher/practices/[speech_id]`
  - `POST /api/teacher/notes`

### Phase 4: クラス統計＆アラート（5日間）
- [ ] `/teacher/analytics` ページ実装
  - 主要指標サマリー
  - 週別練習推移グラフ
  - トップパフォーマー表示
  - 要注意生徒リスト
  - カテゴリ別難易度分析

- [ ] アラートシステム実装
  - バックグラウンドジョブ（Cron）で自動生成
  - 通知センターUI
  - 既読管理

### Phase 5: レポート出力（3日間）
- [ ] CSV出力機能
- [ ] PDF出力機能（オプション）
- [ ] 週次レポート自動送信（メール）

### Phase 6: テスト＆リファインメント（3日間）
- [ ] 単体テスト
- [ ] 統合テスト
- [ ] 権限テスト（RLS検証）
- [ ] パフォーマンス最適化
- [ ] UIブラッシュアップ

**総所要期間**: 約3-4週間

---

## 🚀 今後の拡張案

### 1. リアルタイム通知
- Supabase Realtime購読で、生徒が練習完了した瞬間に通知
- ブラウザプッシュ通知対応

### 2. 一括メッセージ送信
- 選択した生徒に一斉メール送信
- テンプレート機能（励まし、注意喚起など）

### 3. 目標設定＆トラッキング
- 講師が生徒ごとに目標設定（週3回練習、平均75点など）
- 目標達成率の可視化

### 4. カスタムトピック作成
- 講師がオリジナルトピックを作成
- 特定の生徒に割り当て

### 5. コメント機能
- 講師が練習に対して直接コメント
- 生徒がダッシュボードでコメント確認

### 6. クラス比較分析
- 複数クラスを担当している場合、クラス間比較
- A/Bテスト（指導方法の効果測定）

### 7. 音声比較機能
- 同じトピックの過去の録音と最新の録音を並べて再生
- 成長の可視化

### 8. AIアシスタント
- 「この生徒にどのトピックを推奨すべきか」提案
- 自動レポート生成

---

## 💰 コスト見積もり

### 追加コスト

| 項目 | 月額コスト（50生徒） | 備考 |
|------|---------------------|------|
| Supabase Storage（音声再生）| ¥0 | 無料枠内（1GB） |
| データベース容量 | ¥0 | 無料枠内 |
| API呼び出し | ¥0 | 無料枠内 |
| メール送信（週次レポート） | ¥0 | SendGrid無料枠 |
| **合計追加コスト** | **¥0/月** | 既存インフラ内で実現可能 |

---

## 📝 まとめ

### 実装する価値
1. **講師の業務効率化**: 個別確認の手間が大幅削減
2. **生徒の学習成果向上**: 早期介入で停滞を防止
3. **データドリブン教育**: 客観的データに基づく指導
4. **追加コスト不要**: 既存インフラで実現可能

### 重要な考慮事項
- **プライバシー保護**: 生徒の音声データは厳格に管理
- **権限管理**: 講師は担当生徒のみアクセス可能
- **ユーザビリティ**: 直感的で使いやすいUI設計
- **パフォーマンス**: 大量データでも高速表示

---

**作成日**: 2025-11-18
**バージョン**: 1.0
**ステータス**: 設計完了、実装待ち
