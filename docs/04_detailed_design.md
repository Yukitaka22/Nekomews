# 詳細設計書 v0.1 — Nekomews

**Document**: Detailed Design
**Version**: 0.1
**Date**: 2026-04-17
**Status**: Draft

---

## 0. この文書の位置づけ

- 01〜03 で定義した要件・基本設計・技術要件を **実装可能な粒度** まで落とし込むドキュメント
- 対象読者：AIエージェント（Build層）および人間エンジニア
- 対応するスプリント：MVPスプリント 1〜10（想定12週）

---

## 1. 画面詳細設計

### 1.1 画面設計の標準フォーマット

各画面は以下のセクションで記述：
- **Purpose**：何を達成する画面か
- **Route**：Expo Router のパス
- **Props / Params**：入力
- **State**：画面内で保持する状態
- **Components**：主要UI構成
- **Data Sources**：どのテーブル・APIから取得
- **Actions**：発火するビジネスロジック
- **States**：表示状態（loading / empty / error / success）
- **Edge Cases**：特殊ケース

### 1.2 主要画面の詳細（MVP重要画面を抜粋）

---

#### 画面：O-005 シッター検索（飼い主モード）

**Purpose**：エリア・日程・サービス種別で条件にあうシッター一覧を提示する

**Route**：`/owner/search`

**Params**：
- `?area=東京都渋谷区` (省略時は現在地)
- `?from=2026-05-01&to=2026-05-03`
- `?service=visit|boarding`
- `?sort=rating|price|distance`

**State**：
```typescript
type SearchState = {
  filters: SearchFilters;
  results: SitterCard[];
  page: number;
  loading: boolean;
  hasMore: boolean;
};
```

**Components**：
- SearchHeader（検索条件表示・編集ボタン）
- FilterBar（価格レンジスライダー／サービス種別チップ／評価絞込）
- SitterCardList（仮想化リスト `FlashList`）
- SitterCard × N：顔写真／名前／エリア／評価★／基本料金／対応内容タグ
- EmptyState（該当なし時）
- LoadingSkeleton（初期ロード）

**Data Sources**：
- `sitter_profiles` ⨝ `users`（JOIN）
- 集計：`reviews` から `reviewee_id` ごとの `avg(rating)` / `count()`
- 空き状況：`sitter_availabilities` の日程重複チェック

**Query（PostgREST）**：
```typescript
supabase
  .from('sitter_profiles')
  .select(`
    user_id,
    users!inner(display_name, avatar_url, area_city),
    bio,
    base_rate,
    services,
    reviews_agg:reviews(count, avg_rating:rating.avg())
  `)
  .eq('acceptance_status', 'active')
  .eq('users.area_city', filters.city)
  .order('reviews_agg.avg_rating', { ascending: false })
  .range(page * 20, page * 20 + 19);
```

**Actions**：
- カードタップ → `/owner/sitter/[id]` へ遷移
- お気に入り★ → `favorite_sitters` に upsert
- 条件変更 → URL更新＋再取得

**States**：
| 状態 | 表示 |
|---|---|
| loading（初回） | スケルトンカード5枚 |
| loading（次ページ） | 末尾にスピナー |
| empty | 「条件を変えてお試しください」＋候補CTA |
| error | 「接続エラー」＋再試行ボタン |
| success | カードリスト |

**Edge Cases**：
- エリア絞込でシッター0人 → 近隣エリア候補を表示
- 日程がまだ設定されていない → 全シッター表示 + 「日程を入れるとより正確」トースト
- 位置情報権限なし → area を「未指定」としてトップエリア順

---

#### 画面：O-007 予約作成フォーム

**Purpose**：シッターへの依頼を入力〜送信する

**Route**：`/owner/booking/new?sitter_id=xxx`

**Sections（ステップ）**：
1. 日程選択（開始日時・終了日時）
2. 対象の猫選択（自分の猫リストから複数選択可）
3. サービス内容（訪問 or 預かり／お世話内容のチェックボックス）
4. 要望メモ（自由記述）
5. 見積もり確認（自動計算）
6. 送信

