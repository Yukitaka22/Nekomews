# 基本設計書 v0.1 — Nekomews

**Document**: Basic Design
**Version**: 0.1
**Date**: 2026-04-17
**Status**: Draft

---

## 1. システム全体構成

### 1.1 アーキテクチャ方針
- **クライアントファースト**：React Native (Expo) によるクロスプラットフォーム
- **BaaS中心**：Supabase（Postgres + Auth + Storage + Realtime + Edge Functions）でバックエンドの90%を担う
- **決済・通知はマネージド**：Stripe、Expo Push
- **ビジネスロジックはEdge Functions**：Deno上のサーバーレスで実装
- **複雑処理は別サーバー**：将来的に必要になったら Node.js on Cloud Run を追加

### 1.2 システム構成図

```
┌────────────────────────────────────────────────────┐
│                   クライアント                       │
│  ┌──────────────┐         ┌──────────────┐        │
│  │  iOS App     │         │ Android App  │        │
│  │  (Expo)      │         │  (Expo)      │        │
│  └──────┬───────┘         └──────┬───────┘        │
└─────────┼─────────────────────────┼────────────────┘
          │                         │
          │  HTTPS / WebSocket      │
          ▼                         ▼
┌────────────────────────────────────────────────────┐
│                   Supabase                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│  │   Auth   │  │ Postgres │  │   Storage    │     │
│  │  (JWT)   │  │  (RLS)   │  │  (画像/書類) │     │
│  └──────────┘  └──────────┘  └──────────────┘     │
│  ┌──────────┐  ┌──────────────────────────┐       │
│  │ Realtime │  │   Edge Functions (Deno)  │       │
│  │  (WSS)   │  │   - 予約ワークフロー      │       │
│  └──────────┘  │   - レビュー集計         │       │
│                │   - 決済Webhook受信      │       │
│                └──────────┬───────────────┘       │
└───────────────────────────┼────────────────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        ▼                   ▼                    ▼
┌───────────────┐  ┌────────────────┐  ┌────────────────┐
│    Stripe     │  │  Expo Push     │  │  保険会社API   │
│  (決済)       │  │  (通知)        │  │  (Phase 2)     │
└───────────────┘  └────────────────┘  └────────────────┘
```

### 1.3 コンポーネント一覧
| コンポーネント | 役割 | 技術 |
|---|---|---|
| モバイルアプリ | ユーザー接点 | React Native (Expo SDK 50+) |
| 認証 | ユーザー認証・セッション管理 | Supabase Auth |
| データベース | 全てのビジネスデータ | PostgreSQL 15 (Supabase) |
| オブジェクトストレージ | 画像・書類 | Supabase Storage |
| リアルタイム | チャット・通知 | Supabase Realtime |
| サーバーレス関数 | ビジネスロジック | Edge Functions (Deno) |
| 決済 | 与信・精算 | Stripe + Stripe Connect |
| プッシュ通知 | OS通知配信 | Expo Push Notifications |
| CDN | 画像配信 | Supabase Storage + CloudFlare |
| 分析 | ユーザー行動 | PostHog（セルフホスト or クラウド） |
| エラー監視 | クラッシュレポート | Sentry |

---

## 2. 画面一覧・遷移図

### 2.1 画面一覧（MVP）

#### 共通
| 画面ID | 画面名 | 種別 |
|---|---|---|
| C-001 | スプラッシュ | 共通 |
| C-002 | オンボーディング（5枚スワイプ） | 共通 |
| C-003 | ロール選択 | 共通 |
| C-004 | サインイン | 共通 |
| C-005 | サインアップ | 共通 |
| C-006 | パスワードリセット | 共通 |
| C-007 | プロフィール（自分） | 共通 |
| C-008 | 通知一覧 | 共通 |
| C-009 | 設定 | 共通 |
| C-010 | 利用規約 / プライバシーポリシー | 共通 |

#### 飼い主モード
| 画面ID | 画面名 |
|---|---|
| O-001 | ホーム（カレンダー兼ダッシュボード） |
| O-002 | 猫プロフィール一覧 |
| O-003 | 猫プロフィール詳細 |
| O-004 | 猫プロフィール編集 |
| O-005 | シッター検索 |
| O-006 | シッター詳細 |
| O-007 | 予約作成フォーム |
| O-008 | 予約一覧 |
| O-009 | 予約詳細（承認待ち／確定／完了／キャンセル） |
| O-010 | メッセージ一覧 |
| O-011 | チャットルーム |
| O-012 | ねこ日記（自分） |
| O-013 | ねこ日記（みんなの投稿） |
| O-014 | 投稿作成 |
| O-015 | 投稿詳細 |
| O-016 | レビュー作成 |
| O-017 | 決済方法管理 |
| O-018 | 領収書一覧 |

