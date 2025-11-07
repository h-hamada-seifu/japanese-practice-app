# 日本語発話練習アプリ - 設計書

## 1. プロジェクト概要

### 1.1 目的

留学生（JLPT N2-N3レベル）がスマートフォンで日本語の発話練習を行い、AIによるフィードバックを受けられるアプリケーション。

### 1.2 主要機能

- 🎤 **音声録音**: スマホのマイクで日本語を録音
- 🔊 **音声認識**: Google Speech-to-Text APIで文字起こし
- 🤖 **AI添削**: Gemini 2.0 Flash APIで文法・表現をチェック
- 📊 **フィードバック表示**: 良い点・改善点を分かりやすく提示
- 📝 **発話履歴**: 過去の練習記録を保存・確認
- 🔐 **認証**: i-seifu.jp / i-seifu.ac.jp ドメイン限定

### 1.3 ターゲットユーザー

- 清風情報工科学院の留学生
- 日本語レベル: JLPT N2-N3
- デバイス: スマートフォン（iOS/Android）

---

## 2. システムアーキテクチャ

### 2.1 全体構成

```
┌─────────────────┐
│   ユーザー      │
│  (スマートフォン) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Vercel        │
│  (Next.js 14)   │
│                 │
│  - Frontend     │
│  - API Routes   │
└────────┬────────┘
         │
         ├──────→ Supabase Auth (Google認証)
         │         - ドメイン制限: @i-seifu.jp, @i-seifu.ac.jp
         │
         ├──────→ Supabase DB (PostgreSQL)
         │         - users / speeches / topics
         │
         ├──────→ Supabase Storage
         │         - 音声ファイル保存
         │
         ├──────→ Google Speech-to-Text API
         │         - 無料枠: 60分/月
         │
         └──────→ Gemini 2.0 Flash API
                   - フィードバック生成
                   - コスト: 約10円/月（50人×10回想定）
```

### 2.2 技術スタック

| 分類       | 技術                        | 理由                         |
| ---------- | --------------------------- | ---------------------------- |
| Frontend   | Next.js 14 (App Router)     | VercelとSupabaseの統合が容易 |
| Language   | TypeScript                  | 型安全性、開発効率           |
| Styling    | Tailwind CSS                | 迅速なUI構築                 |
| Backend    | Vercel Serverless Functions | サーバーレスで低コスト       |
| Database   | Supabase (PostgreSQL)       | 既存システムと統一           |
| Auth       | Supabase Auth               | Google認証、ドメイン制限     |
| Storage    | Supabase Storage            | 音声ファイル保存             |
| 音声認識   | Google Speech-to-Text       | 高精度、無料枠あり           |
| AI         | Gemini 2.0 Flash            | 超低コスト、高性能           |
| Deployment | Vercel                      | 自動デプロイ、無料枠十分     |

---

## 3. データベース設計

### 3.1 テーブル構成

