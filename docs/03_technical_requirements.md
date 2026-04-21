# 技術要件書 v0.1 — Nekomews

**Document**: Technical Requirements
**Version**: 0.1
**Date**: 2026-04-17
**Status**: Draft

---

## 1. 技術スタック

### 1.1 フロントエンド
| レイヤー | 採用技術 | 選定理由 |
|---|---|---|
| フレームワーク | **Expo SDK 50+ (React Native 0.73+)** | クロスプラットフォーム、OTAアップデート、豊富なエコシステム |
| 言語 | **TypeScript 5+** | 型安全・チーム開発の品質担保 |
| ナビゲーション | **Expo Router (ファイルベース)** | URL中心の設計、ディープリンク対応 |
| 状態管理 | **Zustand + TanStack Query (v5)** | 軽量・キャッシュ戦略の柔軟性 |
| UIライブラリ | **Tamagui** or **NativeWind + Gluestack** | パフォーマンス・デザインシステム |
| フォーム | **react-hook-form + zod** | バリデーション・型連携 |
| 国際化 | **i18next** | 将来多言語化 |
| 日付 | **date-fns + date-fns-tz** | 軽量・ツリーシェイク可 |
| 画像処理 | **expo-image, expo-image-manipulator** | パフォーマンス・リサイズ |
| カレンダー | **react-native-calendars** | カスタマイズ性 |
| チャート | **Victory Native** | 体重グラフ等 |

### 1.2 バックエンド / BaaS
| レイヤー | 採用技術 | 備考 |
|---|---|---|
| プラットフォーム | **Supabase (東京リージョン)** | 無料枠から開始 |
| DB | **PostgreSQL 15** | Supabase内蔵 |
| 認証 | **Supabase Auth** | JWT、SSO対応 |
| ストレージ | **Supabase Storage** | S3互換 |
| リアルタイム | **Supabase Realtime** | WebSocket |
| サーバーレス | **Supabase Edge Functions (Deno)** | TypeScriptで記述 |
| 追加のカスタムサーバー | **Cloud Run (Node.js)** | 将来的に複雑処理で追加 |

### 1.3 外部サービス
| サービス | 用途 | MVP |
|---|---|---|
| **Stripe** | 決済・Stripe Connect Express | ✅ |
| **Expo Push Notifications** | プッシュ通知 | ✅ |
| **Sentry** | エラー監視 | ✅ |
| **PostHog** | プロダクト分析・ABテスト | ✅ |
| **Resend** or **SendGrid** | トランザクションメール | ✅ |
| **Cloudflare** | CDN・DDoS対策 | ✅ |
| **GitHub** | ソース管理 | ✅ |
| **EAS (Expo Application Services)** | ビルド・配信 | ✅ |
| **TRUSTDOCK** | eKYC | Phase 2 |

### 1.4 開発ツール
| ツール | 用途 |
|---|---|
| **pnpm** | パッケージマネージャ |
| **Turborepo** | モノレポビルドキャッシュ |
| **ESLint + Prettier + Biome** | コード品質 |
| **Vitest** | ユニットテスト |
| **React Testing Library** | コンポーネントテスト |
| **Maestro** or **Detox** | E2Eテスト |
| **Storybook** | UI開発 |
| **MSW** | APIモック |
| **Figma** | デザイン |

---

## 2. 非機能要件（詳細）

### 2.1 性能目標
| 指標 | 目標値 | 測定方法 |
|---|---|---|
| 初回起動時間（コールドスタート） | ≤ 3.0秒 | Expo Metrics |
| 画面遷移時間 | ≤ 300ms | React DevTools Profiler |
| API応答時間（P95） | ≤ 800ms | PostHog / Supabase Logs |
| 画像アップロード（1MB） | ≤ 5秒（4G） | - |
| チャットメッセージ送信〜相手受信 | ≤ 1秒 | Realtime計測 |
| Web Vitals (Web版) | LCP<2.5s, FID<100ms, CLS<0.1 | - |

### 2.2 可用性
- **SLA**：99.5%（MVP）→ 99.9%（Phase 2）
- **RTO**（復旧目標時間）：4時間
- **RPO**（データ喪失許容）：1時間（Supabase自動バックアップ準拠）
- **計画メンテナンス**：月1回・深夜帯・事前告知

### 2.3 スケーラビリティ
| 時期 | 同時接続 | MAU | 月次取引 |
|---|---|---|---|
| ローンチ | 200 | 3,000 | 300 |
| 6ヶ月 | 1,000 | 10,000 | 3,000 |
| 12ヶ月 | 5,000 | 50,000 | 15,000 |
| 24ヶ月 | 20,000 | 200,000 | 60,000 |