**見積もり計算ロジック**：
```typescript
const totalAmount = (
  baseFee                        // シッター設定の基本料金
  + optionFees.sum               // お世話内容ごとの追加料金
  + travelFee                    // 距離に応じた交通費
  + (insuranceOn ? 200 : 0)      // 保険料
) * (1 + platformFeeRate);       // プラットフォーム手数料15%
```

**Validation（zod）**：
```typescript
const bookingSchema = z.object({
  startAt: z.date().min(addHours(new Date(), 24), '24時間以降を指定してください'),
  endAt: z.date(),
  catIds: z.array(z.string().uuid()).min(1, '猫を1匹以上選択してください'),
  serviceType: z.enum(['visit', 'boarding']),
  notes: z.string().max(500).optional(),
  insuranceOptIn: z.boolean().default(true),
}).refine(data => data.endAt > data.startAt, '終了日時は開始日時より後に設定してください');
```

**送信フロー**：
```
[ユーザー送信]
   │
   ▼ POST /functions/v1/bookings/create
[Edge Function: create-booking]
   │
   ├─ 入力検証
   ├─ シッターの受付状態確認
   ├─ 日程重複チェック
   ├─ bookings テーブルに requested で INSERT
   ├─ シッターに Push 通知
   └─ 返却：booking_id
   │
   ▼
[画面: 予約詳細へ遷移]
```

**Edge Cases**：
- シッターが受付停止中 → エラー「現在受付を停止中です」
- 既に同時間帯で他予約 confirmed → エラー「その時間帯は予約できません」
- 猫未登録 → 猫登録画面へ誘導

---

#### 画面：O-011 チャットルーム

**Purpose**：予約ごとの1対1チャット

**Route**：`/owner/chat/[bookingId]` / `/sitter/chat/[bookingId]`

**データ同期戦略**：
- 初回：過去50件を取得（`messages.order(created_at DESC).limit(50)`）
- 継続：Supabase Realtime の `postgres_changes` で `INSERT` を購読
- 楽観的更新：送信時に即UI反映、失敗時にロールバック＋再送ボタン表示

**メッセージ種別**：
| type | 表示 | contentスキーマ |
|---|---|---|
| text | テキストバブル | `{ body: string }` |
| image | 画像サムネ → タップで全画面 | `{ url: string, width: number, height: number }` |
| sticker | 猫スタンプ | `{ sticker_id: string }` |
| report | お世話報告カード | `{ meal: boolean, litter: boolean, play: boolean, notes: string, photos: string[] }` |

**送信UIパーツ**：
- テキスト入力欄
- 肉球型送信ボタン（カスタムコンポーネント `PawSendButton`）
  - タップ → `scale: 1 → 0.85 → 1` のバネアニメ
  - 空欄時は非活性グレー表示
- 画像添付ボタン（📷アイコン）
- スタンプパネルトグル（🐾アイコン）
- お世話報告カードトグル（📝アイコン、シッターのみ表示）

**エラーハンドリング**：
- Realtime切断時：ポーリングフォールバック（15秒間隔）
- 画像アップロード失敗：リトライ3回 + 手動再送
- メッセージ送信失敗：ステータス「未送信」で残し、再送アイコン表示

---

### 1.3 共通コンポーネント設計

#### デザイントークン
```typescript
// tokens/colors.ts
export const colors = {
  owner: {
    primary: '#F59E0B',      // Amber 500
    primaryDark: '#D97706',
    accent: '#FB923C',       // Orange 400 (coral)
    bg: '#FFFBF5',
  },
  sitter: {
    primary: '#10B981',      // Emerald 500
    primaryDark: '#059669',
    accent: '#34D399',
    bg: '#F0FDF4',
  },
  neutral: {
    text: '#1F2937',
    textSub: '#6B7280',
    border: '#E5E7EB',
    bg: '#FFFFFF',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

// tokens/typography.ts
export const typography = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '400', lineHeight: 16 },
};

// tokens/spacing.ts
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
```