#### 3.1.1 users テーブル

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  jlpt_level TEXT CHECK (jlpt_level IN ('N3', 'N2')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### 3.1.2 topics テーブル（話題マスタ）

```sql
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

-- RLS設定
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics are viewable by authenticated users"
  ON topics FOR SELECT
  TO authenticated
  USING (is_active = true);
```

#### 3.1.3 speeches テーブル（発話記録）

```sql
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

-- インデックス
CREATE INDEX idx_speeches_user_id ON speeches(user_id);
CREATE INDEX idx_speeches_topic_id ON speeches(topic_id);
CREATE INDEX idx_speeches_created_at ON speeches(created_at DESC);

-- RLS設定
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
```

### 3.2 ストレージ構成

#### Bucket: speech-audio

```
パス構造:
/speeches/{userId}/{speechId}.webm

セキュリティルール:
- 認証済みユーザーのみアクセス可
- 自分のファイルのみ読み書き可
```

---

## 4. 話題データ（15題）

### 4.1 カテゴリー1: 日常・趣味

```sql
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
```

### 4.2 カテゴリー2: 説明・経験

```sql
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
```

### 4.3 カテゴリー3: 意見・提案

```sql
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
```

---

## 5. API設計

### 5.1 認証API

#### POST /api/auth/signin

Google OAuth認証のコールバック処理

**リクエスト**:

```typescript
// Supabase AuthのGoogle認証フロー
```

**レスポンス**:

```typescript
{
  user: {
    id: string;
    email: string;
    displayName: string;
  }
  session: Session;
}
```

#### POST /api/auth/signout

ログアウト処理

---

### 5.2 話題取得API

#### GET /api/topics

話題一覧を取得

**クエリパラメータ**:

- `category?: string` - カテゴリーでフィルター
- `level?: 'N3' | 'N2'` - レベルでフィルター

**レスポンス**:

```typescript
{
  topics: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    hints: string[];
    targetLevel: string;
    displayOrder: number;
  }>;
}
```

---

### 5.3 音声処理API

#### POST /api/speech/upload

音声ファイルをアップロードし、文字起こしとフィードバック生成

**リクエスト**:

```typescript
Content-Type: multipart/form-data

{
  audio: File;  // webm形式
  topicId: string;
  topicTitle: string;
  duration: number;  // 秒
}
```

**処理フロー**:

1. Supabase Storageに音声ファイル保存
2. Google Speech-to-Text APIで文字起こし
3. Gemini 2.0 Flash APIでフィードバック生成
4. Supabase DBに保存

**レスポンス**:

```typescript
{
  speechId: string;
  audioUrl: string;
  transcription: string;
  feedback: {
    goodPoints: string[];
    improvements: string[];
    correctedText: string;
    score: number;  // 0-100
  };
  duration: number;
}
```

---

### 5.4 履歴取得API

#### GET /api/speeches

ユーザーの発話履歴を取得

**クエリパラメータ**:

- `limit?: number` - 取得件数（デフォルト: 20）
- `offset?: number` - オフセット
- `topicId?: string` - 話題IDでフィルター

**レスポンス**:

```typescript
{
  speeches: Array<{
    id: string;
    topicTitle: string;
    transcription: string;
    feedback: Feedback;
    duration: number;
    createdAt: string;
  }>;
  total: number;
}
```

#### GET /api/speeches/:id

特定の発話詳細を取得

---

### 5.5 外部API連携

#### Google Speech-to-Text API

```typescript
// lib/services/speechToText.ts

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const client = new SpeechClient({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    },
  });

  const audio = {
    content: audioBuffer.toString('base64'),
  };

  const config = {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    languageCode: 'ja-JP',
    model: 'latest_long',
    enableAutomaticPunctuation: true,
  };

  const [response] = await client.recognize({ audio, config });
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join('');

  return transcription;
}
```

#### Gemini 2.0 Flash API

```typescript
// lib/services/feedbackGenerator.ts

export async function generateFeedback(
  transcription: string,
  topicTitle: string
): Promise<Feedback> {
  const prompt = `
あなたは日本語教師です。JLPT N2-N3レベルの留学生の発話を添削してください。

【話題】${topicTitle}
【学生の発話】
${transcription}

【出力形式】
以下のJSON形式で返してください:
{
  "goodPoints": ["良い点1", "良い点2"],
  "improvements": ["改善点1", "改善点2"],
  "correctedText": "修正後の文章",
  "score": 85
}

【添削のポイント】
- 文法の誤り（助詞、活用、語順など）
- 不自然な表現や語彙の選択
- より適切な語彙・表現の提案
- 肯定的なフィードバックも必ず含める
- スコアは文法・語彙・自然さを総合して100点満点で評価
`;

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  const data = await response.json();
  const feedbackText = data.contents[0].parts[0].text;
  return JSON.parse(feedbackText);
}
```

---

## 6. UI/UX設計

### 6.1 画面構成

#### 6.1.1 ログイン画面（/）

```
┌─────────────────────────┐
│                         │
│   🎤 日本語練習アプリ    │
│                         │
│  留学生のための          │
│  発話練習ツール          │
│                         │
│  [Googleでログイン]      │
│                         │
│  ※ @i-seifu.jp / .ac.jp │
│    のアカウントのみ      │
└─────────────────────────┘
```

#### 6.1.2 話題選択画面（/topics）

```
┌─────────────────────────┐
│ ← [プロフィール]         │
├─────────────────────────┤
│ カテゴリーを選んでね     │
├─────────────────────────┤
│ 🍜 日常・趣味           │
│    気軽に話せる話題     │
│    ────────────────     │
│    [5題]                │
├─────────────────────────┤
│ 🗾 説明・経験           │
│    少し考える話題       │
│    ────────────────     │
│    [5題]                │
├─────────────────────────┤
│ 💡 意見・提案           │
│    自分の考えを話す     │
│    ────────────────     │
│    [5題]                │
└─────────────────────────┘
```

#### 6.1.3 話題リスト画面（/topics/:category）

```
┌─────────────────────────┐
│ ← 日常・趣味            │
├─────────────────────────┤
│                         │
│ 1. 好きな食べ物         │
│    あなたの好きな...    │
│    [練習する]           │
│                         │
│ 2. 週末の過ごし方       │
│    先週末は何を...      │
│    [練習する]           │
│                         │
│ 3. 最近買ったもの       │
│    最近買ったもの...    │
│    [練習する]           │
│                         │
└─────────────────────────┘
```

#### 6.1.4 録音画面（/record/:topicId）

```
┌─────────────────────────┐
│ ← 好きな食べ物          │
├─────────────────────────┤
│                         │
│ あなたの好きな食べ物に  │
│ ついて教えてください    │
│                         │
│ 💡 ヒント:              │
│ ・どんな味ですか？      │
│ ・いつ食べますか？      │
│ ・どこで食べられますか？│
│                         │
│      🎤                 │
│   [録音開始]            │
│                         │
│   00:00 / 01:00         │
│   目安: 30秒〜1分       │
│                         │
└─────────────────────────┘

録音中:
┌─────────────────────────┐
│                         │
│      🔴                 │
│   録音中...             │
│                         │
│      00:23              │
│                         │
│   [停止]                │
│                         │
└─────────────────────────┘

録音完了:
┌─────────────────────────┐
│                         │
│      ✓                  │
│   録音完了！            │
│                         │
│   [聞き直す]            │
│   [送信する]            │
│                         │
└─────────────────────────┘
```

#### 6.1.5 処理中画面

```
┌─────────────────────────┐
│                         │
│      🔄                 │
│   分析中です...         │
│                         │
│   あなたの日本語を      │
│   チェックしています    │
│                         │
│   少々お待ちください    │
│                         │
└─────────────────────────┘
```

#### 6.1.6 結果画面（/result/:speechId）

```
┌─────────────────────────┐
│ ← 結果                  │
├─────────────────────────┤
│ 📊 総合スコア: 85点      │
├─────────────────────────┤
│                         │
│ 🎤 あなたの発話:        │
│ 「私は寿司が大好きです。│
│  特にサーモンが好きで、  │
│  週末よく食べに行きます」│
│                         │
│ ────────────────────    │
│                         │
│ ✅ 良い点:              │
│ • 過去形の使い方が正しい│
│ • 「特に」を使った文が   │
│   自然で良い            │
│ • 時間の表現が適切      │
│                         │
│ ────────────────────    │
│                         │
│ 💡 改善点:              │
│ • 「食べに行きます」より │
│   「食べに行っています」│
│   の方が習慣を表すので  │
│   自然です              │
│                         │
│ ────────────────────    │
│                         │
│ 📝 修正例:              │
│ 「私は寿司が大好きです。│
│  特にサーモンが好きで、  │
│  週末よく食べに行って   │
│  います」               │
│                         │
│ ────────────────────    │
│                         │
│ [もう一度録音]          │
│ [別の話題を選ぶ]        │
│ [履歴を見る]            │
│                         │
└─────────────────────────┘
```

#### 6.1.7 履歴画面（/history）

```
┌─────────────────────────┐
│ ← 練習履歴              │
├─────────────────────────┤
│                         │
│ 📅 今日                 │
│                         │
│ 好きな食べ物            │
│ スコア: 85点            │
│ 14:30                   │
│ [詳細を見る]            │
│                         │
│ ────────────────────    │
│                         │
│ 📅 昨日                 │
│                         │
│ 週末の過ごし方          │
│ スコア: 78点            │
│ 16:15                   │
│ [詳細を見る]            │
│                         │
│ 住んでいる町            │
│ スコア: 82点            │
│ 10:20                   │
│ [詳細を見る]            │
│                         │
└─────────────────────────┘
```

### 6.2 レスポンシブデザイン

- モバイルファースト設計
- 最小幅: 320px (iPhone SE)
- タッチターゲット: 最小44x44px
- フォントサイズ: 16px以上（ズーム防止）

### 6.3 アクセシビリティ

- ARIA属性の適切な使用
- キーボードナビゲーション対応
- 音声読み上げ対応
- カラーコントラスト比 4.5:1以上

---

## 7. セキュリティ

### 7.1 認証・認可

- Supabase Authによる認証
- ドメイン制限: @i-seifu.jp / @i-seifu.ac.jp のみ
- Row Level Security (RLS) による認可
- JWTトークンによるセッション管理

### 7.2 データ保護

- HTTPS通信のみ
- 環境変数での秘密情報管理
- 音声ファイルのアクセス制御
- CORS設定

### 7.3 Rate Limiting

- API呼び出し制限（Vercel Edge Config）
- 音声認識API: 1ユーザーあたり10回/日
- フィードバック生成: 1ユーザーあたり10回/日

---

## 8. コスト試算

### 8.1 月間コスト（学生50人想定）

| サービス              | プラン    | 使用量                  | コスト        |
| --------------------- | --------- | ----------------------- | ------------- |
| Vercel                | 無料      | Bandwidth: ~10GB        | 0円           |
| Supabase              | 無料      | DB: 500MB, Storage: 1GB | 0円           |
| Google Speech-to-Text | 無料+従量 | 100分/月                | ~140円        |
| Gemini 2.0 Flash      | 従量      | 500回/月                | ~10円         |
| **合計**              | -         | -                       | **~150円/月** |

年間: **~1,800円**

### 8.2 スケール時のコスト

学生100人、月20回利用の場合:

- Google Speech-to-Text: ~1,100円/月
- Gemini 2.0 Flash: ~40円/月
- **合計: ~1,200円/月**（年間 ~14,400円）

---

## 9. デプロイ手順

### 9.1 環境変数設定

Vercelダッシュボードで以下を設定:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Speech-to-Text
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Gemini
GEMINI_API_KEY=AIzaSy...
```

### 9.2 デプロイフロー

```bash
# 1. GitHubにプッシュ
git push origin main

# 2. Vercelが自動検知
# 3. ビルド開始
# 4. 本番デプロイ完了
```

### 9.3 データベースマイグレーション

```bash
# Supabase CLIでマイグレーション実行
supabase db push
```

---

## 10. 開発タスク一覧

以下のタスクをGitHub Issueとして作成します。各タスクは独立しており、並列実装が可能です。

### Phase 1: 基盤構築

- [ ] Issue #1: プロジェクトセットアップ（Next.js + TypeScript + Tailwind）
- [ ] Issue #2: Supabase接続設定とクライアント初期化
- [ ] Issue #3: データベースマイグレーション実行
- [ ] Issue #4: 話題マスタデータ投入（15題）
- [ ] Issue #5: 認証機能実装（Google OAuth + ドメイン制限）

### Phase 2: コア機能実装

- [ ] Issue #6: 話題選択UI実装
- [ ] Issue #7: 音声録音UI実装（Web Audio API）
- [ ] Issue #8: 音声アップロード処理実装
- [ ] Issue #9: Google Speech-to-Text API連携
- [ ] Issue #10: Gemini API連携（フィードバック生成）
- [ ] Issue #11: 結果表示UI実装
- [ ] Issue #12: 発話履歴機能実装

### Phase 3: 仕上げ

- [ ] Issue #13: レスポンシブデザイン調整
- [ ] Issue #14: エラーハンドリング実装
- [ ] Issue #15: ローディング状態の改善
- [ ] Issue #16: Vercelデプロイ設定
- [ ] Issue #17: 本番環境テスト

---

## 11. 今後の拡張案

### 短期（1-3ヶ月）

- レベル別の話題追加
- 発音評価機能（音声の抑揚・速度分析）
- 学習進捗ダッシュボード
- 教師用管理画面

### 中期（3-6ヶ月）

- ネイティブ音声のお手本機能
- シャドーイング練習モード
- クラスメイトとのスコア比較機能
- 定型表現の学習コース

### 長期（6ヶ月以降）

- 会話練習モード（AIとの対話）
- ビデオ録画機能（表情・ジェスチャー分析）
- 多言語対応（ベトナム語、中国語UI）
- モバイルアプリ化（React Native）

---

## 12. 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Speech-to-Text API](https://cloud.google.com/speech-to-text/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

**作成日**: 2025-11-07  
**作成者**: Claude (Anthropic)  
**バージョン**: 1.0
