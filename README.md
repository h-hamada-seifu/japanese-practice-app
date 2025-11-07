# 日本語発話練習アプリ

留学生（JLPT N2-N3レベル）がスマートフォンで日本語の発話練習を行い、AIによるフィードバックを受けられるWebアプリケーション。

## 🎯 主要機能

- 🎤 **音声録音**: スマホのマイクで日本語を録音
- 🔊 **音声認識**: Google Speech-to-Text APIで自動文字起こし
- 🤖 **AI添削**: Gemini 2.0 Flash APIで文法・表現をチェック
- 📊 **フィードバック**: 良い点・改善点を分かりやすく提示
- 📝 **履歴管理**: 過去の練習記録を保存・確認
- 🔐 **認証**: i-seifu.jp / i-seifu.ac.jp ドメイン限定

## 📚 話題（15題）

### 日常・趣味（5題）

気軽に話せる日常的な話題

### 説明・経験（5題）

自分の経験や考えを説明する話題

### 意見・提案（5題）

自分の意見やアドバイスを述べる話題

## 🛠 技術スタック

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth)
- **Storage**: Supabase Storage
- **音声認識**: Google Speech-to-Text API
- **AI**: Gemini 2.0 Flash API
- **Deployment**: Vercel

## 📖 ドキュメント

詳細な設計書は [DESIGN.md](./DESIGN.md) を参照してください。

## 🚀 開発の進め方

このプロジェクトは**並列実装**を前提に設計されています。

### 実装の流れ

1. **GitHub Issueを確認**
   - 各タスクが独立したIssueとして登録されています
   - 任意のIssueから着手できます

2. **Claude Web版で実装**
   - Issueの内容に基づいて実装
   - 設計書を参照しながら開発

3. **ローカルに配置してプッシュ**
   - 実装したコードをダウンロード
   - ローカルプロジェクトに配置
   - Git commit & push

4. **Issueをクローズ**
   - 実装完了後、該当Issueをクローズ

### コンフリクトを防ぐ設計

各モジュールが独立しているため、どの順番で実装してもコンフリクトしません:

```
lib/
├── supabase/       # Issue #2, #3
├── services/       # Issue #9, #10
└── types/          # Issue #1

components/
├── Auth/           # Issue #5
├── TopicSelector/  # Issue #6
├── AudioRecorder/  # Issue #7
└── FeedbackDisplay/ # Issue #11

app/
├── api/            # Issue #8, #9, #10
└── (各ページ)      # Issue #6, #7, #11, #12
```

## 💰 コスト

**月額 約150円**（学生50人、月10回利用想定）

- Google Speech-to-Text: ~140円/月
- Gemini 2.0 Flash: ~10円/月
- Vercel: 無料プラン
- Supabase: 無料プラン

## 📝 開発状況

現在の進捗は [Issues](https://github.com/h-hamada-seifu/japanese-practice-app/issues) を確認してください。

### Phase 1: 基盤構築

- [ ] プロジェクトセットアップ
- [ ] データベースマイグレーション
- [ ] 認証機能実装

### Phase 2: コア機能実装

- [ ] 話題選択UI
- [ ] 音声録音UI
- [ ] 音声認識API連携
- [ ] フィードバック生成
- [ ] 結果表示UI
- [ ] 履歴機能

### Phase 3: 仕上げ

- [ ] レスポンシブデザイン
- [ ] エラーハンドリング
- [ ] デプロイ設定

## 🔒 セキュリティ

- Supabase Authによる認証
- ドメイン制限（@i-seifu.jp / @i-seifu.ac.jp のみ）
- Row Level Security (RLS)
- HTTPS通信のみ

## 📞 サポート

質問や問題がある場合は、Issueを作成してください。

---

**清風情報工科学院** | 2025
