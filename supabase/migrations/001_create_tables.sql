-- ====================================
-- 日本語発話練習アプリ - Database Migration
-- ====================================
-- 作成日: 2025-11-07
-- 説明: users, topics, speechesテーブル、インデックス、RLSポリシーを作成
-- 参照: DESIGN.md

-- ====================================
-- 1. 拡張機能の有効化
-- ====================================

-- UUID生成用の拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- 2. テーブル作成
-- ====================================

-- 2.1 usersテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  jlpt_level TEXT CHECK (jlpt_level IN ('N3', 'N2')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 topicsテーブル（話題マスタ）
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (
    category IN ('日常・趣味', '説明・経験', '意見・提案')
  ),
  title TEXT NOT NULL,
  description TEXT,
  hints TEXT[],
  target_level TEXT CHECK (target_level IN ('N3', 'N2', 'both')),
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 speechesテーブル（発話記録）
CREATE TABLE speeches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id),
  topic_title TEXT NOT NULL,
  audio_url TEXT,
  transcription TEXT NOT NULL,
  feedback JSONB NOT NULL,  -- {goodPoints: [], improvements: [], correctedText: "", score: number}
  duration INTEGER,  -- 秒
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 3. インデックス作成
-- ====================================

-- speechesテーブルのインデックス
CREATE INDEX idx_speeches_user_id ON speeches(user_id);
CREATE INDEX idx_speeches_topic_id ON speeches(topic_id);
CREATE INDEX idx_speeches_created_at ON speeches(created_at DESC);

-- ====================================
-- 4. Row Level Security (RLS) 設定
-- ====================================

-- 4.1 usersテーブルのRLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 4.2 topicsテーブルのRLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics are viewable by authenticated users"
  ON topics FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 4.3 speechesテーブルのRLS
ALTER TABLE speeches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own speeches"
  ON speeches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own speeches"
  ON speeches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own speeches"
  ON speeches FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================
-- 5. 話題マスタデータ投入（15題）
-- ====================================

-- 5.1 カテゴリー1: 日常・趣味（5題）
INSERT INTO topics (category, title, description, hints, target_level, display_order) VALUES
(
  '日常・趣味',
  '好きな食べ物',
  'あなたの好きな食べ物について教えてください',
  ARRAY['どんな味ですか？', 'いつ食べますか？', 'どこで食べられますか？'],
  'both',
  1
),
(
  '日常・趣味',
  '週末の過ごし方',
  '先週末は何をしましたか？',
  ARRAY['いつ', 'どこで', '誰と', '何をした'],
  'both',
  2
),
(
  '日常・趣味',
  '最近買ったもの',
  '最近買ったもので良かったものを紹介してください',
  ARRAY['何を買いましたか？', 'どうして買いましたか？', 'いくらでしたか？'],
  'both',
  3
),
(
  '日常・趣味',
  'ハマっていること',
  '最近ハマっていることや趣味について話してください',
  ARRAY['いつから始めましたか？', 'どんなところが面白いですか？'],
  'both',
  4
),
(
  '日常・趣味',
  '好きな音楽やアーティスト',
  'あなたの好きな音楽やアーティストについて教えてください',
  ARRAY['どんなジャンルですか？', 'いつ聞きますか？', 'おすすめの曲は？'],
  'both',
  5
);

-- 5.2 カテゴリー2: 説明・経験（5題）
INSERT INTO topics (category, title, description, hints, target_level, display_order) VALUES
(
  '説明・経験',
  '住んでいる町',
  'あなたが住んでいる町や地域について説明してください',
  ARRAY['どんな場所ですか？', '何がありますか？', '便利なところは？'],
  'both',
  6
),
(
  '説明・経験',
  '母国の有名な場所',
  'あなたの国の有名な場所を紹介してください',
  ARRAY['どこにありますか？', '何が有名ですか？', 'どんな人におすすめですか？'],
  'both',
  7
),
(
  '説明・経験',
  '日本と母国の違い',
  '日本と母国で違うところや驚いたことを話してください',
  ARRAY['どんな違いがありますか？', '最初はどう思いましたか？', '今はどうですか？'],
  'N2',
  8
),
(
  '説明・経験',
  '日本で困ったこと',
  '日本に来て困ったことと、どう解決したか教えてください',
  ARRAY['どんなことに困りましたか？', 'どうやって解決しましたか？', '誰かに助けてもらいましたか？'],
  'N2',
  9
),
(
  '説明・経験',
  '一番楽しかった思い出',
  '日本で一番楽しかった経験について話してください',
  ARRAY['いつのことですか？', 'どんなことをしましたか？', 'なぜ楽しかったですか？'],
  'both',
  10
);

-- 5.3 カテゴリー3: 意見・提案（5題）
INSERT INTO topics (category, title, description, hints, target_level, display_order) VALUES
(
  '意見・提案',
  '卒業後の夢',
  '卒業後、どんな仕事をしたいですか？',
  ARRAY['どんな仕事ですか？', 'どうしてその仕事をしたいですか？', '今、何を勉強していますか？'],
  'both',
  11
),
(
  '意見・提案',
  '日本語学習のコツ',
  '日本語を勉強している後輩にアドバイスするなら？',
  ARRAY['どんな勉強方法がいいですか？', 'どんなことが大切ですか？', '気をつけることは？'],
  'N2',
  12
),
(
  '意見・提案',
  '日本での生活準備',
  'これから日本に来る友達にアドバイスするなら？',
  ARRAY['何を準備したらいいですか？', '知っておくべきことは？', '持ってきた方がいいものは？'],
  'N2',
  13
),
(
  '意見・提案',
  '母国の友達におすすめ',
  '日本のおすすめを母国の友達に紹介するなら？',
  ARRAY['どんな場所・食べ物・体験がおすすめですか？', 'どうしておすすめですか？'],
  'both',
  14
),
(
  '意見・提案',
  '5年後の自分',
  '5年後、あなたはどうなっていたいですか？',
  ARRAY['どこにいますか？', '何をしていますか？', 'そのために今何をしますか？'],
  'N2',
  15
);

-- ====================================
-- 6. ストレージ設定（手動実行が必要）
-- ====================================

-- 注意: 以下はSupabase Dashboardで手動実行してください
--
-- 1. ストレージバケット「speech-audio」を作成
--    - Storage > Create bucket
--    - Name: speech-audio
--    - Public: false
--
-- 2. ストレージポリシーを設定
--    - 認証済みユーザーのみアクセス可能
--    - 自分のファイルのみ読み書き可能
--
-- ポリシー例（Supabase Dashboard > Storage > Policies で設定）:
--
-- Policy name: Users can upload own audio files
-- Target roles: authenticated
-- Policy definition (INSERT):
--   bucket_id = 'speech-audio' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- Policy name: Users can read own audio files
-- Target roles: authenticated
-- Policy definition (SELECT):
--   bucket_id = 'speech-audio' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- Policy name: Users can delete own audio files
-- Target roles: authenticated
-- Policy definition (DELETE):
--   bucket_id = 'speech-audio' AND (storage.foldername(name))[1] = auth.uid()::text

-- ====================================
-- マイグレーション完了
-- ====================================