**対応戦略**：
- Supabase の Pro → Team → Enterprise プランへの段階的移行
- Postgres読取レプリカで検索・タイムラインを分離
- 画像はCDN経由で配信
- 冪等な設計（retry-safe）

### 2.4 セキュリティ
#### 2.4.1 通信
- **TLS 1.2+ 必須**（1.0/1.1 拒否）
- Certificate Pinning（Phase 2）
- HSTS 有効

#### 2.4.2 認証・認可
- **JWT** による認証（Supabase Auth 標準）
- アクセストークン有効期限：1時間、リフレッシュトークン：30日
- パスワード要件：8文字以上・英数字混在
- ログイン試行失敗：10回/10分でレートリミット
- ロールベース + 行レベルのダブルガード（RLS）

#### 2.4.3 データ保護
- 個人情報（住所・電話）は **pgcrypto** で暗号化保存
- **PII logging 禁止**：ログに氏名・メール・電話を出さない
- チャット履歴：ユーザー退会から30日後に物理削除
- 決済情報は **Stripe に委譲**（PCI DSS 準拠範囲を最小化）

#### 2.4.4 脆弱性対応
- 依存関係のCVEスキャン：**Dependabot + Snyk**（週次）
- 本番前に **OWASP ZAP** でDAST
- 脅威モデリング（STRIDE）を四半期ごとに更新

#### 2.4.5 シークレット管理
- EAS Secrets + Supabase Vault
- `.env` ファイルはリポジトリにコミット禁止
- 本番キーは開発者PCに配布しない（EASビルド時のみ注入）

### 2.5 プライバシー
- 個人情報保護法準拠
- 取得目的の明示（プライバシーポリシー）
- 同意取得：オンボーディング時と重要変更時
- データポータビリティ：ユーザーデータのエクスポート機能（Phase 2）
- 削除権：ユーザー自身で退会可能、削除処理は72時間以内完了

### 2.6 運用・監視
| 観点 | 方法 |
|---|---|
| アプリクラッシュ | Sentry |
| バックエンドエラー | Supabase Logs + Sentry |
| パフォーマンス | Sentry Performance + PostHog |
| ユーザー行動 | PostHog イベント |
| インフラ | Supabase Dashboard + UptimeRobot |
| アラート | Slack Incoming Webhook |

---

## 3. インフラ構成

### 3.1 環境分離
| 環境 | 用途 | Supabase プロジェクト |
|---|---|---|
| **local** | 開発者マシン | Supabase CLI localhost |
| **dev** | 共有開発環境 | nekomews-dev |
| **staging** | 本番同等テスト | nekomews-staging |
| **production** | 本番 | nekomews-prod |

各環境ごとに独立した Supabase プロジェクト、Stripe テストキー／本番キーを使い分け。

### 3.2 ドメイン設計
- **API**：`api.nekomews.jp`（Supabase URLにカスタムドメイン）
- **Web（将来）**：`www.nekomews.jp` / `app.nekomews.jp`
- **管理画面**：`admin.nekomews.jp`
- **ステータス**：`status.nekomews.jp`

### 3.3 CDN・画像配信
- **Cloudflare** をフロントに配置
- 画像バケットは Signed URL で配信（プライベート投稿保護）
- 公開日記画像はキャッシュ可

### 3.4 DNS / メール
- ドメイン：Cloudflare Registrar
- メール送信：Resend（DKIM / SPF / DMARC 設定必須）

---

## 4. 開発・デプロイフロー

### 4.1 Gitブランチ戦略（trunk-based 簡略版）
```
main ────────────────────────────▶ (production)
  │
  └── feature/* ──(PR)──▶ main
```

- PRは必ず **squash merge**
- コミットメッセージは **Conventional Commits**

### 4.2 CI / CD
| ステージ | 内容 | ツール |
|---|---|---|
| lint | ESLint / Prettier | GitHub Actions |
| type-check | tsc --noEmit | GitHub Actions |
| unit test | Vitest | GitHub Actions |
| e2e test | Maestro（staging環境で実行） | GitHub Actions |
| migration | Supabase CLI で適用 | GitHub Actions |
| build | EAS Build | EAS |
| deploy | EAS Submit → App Store / Play Store | EAS |
| OTA update | expo-updates | EAS Update |

### 4.3 デプロイ戦略
- **バックエンド**：migration は自動適用（本番は手動承認）
- **モバイルアプリ**：
  - 重大変更 → ストア審査を通す
  - 軽微な修正 → OTA アップデート（即時反映）
- **ロールバック**：EAS で過去ビルドを再署名して配信

### 4.4 リリース頻度
- **Staging**：デイリー（自動）
- **Production**：週1回（水曜夜）
- **ホットフィックス**：随時

---