#### 主要コンポーネント
| コンポーネント | 用途 |
|---|---|
| `<PawSendButton />` | 肉球送信ボタン |
| `<CatAvatar size="sm|md|lg" />` | 猫アバター（代替アイコン付き） |
| `<RatingStars rating={4.5} />` | 星評価 |
| `<PriceTag amount={5000} />` | 価格表示（¥記号・3桁区切り） |
| `<BookingStatusBadge status={...} />` | 予約ステータスバッジ |
| `<CareReportCard />` | お世話報告カード |
| `<EmptyState icon message cta />` | 空状態共通 |
| `<ErrorState onRetry />` | エラー状態共通 |

---

## 2. 状態遷移図

### 2.1 予約ステータス

```
                   [予約依頼]
                       │
                       ▼
                 [requested]
                    /     \
         承諾      /       \   辞退 / タイムアウト(72h)
                 ▼         ▼
            [accepted]  [declined] ─────┐
                 │                       │
        与信確保 │                       │
                 ▼                       │
           [confirmed] ◀─── 条件変更     │
           /    |    \                   │
    72h前  /     |     \ 24h以内         │
  キャンセル    |      キャンセル         │
       ▼      完了      ▼                │
  [cancelled]  報告  [cancelled]         │
               ▼                         │
          [completed] ─── トラブル       │
               │              ▼          │
        レビュー可           [disputed] ──┘
```

### 2.2 シッター承認ステータス

```
[アカウント作成]
     │
     ▼
[draft]───(申請送信)───▶[under_review]
                              │
               ┌──────────────┼──────────────┐
               │              │              │
      目視審査OK      修正要望      審査NG
               ▼              ▼              ▼
          [approved]   [revision_requested]  [rejected]
               │              │
         公開開始         再申請            (再申請不可)
               │              │
               ▼              ▼
          [active] ◀──────────┘
               │
      自分で受付停止
               ▼
          [paused] ──(再開)──▶ active
               │
       規約違反検知
               ▼
          [suspended] (運営介入)
```

### 2.3 レビュー公開ロジック

```
[サービス完了] → 24h ウェイト
     │
     ▼
双方に通知配信
     │
     ├─ 飼い主 → review_submit (owner_to_sitter)
     └─ シッター → review_submit (sitter_to_owner)
     │
     ▼
両方送信完了 OR 7日経過
     │
     ▼
published_at を両方に同時セット（atomic）
     │
     ▼
公開
     │
     ▼
シッターの平均評価を再計算（trigger）
```

---

## 3. Edge Function シーケンス設計

### 3.1 関数一覧

| 関数名 | エンドポイント | トリガー |
|---|---|---|
| `create-booking` | POST `/functions/v1/bookings/create` | クライアント |
| `accept-booking` | POST `/functions/v1/bookings/accept` | クライアント（sitter） |
| `decline-booking` | POST `/functions/v1/bookings/decline` | クライアント（sitter） |
| `confirm-booking` | POST `/functions/v1/bookings/confirm` | クライアント（owner、与信確保後） |
| `cancel-booking` | POST `/functions/v1/bookings/cancel` | クライアント |
| `complete-booking` | POST `/functions/v1/bookings/complete` | クライアント（sitter） |
| `submit-review` | POST `/functions/v1/reviews/submit` | クライアント |
| `send-push` | 内部呼び出し（他関数から） | - |
| `stripe-webhook` | POST `/functions/v1/webhooks/stripe` | Stripe |
| `cron-review-reminder` | - | スケジュール（毎時） |
| `cron-schedule-generate` | - | スケジュール（日次 0:00） |
| `cron-monthly-payout` | - | スケジュール（月次 1日） |

### 3.2 シーケンス例：`create-booking`