#### シッターモード
| 画面ID | 画面名 |
|---|---|
| S-001 | ダッシュボード |
| S-002 | シッター申請フロー（4ステップ） |
| S-003 | 審査ステータス |
| S-004 | 新着依頼一覧 |
| S-005 | 依頼詳細（承認／辞退／条件提案） |
| S-006 | 予約一覧 |
| S-007 | チャット（C-011と共通） |
| S-008 | シッタープロフィール編集 |
| S-009 | 料金設定 |
| S-010 | 受付スケジュール設定 |
| S-011 | 収入ダッシュボード |
| S-012 | レビュー一覧 |
| S-013 | 精算履歴 |

**MVP画面総数：約43画面**

### 2.2 主要画面遷移

```
[スプラッシュ]
   │
   ▼
[オンボーディング 5枚] ─ スキップ ─┐
   │                                │
   ▼                                ▼
[ロール選択] ─────────────────▶ [サインイン/サインアップ]
                                        │
                        ┌───────────────┴───────────────┐
                        ▼                               ▼
            ┌──────────────────┐              ┌──────────────────┐
            │  飼い主モード     │              │  シッターモード   │
            │                  │              │                  │
            │  ホーム           │              │  ダッシュボード   │
            │   ├ 猫を探す      │              │   ├ 新着依頼     │
            │   ├ 予約          │              │   ├ 予約管理     │
            │   ├ メッセージ    │              │   ├ メッセージ   │
            │   ├ ねこ日記      │              │   ├ プロフィール │
            │   └ 設定          │              │   └ 収入         │
            └────────┬─────────┘              └────────┬─────────┘
                     │                                 │
                     └──── モード切替トグル ───────────┘
```

---

## 3. 主要ユースケースフロー

### 3.1 UC-01：シッター予約フロー（コアフロー）

```
[飼い主]                [システム]              [シッター]
   │                       │                       │
   │ 1. 検索条件入力        │                       │
   │─────────────────────▶│                       │
   │                       │                       │
   │ 2. シッター一覧表示   │                       │
   │◀─────────────────────│                       │
   │                       │                       │
   │ 3. 詳細閲覧           │                       │
   │                       │                       │
   │ 4. 依頼フォーム送信   │                       │
   │─────────────────────▶│                       │
   │                       │ 5. プッシュ通知       │
   │                       │─────────────────────▶│
   │                       │                       │
   │                       │                       │ 6. 承諾
   │                       │◀─────────────────────│
   │                       │                       │
   │ 7. 与信確保(Stripe)   │                       │
   │                       │──▶ Stripe API         │
   │                       │                       │
   │ 8. 予約確定通知       │                       │
   │◀─────────────────────│                       │
   │                       │ 9. チャットルーム生成 │
   │                       │─────────────────────▶│
   │                       │                       │
   │ === サービス実施 ===  │                       │
   │                       │                       │
   │ 10. 完了報告          │◀─────────────────────│
   │                       │ 11. 決済確定          │
   │                       │──▶ Stripe API         │
   │                       │                       │
   │ 12. 領収書 + レビュー│                       │
   │     依頼(24h後)       │                       │
   │◀─────────────────────│                       │
```

### 3.2 UC-02：シッター登録・審査フロー

```
[シッター志望者]         [システム]             [運営]
   │                       │                       │
   │ 1. アカウント作成     │                       │
   │─────────────────────▶│                       │
   │                       │                       │
   │ 2. 申請フォーム 4step  │                       │
   │   (基本/サービス/書類/ │                       │
   │    確認)              │                       │
   │─────────────────────▶│                       │
   │                       │ 3. 運営に通知         │
   │                       │─────────────────────▶│
   │                       │                       │ 4. 審査
   │                       │◀─────────────────────│   (目視)
   │                       │                       │
   │ 5. 審査結果通知       │                       │
   │◀─────────────────────│                       │
   │                       │                       │
   │ 6. プロフィール公開   │                       │
   │   (承認された場合)    │                       │
```