## 5. データベース設計の技術方針

### 5.1 命名規則
- テーブル：**複数形 snake_case**（例：`users`, `journal_posts`）
- カラム：**単数形 snake_case**（例：`created_at`）
- 主キー：**id**（UUID v7 推奨）
- 外部キー：**<テーブル単数>_id**（例：`owner_id`）

### 5.2 タイムスタンプ
- 全テーブルに `created_at` / `updated_at` を必須
- `updated_at` は Postgres TRIGGER で自動更新

### 5.3 論理削除 vs 物理削除
- **個人情報関連**は論理削除（`deleted_at`）後に72時間以内で物理削除
- それ以外は物理削除を基本とする
- チャット・レビューは ユーザー削除後も匿名化して残す（相互評価の一貫性）

### 5.4 マイグレーション
- Supabase CLI (`supabase migration new`)
- 全マイグレーションをGit管理
- `down` は原則書かない（前方互換を基本）

### 5.5 インデックス戦略（初期）
- `bookings(owner_id, status, start_at)` 複合
- `bookings(sitter_id, status, start_at)` 複合
- `messages(booking_id, created_at DESC)`
- `journal_posts(visibility, created_at DESC)` パーシャル（visibility='public'）
- `sitter_profiles(area_prefecture, area_city, acceptance_status)`
- 位置情報は Phase 2 で PostGIS 導入

---

## 6. API設計方針

### 6.1 API形態
- **MVP は Supabase PostgREST を主軸**：CRUD は自動生成されたREST APIを使用
- **複雑なロジックは Edge Function**：POST /functions/v1/<name>
- **リアルタイムは Supabase Realtime（WebSocket）**
- GraphQL は採用しない（コスト・学習コストに見合わない）

### 6.2 認可方針
- クライアント → Supabase PostgREST は **Auth JWT + RLS** で制御
- Edge Function は 内部で auth.uid() を検証
- Stripe Webhook は 署名検証必須

### 6.3 バージョニング
- Edge Function の URL パスに `/v1/` を含める
- 破壊的変更は `/v2/` として併存運用

### 6.4 エラーレスポンス（Edge Function共通）
```json
{
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "指定された予約が見つかりません",
    "request_id": "uuid"
  }
}
```

---

## 7. ログ・トレーシング

### 7.1 ログレベル
| レベル | 用途 |
|---|---|
| ERROR | 即時対応が必要 |
| WARN | 異常だが継続可能 |
| INFO | 重要なビジネスイベント（予約確定等） |
| DEBUG | 開発時のみ |

### 7.2 構造化ログ（例）
```json
{
  "timestamp": "2026-04-17T10:00:00Z",
  "level": "INFO",
  "service": "edge-function/booking-confirm",
  "request_id": "uuid",
  "user_id": "uuid",
  "event": "booking.confirmed",
  "booking_id": "uuid",
  "duration_ms": 420
}
```

- **PII（氏名・メール・電話・住所）は絶対にログに出さない**
- user_id（UUID）のみ記録

### 7.3 分散トレーシング
- OpenTelemetry SDK を Edge Function に導入（Phase 2）
- Supabase Logs → Grafana Loki（セルフホスト）も検討

---

## 8. バックアップ・災害対策

### 8.1 バックアップ
- **Postgres**：Supabase の日次自動バックアップ（Pro プラン以上）
- **Storage**：Cloudflare R2 へ週次ミラーリング（Phase 2）
- **保持期間**：30日（MVP）→ 90日（Phase 2）

### 8.2 災害対策
- 東京リージョン障害時：大阪リージョンへフェイルオーバー（Phase 2）
- MVPは単一リージョン容認、代わりにバックアップからの復旧手順をRunbook化

### 8.3 インシデント対応
- Runbook の作成
- オンコール体制（MVP は週替わり）
- ポストモーテム文化（全障害で実施）

---

## 9. テスト戦略

### 9.1 テストピラミッド
```
        ┌──────────┐
        │   E2E    │ 5〜10本（主要フロー）
        ├──────────┤
        │ 結合テスト │ 20〜50本
        ├──────────┤
        │ ユニット │ 200〜500本
        └──────────┘
```

### 9.2 必須E2Eフロー（MVP）
1. オンボーディング → サインアップ → 猫登録
2. シッター検索 → 予約 → 決済 → チャット → レビュー
3. シッター申請 → 承認 → 依頼受諾 → 精算
4. 日記投稿 → みんなのフィード表示
5. ログアウト → 再ログイン

### 9.3 カバレッジ目標
- ビジネスロジック（Edge Function）：**80%以上**
- UIコンポーネント：**60%以上**
- 全体：**70%以上**

