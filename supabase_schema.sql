-- ===================================================================
-- ExamBuddy v1.0 — Supabase Schema
-- Aa file Supabase SQL Editor ma paste karine RUN karo.
-- "create table if not exists" che, etle already existing tables
-- ne kai nuksan nahi thay — j tables nathi e j navi banashe.
-- ===================================================================

-- 1. PROFILES (user details, register page thi)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  exam_target text,
  created_at timestamptz default now()
);

-- 2. QUESTIONS (quiz + mock test ni question bank, admin thi upload thay)
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null, -- 'A' / 'B' / 'C' / 'D' (uppercase)
  explanation text,
  exam_tag text,
  created_at timestamptz default now()
);
create index if not exists idx_questions_subject on questions(subject);

-- 3. QUIZ_HISTORY (har quiz/mock-test attempt no record)
create table if not exists quiz_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subject_name text,
  score numeric,
  total int,
  created_at timestamptz default now()
);
create index if not exists idx_quiz_history_user on quiz_history(user_id);

-- 4. USER_DIAMONDS (gamification currency, quiz pachi diamonds male)
create table if not exists user_diamonds (
  user_id uuid primary key references auth.users(id) on delete cascade,
  diamonds int default 0
);

-- 5. BOOKMARKS (saved questions)
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  created_at timestamptz default now()
);
create index if not exists idx_bookmarks_user on bookmarks(user_id);

-- 6. USER_PREMIUM (Razorpay subscription status)
create table if not exists user_premium (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text,
  payment_id text,
  order_id text,
  expires_at timestamptz,
  is_active boolean default false
);

-- 7. DAILY_CURRENT_AFFAIRS (cron job thi daily AI generated news)
create table if not exists daily_current_affairs (
  date date primary key,
  articles jsonb,
  generated_at timestamptz default now()
);

-- 8. FLASHCARDS (AI generated, subject-wise cached)
create table if not exists flashcards (
  subject text primary key,
  cards jsonb,
  generated_at timestamptz default now()
);

-- 9. STUDY_MATERIALS (v1.1 marketplace feature, abhi thi banavi rakhi che)
create table if not exists study_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  topic text,
  topic_id text,
  material_type text default 'notes',
  file_url text,
  file_type text,
  is_free boolean default true,
  price numeric default 0,
  created_at timestamptz default now()
);

-- 10. UNLOCKED_MATERIALS (kone kya material diamonds thi unlock karyu)
create table if not exists unlocked_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  material_id uuid references study_materials(id) on delete cascade,
  created_at timestamptz default now()
);

-- ===================================================================
-- ROW LEVEL SECURITY (RLS)
-- Supabase ma default RLS ON hoy to data nahi dekhay/save thay.
-- Aa minimal policies che jethi app kaam kare. Production mate
-- tightening kari shakay, pan v1.0 launch mate aa enough che.
-- ===================================================================

alter table profiles enable row level security;
alter table questions enable row level security;
alter table quiz_history enable row level security;
alter table user_diamonds enable row level security;
alter table bookmarks enable row level security;
alter table user_premium enable row level security;
alter table daily_current_affairs enable row level security;
alter table flashcards enable row level security;
alter table study_materials enable row level security;
alter table unlocked_materials enable row level security;

-- Questions: badha (logged in ke nahi) read kari shake
drop policy if exists "questions_select_all" on questions;
create policy "questions_select_all" on questions for select using (true);

-- Current affairs / flashcards / study materials: public read
drop policy if exists "ca_select_all" on daily_current_affairs;
create policy "ca_select_all" on daily_current_affairs for select using (true);

drop policy if exists "flashcards_select_all" on flashcards;
create policy "flashcards_select_all" on flashcards for select using (true);

drop policy if exists "materials_select_all" on study_materials;
create policy "materials_select_all" on study_materials for select using (true);

-- Profiles: user khud nu data read/write kari shake
drop policy if exists "profiles_own" on profiles;
create policy "profiles_own" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Quiz history, diamonds, bookmarks, premium, unlocked: user khud nu j access kare
drop policy if exists "quiz_history_own" on quiz_history;
create policy "quiz_history_own" on quiz_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "diamonds_own" on user_diamonds;
create policy "diamonds_own" on user_diamonds for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "bookmarks_own" on bookmarks;
create policy "bookmarks_own" on bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "premium_own" on user_premium;
create policy "premium_own" on user_premium for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "unlocked_own" on unlocked_materials;
create policy "unlocked_own" on unlocked_materials for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
