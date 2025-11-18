# Phase 1: ストリーク機能とダッシュボード統計の実装

## Summary

Phase 1の実装として、ユーザーの継続的な学習を促進するストリーク機能とダッシュボード統計機能を追加しました。

### 主な変更点

#### 新規作成ファイル

**サービスレイヤー**
- `src/lib/services/streakService.ts` - ストリーク機能
  - `getUserStreak()`: ユーザーのストリークデータ取得
  - `updateStreak()`: 練習完了時のストリーク更新
  - `isStreakAtRisk()`: ストリーク途切れリスク判定
  - 連続日チェック、同日重複検出のロジック

- `src/lib/services/dashboardService.ts` - ダッシュボード統計
  - 総練習回数、平均スコア、最高スコアの計算
  - 7日間のスコア推移データ生成
  - カテゴリ別統計の集計（平均スコア・練習回数）
  - 週次・月次の練習数カウント

**UIコンポーネント**
- `src/components/Dashboard/StreakDisplay.tsx` - ストリーク表示
  - 🔥 現在の連続日数 / 最長記録 / 総練習日数
  - オレンジグラデーション背景
  - 励ましメッセージ表示

- `src/components/Dashboard/StatsCards.tsx` - 統計カード
  - 総練習回数 / 平均スコア / 最高スコア / 今週の練習

- `src/components/Dashboard/ScoreChart.tsx` - スコア推移グラフ
  - Chart.js統合（折れ線グラフ）
  - 過去7日間のスコア推移を可視化

- `src/components/Dashboard/CategoryStats.tsx` - カテゴリ別統計
  - プログレスバーで視覚化
  - カラーコード（緑:80+、青:60+、黄:40+、赤:40未満）

- `src/components/Dashboard/DashboardNav.tsx` - ナビゲーション
  - サインアウト機能

**ドキュメント**
- `DUOLINGO_RETENTION_STRATEGIES.md` (799行)
  - Duolingo式継続率向上戦略の詳細分析
  - 10の施策と期待効果
  - 優先度マトリクスと4フェーズ実装ロードマップ

#### 変更ファイル

- `src/types/database.ts`
  - `user_streaks` テーブルの型定義を追加
  - `UserStreaksRow`, `UserStreaksInsert`, `UserStreaksUpdate`

- `src/app/api/speech/upload/route.ts`
  - 練習完了時に `updateStreak()` を呼び出し
  - エラーハンドリング（致命的エラーではないためログのみ）

- `src/app/dashboard/page.tsx`
  - サーバーコンポーネントとして全面リニューアル
  - ストリーク・統計データの並列取得
  - 5つのダッシュボードコンポーネントの統合

- `package.json` / `package-lock.json`
  - `chart.js` ^4.4.7 追加
  - `react-chartjs-2` ^5.3.0 追加

### 技術的な詳細

**ストリーク計算ロジック**
- `isConsecutiveDay()`: 2つの日付が連続しているかチェック（24時間以内）
- `isSameDay()`: 同日重複練習の検出
- タイムゾーンを考慮した日付比較（時刻を00:00:00にリセット）

**統計データ集計**
- 過去7日間のスコア推移（日別平均）
- カテゴリ別の平均スコアと練習回数
- 週次（過去7日）・月次（過去30日）の練習数

**データベース統合**
- `user_streaks` テーブルへの新規レコード作成
- 既存レコードの更新（連続判定・リセット判定）
- エラーハンドリング（PGRST116: レコード不在時）

### ビルド・テスト状況

- ✅ `npm run build` - ビルド成功
- ✅ `npm run lint` - リンター合格
- ✅ TypeScript型チェック合格

### データベース要件

⚠️ このPRをマージする前に、以下のテーブルがSupabaseに作成されている必要があります：

```sql
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_practice_date DATE,
  total_practice_days INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Row Level Security (RLS) を有効化
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のストリークのみ閲覧可能
CREATE POLICY "Users can view own streak" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のストリークのみ更新可能
CREATE POLICY "Users can update own streak" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のストリークのみ作成可能
CREATE POLICY "Users can insert own streak" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### UI/UX

ダッシュボードには以下の要素が表示されます：

1. **ナビゲーションバー**
   - ユーザーメール表示
   - サインアウトボタン

2. **ストリーク表示** 🔥
   - オレンジ〜赤のグラデーション背景
   - 3つの指標（現在の連続/最長記録/総練習日数）
   - 励ましメッセージ（連続日数に応じて変化）

3. **統計カード** 📊
   - 4つのカード（総練習回数、平均スコア、最高スコア、今週の練習）
   - カラフルな色分け（青、緑、紫、オレンジ）

4. **スコア推移グラフ** 📈
   - 過去7日間の折れ線グラフ
   - Chart.js使用
   - ホバーでスコア表示

5. **カテゴリ別統計** 📂
   - プログレスバーでスコアを視覚化
   - カテゴリ名、平均スコア、練習回数を表示
   - ヒント表示

### 今後の拡張計画

`DUOLINGO_RETENTION_STRATEGIES.md` に詳細な拡張計画が記載されています：

- **Phase 2**: プッシュ通知 + ストリークフリーズ（継続率+40-50%）
- **Phase 3**: リーグシステム + 週次レポート（練習回数+60%）
- **Phase 4**: ソーシャル機能 + パーソナライゼーション（継続率+55%）

期待効果：
- 7日継続率: 30% → 70%
- 30日継続率: 15% → 55%

## Test plan

- [ ] ダッシュボードページ（`/dashboard`）にアクセスできることを確認
- [ ] 初回練習後、ストリークが「1日」と表示されることを確認
- [ ] 連続して練習した場合、ストリークが増加することを確認
- [ ] 1日スキップした場合、ストリークが1にリセットされることを確認
- [ ] 同日に複数回練習してもストリークが重複カウントされないことを確認
- [ ] スコアグラフが正しく表示されることを確認（過去7日間）
- [ ] カテゴリ別統計が正しく集計されることを確認
- [ ] 練習記録がない場合、適切なメッセージが表示されることを確認
- [ ] サインアウトが正常に動作することを確認
- [ ] モバイル表示が適切にレスポンシブであることを確認

## Related Issues

- 継続的な学習促進のための機能提案
- ユーザーエンゲージメント向上

## Screenshots

（実装後、実際のスクリーンショットを追加予定）