MVPでは **目視審査**。Phase 2 で eKYC API 自動審査に移行。

### 3.3 UC-03：レビューフロー

```
サービス完了
   │
   ▼
24時間待機 ─── キャンセル or トラブル報告でフロー分岐
   │
   ▼
[システム]
  飼い主・シッター双方に
  レビュー依頼プッシュ通知
   │
   ├─▶ [飼い主] 星 + コメント + 写真
   │     送信時刻を記録
   │
   └─▶ [シッター] 星 + コメント（非公開）
         送信時刻を記録
   │
   ▼
両者投稿 or 7日経過で同時公開
（バイアス防止）
   │
   ▼
シッターのレビュー平均を再計算
```

### 3.4 UC-04：メッセージング

```
予約確定
   │
   ▼
Edge Function が messages テーブルに
chat_room レコード作成 + 権限付与
   │
   ▼
両者、Realtime購読で即時メッセージ受信
   │
   ▼
メッセージ投稿時
   ├─ テキスト → messages テーブル
   ├─ 画像     → Supabase Storage + messages にURL記録
   └─ スタンプ → messages にスタンプIDを記録
   │
   ▼
Realtimeで相手に通知 + Push Notification送信
   （ユーザーが非アクティブな場合のみ）
```

### 3.5 UC-05：カレンダー自動スケジュール

```
日次バッチ(Edge Function Cron)
   │
   ▼
全アクティブ猫を走査
   │
   ├─▶ 体重×食事量 → 餌の推奨購入日を計算
   │     → schedule テーブルに INSERT/UPSERT
   │
   ├─▶ 最終猫砂交換日 + 14日 → 次回交換日
   │
   ├─▶ 最終フィラリア + 30日 → 次回投薬日
   │
   └─▶ 最終ワクチン + 365日 → 次回接種日
   │
   ▼
当日リマインド時刻(ユーザー設定) に Push Notification
```

---

## 4. データモデル概要

### 4.1 主要エンティティ（ER図概要）

```
users ──────┬─────< cats
            │
            ├─────< sitter_profiles
            │
            ├─────< bookings ──< messages
            │          │
            │          ├──< reviews
            │          │
            │          └──< payments
            │
            ├─────< journal_posts ──< journal_likes
            │                    └──< journal_comments
            │
            └─────< schedules
```

### 4.2 主要テーブル（抜粋）

#### users
| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | PK, Supabase Auth UID |
| email | text | unique |
| display_name | text |  |
| avatar_url | text |  |
| role_owner | bool | 飼い主ロール有効 |
| role_sitter | bool | シッターロール有効 |
| area_prefecture | text |  |
| area_city | text |  |
| phone_encrypted | bytea | AES-256暗号化 |
| created_at | timestamp |  |

#### cats
| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | PK |
| owner_id | uuid | FK: users.id |
| name | text |  |
| breed | text |  |
| gender | enum | male/female/unknown |
| birth_date | date | null可 |
| avatar_url | text |  |
| personality_tags | jsonb | ["甘えん坊","臆病"] |
| allergy_notes | text |  |
| medical_history | jsonb |  |

#### sitter_profiles
| カラム | 型 | 備考 |
|---|---|---|
| user_id | uuid | PK, FK: users.id |
| bio | text |  |
| experience_years | int |  |
| license_number | text | 動物取扱業登録番号 |
| license_verified | bool | 運営確認済み |
| services | jsonb | {"visit":true,"boarding":false} |
| base_rate | int | 基本料金(円/時間) |
| acceptance_status | enum | active/paused/under_review |
| approved_at | timestamp |  |

#### bookings
| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | PK |
| owner_id | uuid | FK: users.id |
| sitter_id | uuid | FK: users.id |
| cat_ids | uuid[] | 対象の猫 |
| start_at | timestamp |  |
| end_at | timestamp |  |
| service_type | enum | visit/boarding |
| base_fee | int |  |
| option_fee | int |  |
| insurance_fee | int |  |
| platform_fee | int |  |
| total_amount | int |  |
| status | enum | requested/accepted/confirmed/completed/cancelled/disputed |
| stripe_payment_intent_id | text |  |
| created_at | timestamp |  |

#### messages
| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | PK |
| booking_id | uuid | FK: bookings.id |
| sender_id | uuid | FK: users.id |
| type | enum | text/image/sticker/report |
| content | jsonb | 型ごとの内容 |
| read_at | timestamp | null=未読 |
| created_at | timestamp |  |

