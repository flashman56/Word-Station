-- =============================================================================
-- 单词小站（Word Station）· 初始建库脚本
-- -----------------------------------------------------------------------------
-- 用法：Supabase Dashboard → SQL Editor → 粘贴全部 → Run
-- 幂等性：所有 create 均带 if not exists / or replace，可重复执行。
--
-- 红线提醒：
--   1) learn_records 严禁出现 ease / interval / lapses / reps 等 SRS 字段，
--      唯一调度规则是 next_due_at = 答错时刻 + 24h（前端 INCORRECT_DUE_MS）。
--   2) dict_cache 启用 RLS 但不建任何策略 —— 客户端全拒，只有 service_role 可读写。
--   3) 每个业务表的策略必须同时写 using 与 with check，防止把行改成别人的 owner_id。
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 0) profiles（昵称 / 展示名，由 auth.users 触发器自动建行）
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 1) stations 小站
-- -----------------------------------------------------------------------------
create table if not exists public.stations (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 40),
  pinned     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists stations_owner_updated_idx
  on public.stations (owner_id, pinned desc, updated_at desc);
create unique index if not exists stations_owner_name_uniq
  on public.stations (owner_id, lower(btrim(name)));

-- -----------------------------------------------------------------------------
-- 2) station_words 小站词条（word_key: 'w.<form>' | 'u.<form_key>'）
-- -----------------------------------------------------------------------------
create table if not exists public.station_words (
  id         uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations(id) on delete cascade,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  word_key   text not null,
  source     text not null check (source in ('public','user')),
  note       text,
  added_at   timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists station_words_uniq
  on public.station_words (station_id, word_key);
create index if not exists station_words_list_idx
  on public.station_words (station_id, added_at desc);
create index if not exists station_words_owner_idx
  on public.station_words (owner_id, station_id);

-- -----------------------------------------------------------------------------
-- 3) user_words 用户私有词库
--    红线：phonetic_br 只来自 dict_cache 查表，模型产出的音标一律丢弃
-- -----------------------------------------------------------------------------
create table if not exists public.user_words (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users(id) on delete cascade,
  form              text not null,
  form_key          text not null,
  word_key          text not null,
  pos               text,
  gloss             text,
  phonetic_br       text,
  phonetic_status   text not null default 'pending' check (phonetic_status in ('ok','pending')),
  example           jsonb,
  usage             text,
  cefr              text check (cefr in ('A1','A2','B1','B2','C1','C2')),
  freq_rank         int,
  morphs            text[] not null default '{}',
  chain             jsonb not null default '[]',
  source            text not null default 'ai' check (source in ('ai','manual')),
  edited_by_user    boolean not null default false,
  generation_status text not null default 'ready'
                      check (generation_status in ('pending','ready','failed')),
  gen_error         text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create unique index if not exists user_words_owner_form_uniq
  on public.user_words (owner_id, form_key);
create index if not exists user_words_owner_updated_idx
  on public.user_words (owner_id, updated_at desc);

-- -----------------------------------------------------------------------------
-- 4) learn_records 学习进度（严禁 SRS 字段）
-- -----------------------------------------------------------------------------
create table if not exists public.learn_records (
  owner_id            uuid not null references auth.users(id) on delete cascade,
  word_key            text not null,
  status              text not null check (status in ('unknown','review','known')),
  correct_count       int  not null default 0,
  consecutive_correct int  not null default 0,
  incorrect_count     int  not null default 0,
  last_studied_at     timestamptz,
  last_result         text check (last_result in ('correct','incorrect')),
  last_incorrect_at   timestamptz,
  next_due_at         timestamptz,
  status_changed_at   timestamptz,
  status_source       text,
  updated_at          timestamptz not null default now(),
  primary key (owner_id, word_key)
);
create index if not exists learn_records_due_idx
  on public.learn_records (owner_id, status, next_due_at);
create index if not exists learn_records_sync_idx
  on public.learn_records (owner_id, updated_at desc);

-- -----------------------------------------------------------------------------
-- 5) dict_cache 服务端词典 + 跨用户生成缓存（客户端无访问策略）
-- -----------------------------------------------------------------------------
create table if not exists public.dict_cache (
  form_key       text primary key,
  word_id        text,
  phonetic       text,
  payload        jsonb,
  model          text,
  prompt_version text,
  hit_count      int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists dict_cache_public_idx
  on public.dict_cache (word_id) where word_id is not null;

-- -----------------------------------------------------------------------------
-- 6) generation_usage 日配额
-- -----------------------------------------------------------------------------
create table if not exists public.generation_usage (
  owner_id uuid not null references auth.users(id) on delete cascade,
  day      date not null default (now() at time zone 'utc')::date,
  used     int  not null default 0,
  quota    int  not null default 50,
  primary key (owner_id, day)
);

-- -----------------------------------------------------------------------------
-- 辅助函数：校验小站归属（station_words 的 with check 必须用它，
-- 因为 owner_id 是冗余列、可被伪造）
-- -----------------------------------------------------------------------------
create or replace function public.station_owned_by_me(sid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.stations s where s.id = sid and s.owner_id = auth.uid());
$$;
revoke all on function public.station_owned_by_me(uuid) from public;
grant execute on function public.station_owned_by_me(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 原子扣减配额（SECURITY DEFINER，避免读-改-写竞态）
-- -----------------------------------------------------------------------------
create or replace function public.consume_generation_quota(n int default 1)
returns table (used int, quota int, allowed boolean)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  d   date := (now() at time zone 'utc')::date;
begin
  if uid is null then raise exception 'not authenticated'; end if;

  insert into public.generation_usage (owner_id, day, used)
  values (uid, d, 0)
  on conflict (owner_id, day) do nothing;

  update public.generation_usage g
     set used = g.used + n
   where g.owner_id = uid and g.day = d and g.used + n <= g.quota
  returning g.used, g.quota, true into used, quota, allowed;

  if used is null then
    select g.used, g.quota, false into used, quota, allowed
      from public.generation_usage g where g.owner_id = uid and g.day = d;
  end if;

  return next;
end;
$$;
revoke all on function public.consume_generation_quota(int) from public;
grant execute on function public.consume_generation_quota(int) to authenticated;

-- -----------------------------------------------------------------------------
-- 新用户自动建 profiles 行（避免前端伪造 id）
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- RLS：所有表启用；业务表建 owner 策略（using + with check 都要写）
-- -----------------------------------------------------------------------------
alter table public.stations         enable row level security;
alter table public.station_words    enable row level security;
alter table public.user_words       enable row level security;
alter table public.learn_records    enable row level security;
alter table public.profiles         enable row level security;
alter table public.generation_usage enable row level security;
alter table public.dict_cache       enable row level security;

drop policy if exists stations_owner on public.stations;
create policy stations_owner on public.stations
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists station_words_owner on public.station_words;
create policy station_words_owner on public.station_words
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.station_owned_by_me(station_id));

drop policy if exists user_words_owner on public.user_words;
create policy user_words_owner on public.user_words
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists learn_records_owner on public.learn_records;
create policy learn_records_owner on public.learn_records
  for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists usage_self_read on public.generation_usage;
create policy usage_self_read on public.generation_usage
  for select to authenticated using (owner_id = auth.uid());

-- dict_cache 故意不建任何策略：anon / authenticated 全部被拒，
-- 只有 service_role（Edge Function）可读写 —— 这是「公共库只读」在服务端侧的保证。