### 9.4 負荷テスト
- **k6** を使用
- 本番相当の 2倍負荷で RPS 1,000 まで検証（Phase 2 前）

---

## 10. 開発環境

### 10.1 必須ソフトウェア
- Node.js 20 LTS
- pnpm 8+
- Git 2.40+
- Xcode 15+（macOS）
- Android Studio（Android開発）
- Expo Go アプリ（端末テスト）
- Supabase CLI
- Stripe CLI

### 10.2 推奨エディタ設定
- VSCode + 拡張（ESLint / Prettier / GitLens / Tailwind CSS）
- .editorconfig でタブ幅統一

### 10.3 ローカル起動手順（概要）
```bash
# 初回
pnpm install
supabase start
supabase db reset  # シードデータ投入

# 日常
pnpm dev           # Expo Dev Server起動
supabase functions serve  # Edge Function ローカル実行
```

---

## 11. コーディング規約（要点）

### 11.1 TypeScript
- `any` 禁止（必要な場合は `unknown` + 型ガード）
- `strict: true`
- Zod で入力バリデーション → 型推論

### 11.2 React / RN
- 関数コンポーネントのみ
- カスタムフックは `use` プレフィックス
- スタイルは NativeWind（Tailwind CSS） or Tamagui
- `useEffect` 依存配列は eslint-plugin-react-hooks で自動検出

### 11.3 API呼び出し
- TanStack Query でキャッシュ
- 楽観的更新を積極採用（チャット・いいね）
- エラーは Sentry + ユーザー向けトースト

### 11.4 コミットメッセージ
```
<type>(<scope>): <subject>

feat(booking): シッターへの予約依頼フロー追加
fix(chat): 画像送信時のクラッシュ修正
refactor(db): reviews テーブルにindex追加
docs(readme): セットアップ手順更新
```

---

## 12. リリース時チェックリスト

### 12.1 Go/No-Go 基準
- [ ] 必須機能がすべて実装されている
- [ ] E2Eテスト合格率 100%
- [ ] P0/P1 バグ 0件
- [ ] 負荷テスト実施済み
- [ ] プライバシーポリシー・利用規約 公開
- [ ] 特商法に基づく表記 公開
- [ ] App Store / Google Play 審査通過
- [ ] Sentry / PostHog / Stripe 本番設定完了
- [ ] ドメイン・SSL 動作確認
- [ ] バックアップ・復旧手順を実機検証
- [ ] カスタマーサポート連絡先・窓口稼働
- [ ] インシデント対応Runbook整備

### 12.2 ソフトローンチ戦略
1. **クローズドβ**（2週間）：招待制20名程度で重大バグ発見
2. **オープンβ**（4週間）：東京23区限定で公開、初期レビュー獲得
3. **正式ローンチ**：プレスリリース＋SNS広告

---

## 13. 概算コスト（月額）

### 13.1 MVP期（MAU 3,000）
| 項目 | 月額 |
|---|---|
| Supabase Pro | $25 |
| EAS Production | $99 |
| Sentry Team | $26 |
| PostHog（クラウド） | $0（Free tier） |
| Resend | $0〜$20 |
| Cloudflare | $0〜$20 |
| Expo Push | 無料 |
| Stripe 手数料 | 取引額の3.6%（売上連動） |
| ドメイン | ¥1,500/年 |
| **小計** | **約 $170（約 26,000円）** |

### 13.2 Phase 2（MAU 50,000）
| 項目 | 月額 |
|---|---|
| Supabase Team | $599 |
| その他合計 | 約 $300 |
| **小計** | **約 $900（約 140,000円）** |

### 13.3 スケール期（MAU 200,000）
| 項目 | 月額 |
|---|---|
| Supabase Enterprise | 要相談（$1,500〜） |
| 追加インフラ・CDN | $500〜 |
| **小計** | **$3,000〜（約 50万円）** |

---

## 14. リスクと対策

| リスク | 影響 | 対策 |
|---|---|---|
| Supabase ロックイン | 将来的な移行コスト | DBアクセス層を抽象化、マイグレーション手順を整備 |
| Expo EAS 依存 | ビルド環境の人質化 | bare workflow への切り替え手順を文書化 |
| Stripe 審査落ち | 決済不能 | 事前に業種を確認、必要書類を準備 |
| App Store リジェクト | ローンチ遅延 | ガイドライン確認、プライバシー項目を丁寧に記述 |
| 個人情報漏洩 | 信用失墜 | 暗号化・最小権限・監査ログ |
| シッター起因の事故 | 法的責任リスク | 規約での責任限定＋保険誘導 |

---

**以上 v0.1 ドラフト。詳細設計でEdge Function のシーケンス・画面の状態遷移・エラーハンドリング詳細を書き下ろす。**