#### reviews
| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | PK |
| booking_id | uuid | FK |
| reviewer_id | uuid | FK: users.id |
| reviewee_id | uuid | FK: users.id |
| direction | enum | owner_to_sitter / sitter_to_owner |
| rating | int | 1-5 |
| comment | text |  |
| photos | text[] |  |
| published_at | timestamp | null=未公開 |
| created_at | timestamp |  |

#### journal_posts
| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | PK |
| author_id | uuid | FK: users.id |
| cat_id | uuid | FK: cats.id |
| text | text |  |
| photos | text[] |  |
| visibility | enum | private/followers/public |
| created_at | timestamp |  |

#### schedules
| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | PK |
| cat_id | uuid | FK: cats.id |
| type | enum | food_purchase/litter_change/vaccine/filaria/custom |
| scheduled_at | timestamp |  |
| is_auto_generated | bool |  |
| completed_at | timestamp |  |
| notes | text |  |

### 4.3 Row Level Security（RLS）方針

- 全テーブルで **RLS ON が原則**
- `users` テーブル：本人のみ更新可、他人は公開項目のみ閲覧
- `cats` テーブル：owner_id = auth.uid() のみ全操作
- `bookings` テーブル：owner_id または sitter_id = auth.uid() のみ閲覧
- `messages` テーブル：関連する booking の owner/sitter のみ閲覧
- `journal_posts` テーブル：
  - visibility=private : author_id = auth.uid()
  - visibility=followers : フォロー関係
  - visibility=public : 全員閲覧可

---

## 5. 認証・権限設計

### 5.1 認証方式
| 方式 | MVP | 備考 |
|---|---|---|
| Email + Password | ✅ | Supabase Auth 標準 |
| Apple SSO | ✅ | iOS App Store 必須 |
| Google SSO | ✅ |  |
| 電話番号認証 | Phase 2 | SMS OTP |
| eKYC | Phase 2 | シッター本人確認自動化 |

### 5.2 ロール
- **owner** : 飼い主
- **sitter** : シッター（審査通過者のみ）
- **admin** : 運営（Supabase Dashboardで管理）

1アカウントで owner/sitter 両方保持可能。

### 5.3 権限（ロール×操作マトリクス）
| 操作 | owner | sitter | admin |
|---|---|---|---|
| 猫登録 | ✅ | ❌ | ❌ |
| シッター検索 | ✅ | ✅ | ✅ |
| 予約作成 | ✅ | ❌ | ❌ |
| 予約承諾 | ❌ | ✅ | ❌ |
| シッター申請 | ✅ | - | - |
| シッタープロフィール編集 | ❌ | ✅(自分) | ✅(全員) |
| レビュー作成 | ✅(自分が関与した予約) | ✅(自分が関与した予約) | ❌ |
| 日記投稿 | ✅ | ✅ | ❌ |

---

## 6. 決済フロー

### 6.1 決済プレーヤー
- **Stripe** : カード決済・Payment Intent / Customer / Connect
- **Stripe Connect Express** : シッターへの自動精算
- **PayPay** : Phase 2（優先低）

### 6.2 予約決済フロー（与信→確定）

```
[予約依頼送信]
   │
   ▼
[シッター承諾]
   │
   ▼
[Edge Function]
  Stripe PaymentIntent 作成（capture_method=manual）
   │
   ▼
[与信確保（ユーザーに決済確定画面）]
   │
   ▼
[booking status = confirmed]
   │
   ▼ ... サービス実施 ...
   │
[シッターが完了報告]
   │
   ▼
[Edge Function]
  Stripe PaymentIntent capture
  → Stripe Connect で取引額×85% をシッターへ
  → 15% + 保険料 + 決済手数料をプラットフォーム残高へ
   │
   ▼
[booking status = completed]
```

### 6.3 キャンセルポリシー
| タイミング | 飼い主負担 | シッター受取 |
|---|---|---|
| 確定後〜72時間前 | 0% | 0% |
| 72時間〜24時間前 | 50% | 50% - 手数料 |
| 24時間以内 | 100% | 100% - 手数料 |

### 6.4 シッター精算
- Stripe Connect Express で月1回自動振込
- 最低振込額：3,000円（未達は翌月繰越）
- 振込手数料：シッター負担（250円）

---

## 7. 通知設計