```typescript
// supabase/functions/bookings/create.ts
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const bodySchema = z.object({
  sitter_id: z.string().uuid(),
  cat_ids: z.array(z.string().uuid()).min(1),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  service_type: z.enum(['visit', 'boarding']),
  notes: z.string().max(500).optional(),
  insurance_opt_in: z.boolean(),
});

export default async function handler(req: Request) {
  // 1. 認証
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    global: { headers: { Authorization: req.headers.get('Authorization')! } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return errorResponse('UNAUTHORIZED', 401);

  // 2. 入力検証
  const body = bodySchema.parse(await req.json());

  // 3. シッター受付状態確認
  const { data: sitter } = await supabase
    .from('sitter_profiles')
    .select('acceptance_status, base_rate, user_id')
    .eq('user_id', body.sitter_id)
    .single();
  if (!sitter || sitter.acceptance_status !== 'active') {
    return errorResponse('SITTER_NOT_AVAILABLE', 400);
  }

  // 4. 日程重複チェック
  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('sitter_id', body.sitter_id)
    .in('status', ['accepted', 'confirmed'])
    .lt('start_at', body.end_at)
    .gt('end_at', body.start_at);
  if (count && count > 0) {
    return errorResponse('TIME_CONFLICT', 409);
  }

  // 5. 見積もり計算
  const amounts = calcAmounts(body, sitter.base_rate);

  // 6. INSERT
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      owner_id: user.id,
      sitter_id: body.sitter_id,
      cat_ids: body.cat_ids,
      start_at: body.start_at,
      end_at: body.end_at,
      service_type: body.service_type,
      base_fee: amounts.base,
      option_fee: amounts.options,
      insurance_fee: amounts.insurance,
      platform_fee: amounts.platform,
      total_amount: amounts.total,
      notes: body.notes,
      status: 'requested',
    })
    .select()
    .single();
  if (error) throw error;

  // 7. シッターへプッシュ通知
  await sendPush({
    toUserId: body.sitter_id,
    category: 'booking_request',
    title: '新着の予約依頼',
    body: `${formatDate(body.start_at)} のシッティング依頼が届きました`,
    data: { booking_id: booking.id },
  });

  // 8. 成功レスポンス
  return successResponse({ booking });
}
```

### 3.3 シーケンス例：`complete-booking` + 決済確定

```
[sitter] POST /functions/v1/bookings/complete
   │
   ▼
[Edge Function]
   │
   ├─ 権限チェック（auth.uid() == booking.sitter_id）
   ├─ status が 'confirmed' であることを確認
   ├─ Stripe PaymentIntent を capture
   ├─ Stripe Connect Transfer（取引額×85% を sitter の Connect Account へ）
   ├─ bookings.status を 'completed' に更新
   ├─ 24時間後レビュー依頼をスケジュール登録
   └─ 飼い主にプッシュ通知「シッティング完了」
   │
   ▼
[Stripe Webhook]
   ├─ payment_intent.succeeded 受信
   └─ 二重処理防止のため idempotency_key で確認
```

---

## 4. データベース DDL（抜粋）

