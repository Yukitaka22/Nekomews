-- ================================================================
-- Nekomews 初期スキーマ（冪等版）
-- Version: v0.2
-- Date: 2026-04-21
-- 何度実行してもOK
-- ================================================================

-- 拡張機能
create extension if not exists "pgcrypto" with schema "extensions";
create extension if not exists "uuid-ossp" with schema "extensions";

-- ================================================================
-- 関数：updated_at 自動更新
-- ================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ================================================================
-- 関数：auth.users 作成時に public.users を自動生成
-- ================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ================================================================
-- users
-- ================================================================
create table if not exists public.users (
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

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;
drop policy if exists "users_self_read" on public.users;
create policy "users_self_read" on public.users for select using (auth.uid() = id);
drop policy if exists "users_self_update" on public.users;
create policy "users_self_update" on public.users for update using (auth.uid() = id);
drop policy if exists "users_sitter_public_read" on public.users;
create policy "users_sitter_public_read" on public.users for select using (role_sitter = true);

-- ================================================================
-- cats
-- ================================================================
create table if not exists public.cats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  breed text,
  gender text check (gender in ('male', 'female', 'unknown')) default 'unknown',
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

create index if not exists cats_owner_id_idx on public.cats(owner_id) where deleted_at is null;

drop trigger if exists set_cats_updated_at on public.cats;
create trigger set_cats_updated_at
  before update on public.cats
  for each row execute function public.set_updated_at();

alter table public.cats enable row level security;
drop policy if exists "cats_owner_all" on public.cats;
create policy "cats_owner_all" on public.cats for all using (auth.uid() = owner_id);

-- ================================================================
-- sitter_profiles
-- ================================================================
create table if not exists public.sitter_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  bio text,
  experience_years int default 0,
  license_number text,
  license_verified boolean not null default false,
  services jsonb not null default '{"visit": true, "boarding": false}'::jsonb,
  base_rate int not null default 3000,
  option_fees jsonb not null default '{}'::jsonb,
  service_area jsonb not null default '[]'::jsonb,
  acceptance_status text not null default 'draft'
    check (acceptance_status in ('draft', 'under_review', 'active', 'paused', 'suspended', 'rejected')),
  approved_at timestamptz,
  stripe_connect_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sitter_profiles_status_idx on public.sitter_profiles(acceptance_status);

drop trigger if exists set_sitter_profiles_updated_at on public.sitter_profiles;
create trigger set_sitter_profiles_updated_at
  before update on public.sitter_profiles
  for each row execute function public.set_updated_at();

alter table public.sitter_profiles enable row level security;
drop policy if exists "sitter_self_all" on public.sitter_profiles;
create policy "sitter_self_all" on public.sitter_profiles for all using (auth.uid() = user_id);
drop policy if exists "sitter_active_public_read" on public.sitter_profiles;
create policy "sitter_active_public_read" on public.sitter_profiles for select using (acceptance_status = 'active');

-- ================================================================
-- bookings
-- ================================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id),
  sitter_id uuid not null references public.users(id),
  cat_ids uuid[] not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  service_type text not null check (service_type in ('visit', 'boarding')),
  base_fee int not null default 0,
  option_fee int not null default 0,
  insurance_fee int not null default 0,
  platform_fee int not null default 0,
  total_amount int not null default 0,
  notes text,
  status text not null default 'requested'
    check (status in ('requested', 'accepted', 'confirmed', 'completed', 'cancelled', 'declined', 'disputed')),
  stripe_payment_intent_id text,
  cancellation_reason text,
  cancelled_by uuid references public.users(id),
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists bookings_owner_idx on public.bookings(owner_id, status, start_at desc);
create index if not exists bookings_sitter_idx on public.bookings(sitter_id, status, start_at desc);
create index if not exists bookings_active_idx on public.bookings(status, start_at) where status in ('accepted', 'confirmed');

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;
drop policy if exists "bookings_related_read" on public.bookings;
create policy "bookings_related_read" on public.bookings for select using (auth.uid() in (owner_id, sitter_id));

-- ================================================================
-- messages
-- ================================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.users(id),
  type text not null check (type in ('text', 'image', 'sticker', 'report')),
  content jsonb not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_booking_idx on public.messages(booking_id, created_at desc);

alter table public.messages enable row level security;
drop policy if exists "messages_related_read" on public.messages;
create policy "messages_related_read" on public.messages for select using (
  exists (select 1 from public.bookings b where b.id = messages.booking_id and auth.uid() in (b.owner_id, b.sitter_id))
);
drop policy if exists "messages_related_insert" on public.messages;
create policy "messages_related_insert" on public.messages for insert with check (
  sender_id = auth.uid() and exists (
    select 1 from public.bookings b
    where b.id = messages.booking_id
      and auth.uid() in (b.owner_id, b.sitter_id)
      and b.status in ('accepted', 'confirmed', 'completed')
  )
);

-- ================================================================
-- reviews
-- ================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references public.users(id),
  reviewee_id uuid not null references public.users(id),
  direction text not null check (direction in ('owner_to_sitter', 'sitter_to_owner')),
  rating int not null check (rating between 1 and 5),
  comment text,
  photos text[] not null default '{}',
  published_at timestamptz,
  reported_at timestamptz,
  created_at timestamptz not null default now(),
  unique(booking_id, direction)
);

create index if not exists reviews_reviewee_idx on public.reviews(reviewee_id, published_at desc) where published_at is not null;

alter table public.reviews enable row level security;
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (published_at is not null);
drop policy if exists "reviews_self_read" on public.reviews;
create policy "reviews_self_read" on public.reviews for select using (auth.uid() in (reviewer_id, reviewee_id));

-- ================================================================
-- journal_posts
-- ================================================================
create table if not exists public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  cat_id uuid references public.cats(id),
  text text,
  photos text[] not null default '{}',
  visibility text not null default 'public' check (visibility in ('private', 'followers', 'public')),
  like_count int not null default 0,
  comment_count int not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_author_idx on public.journal_posts(author_id, created_at desc) where deleted_at is null;
create index if not exists journal_public_idx on public.journal_posts(visibility, created_at desc) where visibility = 'public' and deleted_at is null;

drop trigger if exists set_journal_posts_updated_at on public.journal_posts;
create trigger set_journal_posts_updated_at
  before update on public.journal_posts
  for each row execute function public.set_updated_at();

alter table public.journal_posts enable row level security;
drop policy if exists "journal_public_read" on public.journal_posts;
create policy "journal_public_read" on public.journal_posts for select using (
  deleted_at is null and (visibility = 'public' or author_id = auth.uid())
);
drop policy if exists "journal_self_write" on public.journal_posts;
create policy "journal_self_write" on public.journal_posts for all using (author_id = auth.uid());

-- ================================================================
-- schedules
-- ================================================================
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.cats(id) on delete cascade,
  type text not null check (type in ('food_purchase', 'litter_change', 'vaccine', 'filaria', 'custom')),
  scheduled_at timestamptz not null,
  is_auto_generated boolean not null default false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists schedules_cat_idx on public.schedules(cat_id, scheduled_at);

drop trigger if exists set_schedules_updated_at on public.schedules;
create trigger set_schedules_updated_at
  before update on public.schedules
  for each row execute function public.set_updated_at();

alter table public.schedules enable row level security;
drop policy if exists "schedules_owner_all" on public.schedules;
create policy "schedules_owner_all" on public.schedules for all using (
  exists (select 1 from public.cats c where c.id = schedules.cat_id and c.owner_id = auth.uid())
);

-- ================================================================
-- 完了
-- ================================================================