### 7.1 チャネル
| チャネル | MVP | 用途 |
|---|---|---|
| プッシュ通知 | ✅ | 即時性の高い通知 |
| アプリ内通知タブ | ✅ | 履歴 |
| メール | ✅ | 領収書・重要案内 |
| SMS | Phase 2 | 本人確認 |

### 7.2 通知カテゴリ
| カテゴリ | 送信条件 | 既定 | ユーザー設定 |
|---|---|---|---|
| 予約依頼（シッター宛） | 予約作成時 | ON | 変更不可 |
| 予約承諾（飼い主宛） | シッター承諾時 | ON | 変更不可 |
| メッセージ | 新着で相手非アクティブ | ON | ON/OFF可 |
| レビュー依頼 | 完了24h後 | ON | ON/OFF可 |
| カレンダーリマインド | 予定時刻30分前 | ON | ON/OFF可 |
| マーケティング（新機能・キャンペーン） | 週1まで | OFF | ON/OFF可 |

### 7.3 配信手段
- **Expo Push Service** 経由で iOS APNs / Android FCM に配信
- Edge Function から `expo-server-sdk` でバッチ送信
- 送信結果は `push_logs` テーブルに記録（配信失敗の再送対応）

---

## 8. ストレージ設計

### 8.1 Supabase Storage バケット
| バケット名 | 用途 | アクセス |
|---|---|---|
| `avatars` | ユーザー・猫のプロフィール画像 | 全員読取／本人書込 |
| `journal_photos` | 日記投稿画像 | visibility に応じて |
| `chat_photos` | チャット送信画像 | 関係者のみ |
| `sitter_documents` | シッター本人確認書類 | 本人 + 運営のみ |
| `receipts` | PDF領収書 | 本人のみ |

### 8.2 画像処理方針
- アップロード時にクライアント側で最大長辺2,048pxにリサイズ
- EXIF（特に位置情報）を必ず削除
- サムネイル（256px / 512px）は Edge Function で自動生成

---

## 9. 外部連携

### 9.1 連携マップ
| サービス | 用途 | MVP |
|---|---|---|
| Stripe | 決済・精算 | ✅ |
| Expo Push | プッシュ通知 | ✅ |
| Sentry | エラー監視 | ✅ |
| PostHog | プロダクト分析 | ✅ |
| SendGrid / Resend | トランザクションメール | ✅ |
| 保険会社API | 保険付帯 | MVPは手動CSV連携 |
| eKYC業者（TRUSTDOCK等） | 本人確認 | Phase 2 |
| Apple App Store | 配信 | ✅ |
| Google Play | 配信 | ✅ |

### 9.2 Webhook受信
- Stripe → `/webhooks/stripe` （Edge Function）
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
  - `account.updated`（Connect）

---

## 10. 運用・管理機能（簡易版）

### 10.1 MVP 運用ツール
- **Supabase Dashboard** でデータ閲覧・編集
- **Retool** もしくは **Supabase Studio** で簡易管理画面
- シッター審査は Slack チャンネル通知 → 手動承認

### 10.2 必須の運用機能（MVP）
- シッター申請の承認／却下
- 不適切投稿／レビューの非表示
- 通報対応キュー
- 月次売上レポート
- 返金処理

---

## 11. エラーハンドリング方針

### 11.1 クライアント
- ネットワークエラー：3回リトライ＋オフラインキューイング
- 認可エラー（401）：サイレントリフレッシュ、失敗時ログアウト
- サーバーエラー（5xx）：ユーザーに親しみやすいメッセージ＋Sentryへ送信

### 11.2 サーバー（Edge Function）
- 全関数を try/catch でラップ、構造化ログを Supabase Logs に出力
- Stripe/外部API失敗は 最大3回指数バックオフ
- 致命的エラーは Slack Webhook へ通知

---

## 12. 今後の拡張ポイント（Phase 2〜）

- グッズEC：Supabase + Stripe Products + AI切り抜きAPI（Remove.bg等）
- 里親マッチング：cat_adoption テーブル追加、shelter ロール追加
- フードサブスク：recurring payment のStripe Subscription
- 動物病院送客：ジオクエリ（PostGIS拡張）
- 地域コミュニティ：communities テーブル + 投稿の area でパーティション
- シッター向けSaaS：feature_flags でプレミアム機能を出し分け

---

**以上 v0.1 ドラフト。詳細設計で画面ごとのワイヤーフレーム・状態遷移・エラーパスを掘り下げる。**