```sql
-- ========== users (拡張) ==========
-- Supabase Auth の auth.users をベースに、public.users を拡張テーブルとして作成
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  role_owner boolean not null default true,
  role_sitter boolean not null default false,
  area_prefecture text,
  area_city text,
  phone_encrypted bytea,
  notification_preferences jsonb not null default '{
    "message": true,
    "review_request": true,
    "calendar_reminder": true,
    "marketing": false
  }'::jsonb,
  expo_push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_users_updated_at before update on public.users
for each row execute function public.set_updated_at();

alter table public.users enable row level security;

create policy "users_self_read" on public.users
  for select using (auth.uid() = id);

create policy "users_self_update" on public.users
  for update using (auth.uid() = id);

create policy "users_public_profile_read" on public.users
  for select using (role_sitter = true);

-- ========== cats ==========
create table public.cats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  breed text,
  gender text check (gender in ('male','female','unknown')),
  birth_date date,
  avatar_url text,
  personality_tags jsonb not null default '[]'::jsonb,
  allergy_notes text,
  medical_history jsonb not null default '[]'::jsonb,
  weight_history jsonb not null default '[]'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.cats(owner_id) where deleted_at is null;

alter table public.cats enable row level security;
create policy "cats_owner_all" on public.cats
  for all using (auth.uid() = owner_id);

-- ========== sitter_profiles ==========
create table public.sitter_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  bio text,
  experience_years int,
  license_number text,
  license_verified boolean not null default false,
  services jsonb not null default '{"visit": true, "boarding": false}'::jsonb,
  base_rate int not null default 3000,
  option_fees jsonb not null default '{}'::jsonb,
  service_area jsonb not null default '[]'::jsonb,
  acceptance_status text not null default 'draft'
    check (acceptance_status in ('draft','under_review','active','paused','suspended','rejected')),
  approved_at timestamptz,
  stripe_connect_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.sitter_profiles(acceptance_status);

alter table public.sitter_profiles enable row level security;

create policy "sitter_self_all" on public.sitter_profiles
  for all using (auth.uid() = user_id);

create policy "sitter_active_read" on public.sitter_profiles
  for select using (acceptance_status = 'active');

-- ========== bookings ==========
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id),
  sitter_id uuid not null references public.users(id),
  cat_ids uuid[] not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  service_type text not null check (service_type in ('visit','boarding')),
  base_fee int not null,
  option_fee int not null default 0,
  insurance_fee int not null default 0,
  platform_fee int not null,
  total_amount int not null,
  notes text,
  status text not null default 'requested'
    check (status in (
      'requested','accepted','confirmed','completed',
      'cancelled','declined','disputed'
    )),
  stripe_payment_intent_id text,
  cancellation_reason text,
  cancelled_by uuid references public.users(id),
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index on public.bookings(owner_id, status, start_at desc);
create index on public.bookings(sitter_id, status, start_at desc);
create index on public.bookings(status, start_at) where status in ('accepted','confirmed');

alter table public.bookings enable row level security;

create policy "bookings_related_read" on public.bookings
  for select using (auth.uid() in (owner_id, sitter_id));

-- 更新・削除は Edge Function 経由のみ (service_role で操作)

-- ========== messages ==========
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.users(id),
  type text not null check (type in ('text','image','sticker','report')),
  content jsonb not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.messages(booking_id, created_at desc);

alter table public.messages enable row level security;

create policy "messages_related_read" on public.messages
  for select using (
    exists (
      select 1 from public.bookings b
      where b.id = messages.booking_id
        and auth.uid() in (b.owner_id, b.sitter_id)
    )
  );

create policy "messages_related_insert" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = messages.booking_id
        and auth.uid() in (b.owner_id, b.sitter_id)
        and b.status in ('accepted','confirmed','completed')
    )
  );

-- ========== reviews ==========
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references public.users(id),
  reviewee_id uuid not null references public.users(id),
  direction text not null check (direction in ('owner_to_sitter','sitter_to_owner')),
  rating int not null check (rating between 1 and 5),
  comment text,
  photos text[] not null default '{}',
  published_at timestamptz,
  reported_at timestamptz,
  created_at timestamptz not null default now(),
  unique(booking_id, direction)
);

create index on public.reviews(reviewee_id, published_at desc) where published_at is not null;

alter table public.reviews enable row level security;
create policy "reviews_public_read" on public.reviews
  for select using (published_at is not null);
create policy "reviews_self_read" on public.reviews
  for select using (auth.uid() in (reviewer_id, reviewee_id));

-- ========== journal_posts ==========
create table public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  cat_id uuid references public.cats(id),
  text text,
  photos text[] not null default '{}',
  visibility text not null default 'public'
    check (visibility in ('private','followers','public')),
  like_count int not null default 0,
  comment_count int not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.journal_posts(author_id, created_at desc) where deleted_at is null;
create index on public.journal_posts(visibility, created_at desc)
  where visibility = 'public' and deleted_at is null;

alter table public.journal_posts enable row level security;

create policy "journal_public_read" on public.journal_posts
  for select using (
    deleted_at is null and (
      visibility = 'public'
      or author_id = auth.uid()
    )
  );

create policy "journal_self_write" on public.journal_posts
  for all using (author_id = auth.uid());

-- ========== schedules ==========
create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.cats(id) on delete cascade,
  type text not null check (type in (
    'food_purchase','litter_change','vaccine','filaria','custom'
  )),
  scheduled_at timestamptz not null,
  is_auto_generated boolean not null default false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.schedules(cat_id, scheduled_at);

alter table public.schedules enable row level security;

create policy "schedules_owner_all" on public.schedules
  for all using (
    exists (
      select 1 from public.cats c
      where c.id = schedules.cat_id and c.owner_id = auth.uid()
    )
  );

-- ========== 共通: updated_at トリガー ==========
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ========== 匿名化トリガー（ユーザー削除時） ==========
create or replace function public.anonymize_user_references()
returns trigger language plpgsql security definer as $$
begin
  update public.reviews set comment = '(削除されたユーザー)' where reviewer_id = old.id;
  update public.journal_posts set deleted_at = now() where author_id = old.id;
  return old;
end;
$$;
```

