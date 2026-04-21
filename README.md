# 🐾 Nekomews

猫の飼い主とシッターをつなぐマッチングアプリ。
猫のSNS・カレンダー・里親機能まで、猫の一生に寄り添うスーパーアプリ。

## 📦 Tech Stack

- **Frontend**: React Native (Expo SDK 51) + TypeScript
- **Routing**: Expo Router
- **State**: Zustand + TanStack Query v5
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Supabase (Auth + Postgres + Storage + Realtime + Edge Functions)
- **Payments**: Stripe + Stripe Connect Express
- **Analytics**: PostHog
- **Error Tracking**: Sentry
- **Build**: EAS (Expo Application Services)

## 🚀 Quick Start

**コードが分からない方は [`OPERATOR_RUNBOOK.md`](./OPERATOR_RUNBOOK.md) を先に読んでください。**

### Prerequisites
- Node.js 20+
- pnpm 9+
- Expo CLI
- Supabase CLI
- Xcode (iOS) / Android Studio (Android)

### Install

```bash
pnpm install
cp .env.example .env
# .env を編集して各種APIキーを設定
```

### Local Development

```bash
# Supabase ローカル起動
pnpm db:start
pnpm db:reset

# Expo Dev Server
pnpm dev
```

## 📁 Directory Structure

```
nekomews/
├── .claude/agents/        AIエージェント定義（Phase 0: 7体）
├── app/                   React Native アプリ
│   ├── app/               Expo Router ファイルベースルート
│   ├── components/        UIコンポーネント
│   ├── hooks/             カスタムフック（Zustand等）
│   ├── lib/               ライブラリ（Supabase client等）
│   ├── types/             TypeScript型定義
│   ├── utils/             ユーティリティ関数
│   └── constants/         カラー・タイポグラフィ等
├── supabase/
│   ├── config.toml        Supabase CLI 設定
│   ├── migrations/        DBマイグレーション
│   └── functions/         Edge Functions
├── docs/                  設計ドキュメント全7種
├── landing/               事前登録LP
├── scripts/               運用スクリプト
└── assets/                画像・フォント
```

## 🤖 AIエージェント

`.claude/agents/` にPhase 0の7体が実装済み。Claude Code で：

```bash
cd /path/to/nekomews
claude
```

Claude 内で：
```
Nekomewsの市場調査と競合分析を並列で走らせて
```

## 📚 ドキュメント

| ファイル | 内容 |
|---|---|
| `docs/01_requirements.md` | 要件定義 |
| `docs/02_basic_design.md` | 基本設計 |
| `docs/03_technical_requirements.md` | 技術要件 |
| `docs/04_detailed_design.md` | 詳細設計 |
| `docs/05_agent_instructions.md` | AIエージェント指示書（31体） |
| `docs/06_brand_guideline.md` | ブランドガイドライン |
| `docs/07_logo_direction.md` | ロゴ方向性 |
| `docs/legal_consultation_brief.md` | 弁護士相談ブリーフ |
| `OPERATOR_RUNBOOK.md` | 非エンジニア向け運営マニュアル |

## 🎨 Design Principles

- **猫ファースト**：すべての判断基準
- **温かみをデザイン**：機能＋感情の両立
- **場貸しモデル**：シッター個人が動物取扱業を取得
- **プライバシー最優先**：個人情報は暗号化保存

## 📝 License

Proprietary — 運営主体：有限会社〇〇（商号調整中）
