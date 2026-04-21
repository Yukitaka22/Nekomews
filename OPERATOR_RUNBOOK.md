# 🐾 Nekomews 運営マニュアル（コード分からない人向け）

**このファイルが、あなたの取説です。**
迷ったらこのファイルに戻ってきてください。

---

## 📍 現在地

**Sprint 0 完了** — プロジェクト土台だけ作成済み。
まだ動くアプリはありません。次のSprint 1で動くようになります。

---

## 🎯 今あなたがやることは、これだけ

### 🔴 必須（30分〜1時間）
- [ ] **1. アカウントをいくつか作る**（下のセクション「必要アカウント」参照）

### 🟡 あとで（今日でなくてOK）
- [ ] 2. 開発ツールのインストール（Mac）
- [ ] 3. Supabaseプロジェクト作成
- [ ] 4. Expo アカウントと CLI

**以下は手順書です。分からない部分は「わからない」と私に言ってください。**

---

## 📋 必要なアカウント一覧

以下のサービスで **個人アカウントを作ってください**。
すべて無料で始められます。**登録したメールアドレスとパスワードは、私が見える場所には書かないでください**。

| # | サービス | 目的 | URL | 必要な情報 |
|---|---|---|---|---|
| 1 | **GitHub** | コード保管 | https://github.com/signup | メアド・パス |
| 2 | **Supabase** | データベース | https://supabase.com/dashboard/sign-up | GitHubでログイン可 |
| 3 | **Expo (EAS)** | アプリビルド | https://expo.dev/signup | メアド・パス |
| 4 | **Sentry** | エラー監視 | https://sentry.io/signup/ | メアド・パス |
| 5 | **PostHog** | 分析 | https://app.posthog.com/signup | メアド・パス |

### 登録時のコツ
- **メアドは統一**：`hello@nekomews.jp`（ドメイン取得後）で全サービス登録が理想
- **それまでは**：個人のGmail等でOK
- **パスワードマネージャー必須**（1Password / Bitwarden）：全部同じパスワードは絶対ダメ
- **2段階認証（2FA）を全サービスで有効化**

### Supabase 補足
- プロジェクト名：`nekomews-dev`（開発用）
- リージョン：**Tokyo (ap-northeast-1)** 必ずこれ
- データベースパスワード：自動生成を選択 → **1Passwordに保存**

### Apple Developer / Google Play（今はまだ不要）
- Sprint 5（ローンチ準備フェーズ）で作成
- Apple Developer Program：年 $99（約¥15,000）
- Google Play Console：一度だけ $25（約¥3,800）

---

## 💻 Macのセットアップ（1時間くらい）

**注意**：全コマンドはターミナル（標準アプリ）に貼り付けます。
Command + Space で "ターミナル" と検索 → 開く。

### Step 1：Homebrew（macOSのパッケージ管理）

すでに入っていればスキップ。確認：
```
brew --version
```

無い場合：
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
→ パスワードを聞かれるので、Macのパスワードを入力。

### Step 2：Node.js（JavaScript 実行環境）

```
brew install node@20
```

確認：
```
node --version
```
`v20.x.x` のような表示が出ればOK。

### Step 3：pnpm（パッケージ管理）

```
npm install -g pnpm
```

### Step 4：Git（すでに入ってるはず）

```
git --version
```

### Step 5：Expo CLI と Supabase CLI

```
npm install -g expo-cli eas-cli
brew install supabase/tap/supabase
```

### Step 6：Xcode（iOS シミュレーター用・大きいので時間かかる）

App Store で「Xcode」を検索 → インストール。**10〜15GBくらい空き容量が必要。**

---

## 🚀 プロジェクトを動かす（Sprint 1で説明）

Sprint 0 ではここまで。次のSprint 1で：
- Supabase にデータベースを作る
- ログイン画面を動かす
- iPhone 実機で起動

---

## ❓ 困ったときの対応

### 🆘 よくある困りごと

| 症状 | 原因 | 対応 |
|---|---|---|
| brew install で `command not found` | Homebrew 未導入 | Step 1 からやり直し |
| `expo start` で赤い画面 | Node.js バージョン違い | `node --version` で確認、v20 以上を |
| Xcode が開かない | 容量不足 | 空き容量30GB以上に |
| Supabase にログインできない | プラン上限 | 無料枠で十分、上限に当たったら報告 |

### 🔥 対応できないとき
私に **エラーメッセージをそのままコピペ** してください。
スクショよりテキストが読みやすいです。

---

## 📅 進行ロードマップ

### ✅ Sprint 0（完了）
- プロジェクト土台作成
- 設計書・エージェント指示書・LPの作成

### 🔄 Sprint 1（次）
- Supabase プロジェクトセットアップ
- 認証機能（メール + Apple/Google SSO）
- オンボーディング画面（5枚スワイプ）
- 猫プロフィール登録
- **あなたの作業時間：1時間程度**

### 📌 Sprint 2
- シッター検索・詳細表示
- シッター側申請フロー

### 📌 Sprint 3
- 予約フロー
- チャット（リアルタイム）

### 📌 Sprint 4
- Stripe 決済
- レビュー機能

### 📌 Sprint 5
- ローンチ準備（審査対応・本番デプロイ）
- **あなたの作業時間：1〜2時間**

---

## 💰 発生するコスト目安（月額）

### 開発中（0〜3ヶ月）
- **無料枠で全部まかなえる想定**
- 万が一：¥3,000〜5,000 / 月

### ローンチ後
- Supabase Pro: $25（¥4,000）
- EAS: $99（¥15,000）
- Sentry: $26（¥4,000）
- Apple Developer: 年 $99（月換算 ¥1,300）
- **合計：月 ¥25,000 くらい**

### スケールしたら（MAU 5万人規模）
- Supabase Team: $599（¥90,000）
- 他も増加、合計 **月 ¥15万** くらい

---

## 📞 連絡先・参照

- **設計書**：`docs/01_requirements.md` 〜 `docs/07_logo_direction.md`
- **LP**：`landing/index.html`
- **弁護士ブリーフ**：`docs/legal_consultation_brief.md`

---

**このマニュアルは Sprint が進むたびに更新します。**
**困ったら絶対に、迷わず聞いてください。**