---

## 5. API仕様（OpenAPI 3.1 抜粋）

`api/openapi.yaml` に全量。ここでは主要エンドポイントのみ。

```yaml
openapi: 3.1.0
info:
  title: Nekomews API
  version: 0.1.0
servers:
  - url: https://xxx.supabase.co/functions/v1

paths:
  /bookings/create:
    post:
      summary: 予約依頼の作成
      security: [ { bearerAuth: [] } ]
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BookingCreateRequest'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BookingResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          $ref: '#/components/responses/TimeConflict'

  /bookings/{id}/accept:
    post:
      summary: シッターによる予約承諾
      security: [ { bearerAuth: [] } ]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200': { $ref: '#/components/responses/BookingOk' }
        '404': { $ref: '#/components/responses/NotFound' }

  /reviews/submit:
    post:
      summary: レビューの送信
      security: [ { bearerAuth: [] } ]
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ReviewSubmitRequest'
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReviewResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    BookingCreateRequest:
      type: object
      required: [sitter_id, cat_ids, start_at, end_at, service_type]
      properties:
        sitter_id: { type: string, format: uuid }
        cat_ids:
          type: array
          items: { type: string, format: uuid }
          minItems: 1
        start_at: { type: string, format: date-time }
        end_at: { type: string, format: date-time }
        service_type:
          type: string
          enum: [visit, boarding]
        notes: { type: string, maxLength: 500 }
        insurance_opt_in: { type: boolean }

    Booking:
      type: object
      properties:
        id: { type: string, format: uuid }
        owner_id: { type: string, format: uuid }
        sitter_id: { type: string, format: uuid }
        status:
          type: string
          enum: [requested, accepted, confirmed, completed, cancelled, declined, disputed]
        total_amount: { type: integer }
        # ...

    ReviewSubmitRequest:
      type: object
      required: [booking_id, rating]
      properties:
        booking_id: { type: string, format: uuid }
        rating: { type: integer, minimum: 1, maximum: 5 }
        comment: { type: string, maxLength: 2000 }
        photos:
          type: array
          items: { type: string, format: uri }
          maxItems: 6
```

---

## 6. ビジネスルール集

### 6.1 料金計算

```
総額 = (基本料金 × 時間数 + オプション料金合計 + 交通費 + 保険料) × (1 + プラットフォーム手数料率)

基本料金：シッターが設定（時給ベース）
時間数：min(end_at - start_at, 12時間) / 時間
オプション：{食事: +500, トイレ: +300, 遊び: +500, 投薬: +800}
交通費：0〜5km: 0 / 5〜10km: 300 / 10〜20km: 600 / 20km〜: 1,000
保険料：150〜300円（保険会社決定、一旦200円固定）
プラットフォーム手数料率：15%（シッター側負担）
```

### 6.2 キャンセル料

| タイミング | 飼い主請求 | シッター受取 | プラットフォーム |
|---|---|---|---|
| 確定〜72時間前 | 0円 | 0円 | 0円 |
| 72h〜24h前 | 総額50% | 総額×85%×50% | 総額×15%×50% |
| 24h以内 | 総額100% | 総額×85% | 総額×15% |
| シッター都合 | 0円 | −規約違反ポイント | 違約金 |

### 6.3 レビュー公開ルール
- 両者送信 or 7日経過で同時公開
- 星1かつコメント200文字以上は自動で運営キュー行き（荒らし対策）
- 公開後24時間は報告受付、違反時は非表示

### 6.4 シッターランキング要素（検索ソート用）
```
score = 0.4 × avg_rating
      + 0.2 × log(completed_bookings + 1)
      + 0.2 × response_rate
      + 0.1 × license_verified
      + 0.1 × recency(最終ログイン)
```

### 6.5 通報・違反対応
- 軽微：警告 → 2回で一時停止（7日）
- 重大：即時停止 → 運営審査
- 決済トラブル：運営が介入、disputed ステータスで保留

---

## 7. エラーハンドリング詳細

### 7.1 エラーコード定義

| コード | HTTPステータス | 説明 |
|---|---|---|
| `UNAUTHORIZED` | 401 | 未認証 |
| `FORBIDDEN` | 403 | 認可不足 |
| `NOT_FOUND` | 404 | 対象なし |
| `VALIDATION_ERROR` | 400 | 入力不正 |
| `TIME_CONFLICT` | 409 | 日程重複 |
| `SITTER_NOT_AVAILABLE` | 400 | シッター受付停止中 |
| `PAYMENT_FAILED` | 402 | 決済失敗 |
| `ALREADY_REVIEWED` | 409 | レビュー既存 |
| `RATE_LIMITED` | 429 | レート制限 |
| `INTERNAL_ERROR` | 500 | サーバー内部 |

### 7.2 クライアントのリトライ方針

| エラー | 挙動 |
|---|---|
| ネットワーク | 指数バックオフで最大3回 |
| 401 | トークンリフレッシュ → 1回再試行 |
| 409（日程重複） | リトライ禁止、ユーザーに再入力促す |
| 429 | リトライ禁止、待機メッセージ |
| 5xx | 指数バックオフで最大2回 |

---

## 8. 分析イベント設計（PostHog）

### 8.1 主要イベント
| イベント名 | プロパティ |
|---|---|
| `app_opened` | `platform`, `version` |
| `sign_up_completed` | `method` |
| `onboarding_completed` | `duration_sec`, `skipped` |
| `cat_registered` | `breed`, `gender` |
| `sitter_searched` | `area`, `date_from`, `date_to`, `results_count` |
| `sitter_detail_viewed` | `sitter_id`, `referrer` |
| `booking_requested` | `service_type`, `total_amount`, `insurance` |
| `booking_confirmed` | `booking_id`, `days_from_request` |
| `booking_cancelled` | `reason`, `timing_category` |
| `message_sent` | `type` |
| `review_submitted` | `rating`, `has_photo` |
| `journal_post_created` | `visibility`, `has_photo` |

### 8.2 ファネル定義
**主要ファネル：予約成立率**
```
sitter_searched → sitter_detail_viewed → booking_requested → booking_confirmed
   目標: 60%           25%                   8%
```

---

## 9. 実装計画（12週スプリント）

| 週 | スプリント | 主な成果物 |
|---|---|---|
| 1 | Sprint 0 | リポジトリ、環境、Supabase初期化、CI/CD |
| 2 | Sprint 1 | 認証・オンボーディング・猫登録 |
| 3 | Sprint 2 | シッタープロフィール・申請フロー |
| 4 | Sprint 3 | シッター検索・詳細 |
| 5 | Sprint 4 | 予約作成〜承諾フロー |
| 6 | Sprint 5 | 決済（Stripe Connect） |
| 7 | Sprint 6 | チャット（Realtime） |
| 8 | Sprint 7 | レビューフロー・通知 |
| 9 | Sprint 8 | カレンダー・自動スケジュール |
| 10 | Sprint 9 | ねこ日記（MVP範囲） |
| 11 | Sprint 10 | 管理画面・運用機能 |
| 12 | Sprint 11 | E2E・負荷・ソフトローンチ準備 |

---

**以上 v0.1 詳細設計。Build層エージェント（#14/15/17）の直接入力として利用する。**
