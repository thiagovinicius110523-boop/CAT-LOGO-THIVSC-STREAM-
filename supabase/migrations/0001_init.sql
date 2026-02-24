-- V11 schema (Supabase/Postgres) — versão verificada v2
create extension if not exists "uuid-ossp";
do $$ begin create type catalog_type as enum ('cursos','livros','arquivos'); exception when duplicate_object then null; end $$;
do $$ begin create type user_role as enum ('admin','user'); exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists whitelist (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists app_settings (
  id int primary key default 1,
  theme text not null default 'Galaxy Soft (Padrão)',
  layout text not null default 'Modelo 01'
);

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  type catalog_type not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique(type, name)
);

create table if not exists items (
  id uuid primary key default uuid_generate_v4(),
  type catalog_type not null,
  category_id uuid not null references categories(id) on delete restrict,
  title text not null,
  meta text,
  description text,
  progress int not null default 0,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists home_content (
  id int primary key default 1,
  title text not null default 'Bem-vindo(a)!',
  subtitle text not null default 'Escolha uma aba: Cursos, Livros ou Arquivos.'
);

create table if not exists home_cards (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  kind text not null default 'notice',
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists course_modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references items(id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists course_lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references course_modules(id) on delete cascade,
  title text not null,
  description text,
  link text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references course_lessons(id) on delete cascade,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists lesson_comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references course_lessons(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  type catalog_type not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create or replace function public.is_admin_uid(p_uid uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=p_uid and p.role='admin');
$$;

create or replace function public.is_whitelisted_uid(p_uid uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.profiles p
    join public.whitelist w on lower(w.email)=lower(p.email)
    where p.id=p_uid and w.active=true
  );
$$;

alter table profiles enable row level security;
alter table whitelist enable row level security;
alter table app_settings enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table home_content enable row level security;
alter table home_cards enable row level security;
alter table notifications enable row level security;
alter table course_modules enable row level security;
alter table course_lessons enable row level security;
alter table lesson_progress enable row level security;
alter table lesson_comments enable row level security;
alter table user_favorites enable row level security;

create policy "profiles_read_own_or_admin" on profiles for select using (auth.uid()=id or public.is_admin_uid(auth.uid()));
create policy "profiles_update_own" on profiles for update using (auth.uid()=id) with check (auth.uid()=id);

create policy "whitelist_admin_only" on whitelist for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid()));

create policy "settings_read_whitelisted" on app_settings for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid()));
create policy "settings_write_admin" on app_settings for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid()));

create policy "categories_read_whitelisted" on categories for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid()));
create policy "categories_write_admin" on categories for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid()));

create policy "items_read_whitelisted" on items for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid()));
create policy "items_write_admin" on items for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid()));

create policy "home_read_whitelisted" on home_content for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid()));
create policy "home_write_admin" on home_content for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid()));

create policy "home_cards_read_whitelisted" on home_cards for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid()));
create policy "home_cards_write_admin" on home_cards for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid()));

create policy "notifications_read_whitelisted" on notifications for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid()));
create policy "notifications_write_admin" on notifications for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid()));

create policy "modules_read_whitelisted" on course_modules for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid()));
create policy "modules_write_admin" on course_modules for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid()));

create policy "lessons_read_whitelisted" on course_lessons for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid()));
create policy "lessons_write_admin" on course_lessons for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid()));

create policy "progress_read_own_or_admin" on lesson_progress for select using (auth.uid()=user_id or public.is_admin_uid(auth.uid()));
create policy "progress_insert_own" on lesson_progress for insert with check (auth.uid()=user_id);
create policy "progress_update_own" on lesson_progress for update using (auth.uid()=user_id) with check (auth.uid()=user_id);

create policy "comments_read_whitelisted" on lesson_comments for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid()));
create policy "comments_write_own_or_admin" on lesson_comments for insert with check (auth.uid()=user_id or public.is_admin_uid(auth.uid()));

create policy "fav_read_own" on user_favorites for select using (auth.uid()=user_id);
create policy "fav_write_own" on user_favorites for insert with check (auth.uid()=user_id);
create policy "fav_delete_own" on user_favorites for delete using (auth.uid()=user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles (id,email,full_name,role)
  values (new.id,new.email,null,'user')
  on conflict (id) do update set email=excluded.email;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into app_settings (id,theme,layout) values (1,'Galaxy Soft (Padrão)','Modelo 01')
on conflict (id) do update set theme=excluded.theme, layout=excluded.layout;

insert into home_content (id,title,subtitle) values (1,'Bem-vindo(a)!','Escolha uma aba: Cursos, Livros ou Arquivos.')
on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle;


-- ===== V11 additions (v3) =====

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists telegram text;
alter table public.profiles add column if not exists avatar_url text;

create table if not exists public.tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.item_tags (
  item_id uuid not null references public.items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

create table if not exists public.user_last_access (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  last_opened_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists public.support_threads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default 'Suporte',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.support_threads(id) on delete cascade,
  sender text not null check (sender in ('user','admin')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.import_jobs (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid not null references auth.users(id) on delete cascade,
  type text not null default 'telegram_json',
  status text not null default 'done',
  summary text,
  created_at timestamptz not null default now()
);

alter table public.app_settings add column if not exists theme_tokens jsonb not null default '{"accent":"#60a5fa","bg":"#050c1c","card":"rgba(16,28,52,.26)","text":"rgba(243,246,255,.92)","muted":"rgba(205,219,245,.62)","radius":"18"}'::jsonb;

create or replace function public.enforce_whitelist_limit()
returns trigger language plpgsql security definer set search_path=public as $$
declare active_count int;
begin
  if (tg_op = 'INSERT') then
    if new.active then
      select count(*) into active_count from public.whitelist where active=true;
      if active_count >= 5 then
        raise exception 'Limite de 5 usuários ativos na whitelist atingido.';
      end if;
    end if;
    return new;
  elsif (tg_op = 'UPDATE') then
    if (old.active is distinct from new.active) and new.active then
      select count(*) into active_count from public.whitelist where active=true and id <> new.id;
      if active_count >= 5 then
        raise exception 'Limite de 5 usuários ativos na whitelist atingido.';
      end if;
    end if;
    return new;
  end if;
  return new;
end; $$;

drop trigger if exists whitelist_limit_trigger on public.whitelist;
create trigger whitelist_limit_trigger before insert or update on public.whitelist
for each row execute procedure public.enforce_whitelist_limit();

alter table public.tags enable row level security;
alter table public.item_tags enable row level security;
alter table public.user_last_access enable row level security;
alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;
alter table public.import_jobs enable row level security;




-- ===== V11 additions (v4 final) =====

create table if not exists public.user_course_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.items(id) on delete cascade,
  last_lesson_id uuid references public.course_lessons(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.user_course_state enable row level security;

-- Policies (drop/create to avoid conflicts)

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='tags' and policyname='tags_read_whitelisted') then
    execute 'drop policy "tags_read_whitelisted" on public.tags';
  end if;
  execute $$ create policy "tags_read_whitelisted" on public.tags for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid())) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='tags' and policyname='tags_write_admin') then
    execute 'drop policy "tags_write_admin" on public.tags';
  end if;
  execute $$ create policy "tags_write_admin" on public.tags for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid())) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='item_tags' and policyname='item_tags_read_whitelisted') then
    execute 'drop policy "item_tags_read_whitelisted" on public.item_tags';
  end if;
  execute $$ create policy "item_tags_read_whitelisted" on public.item_tags for select using (public.is_whitelisted_uid(auth.uid()) or public.is_admin_uid(auth.uid())) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='item_tags' and policyname='item_tags_write_admin') then
    execute 'drop policy "item_tags_write_admin" on public.item_tags';
  end if;
  execute $$ create policy "item_tags_write_admin" on public.item_tags for all using (public.is_admin_uid(auth.uid())) with check (public.is_admin_uid(auth.uid())) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='user_last_access' and policyname='last_access_read_own') then
    execute 'drop policy "last_access_read_own" on public.user_last_access';
  end if;
  execute $$ create policy "last_access_read_own" on public.user_last_access for select using (auth.uid()=user_id) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='user_last_access' and policyname='last_access_upsert_own') then
    execute 'drop policy "last_access_upsert_own" on public.user_last_access';
  end if;
  execute $$ create policy "last_access_upsert_own" on public.user_last_access for insert with check (auth.uid()=user_id) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='user_last_access' and policyname='last_access_update_own') then
    execute 'drop policy "last_access_update_own" on public.user_last_access';
  end if;
  execute $$ create policy "last_access_update_own" on public.user_last_access for update using (auth.uid()=user_id) with check (auth.uid()=user_id) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='support_threads' and policyname='support_threads_read_own_or_admin') then
    execute 'drop policy "support_threads_read_own_or_admin" on public.support_threads';
  end if;
  execute $$ create policy "support_threads_read_own_or_admin" on public.support_threads for select using (auth.uid()=user_id or public.is_admin_uid(auth.uid())) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='support_threads' and policyname='support_threads_write_own') then
    execute 'drop policy "support_threads_write_own" on public.support_threads';
  end if;
  execute $$ create policy "support_threads_write_own" on public.support_threads for insert with check (auth.uid()=user_id) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='support_messages' and policyname='support_messages_read_own_or_admin') then
    execute 'drop policy "support_messages_read_own_or_admin" on public.support_messages';
  end if;
  execute $$ create policy "support_messages_read_own_or_admin" on public.support_messages for select using (exists(select 1 from public.support_threads t where t.id=thread_id and (t.user_id=auth.uid() or public.is_admin_uid(auth.uid())))) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='support_messages' and policyname='support_messages_insert_user') then
    execute 'drop policy "support_messages_insert_user" on public.support_messages';
  end if;
  execute $$ create policy "support_messages_insert_user" on public.support_messages for insert with check ((sender='user' and exists(select 1 from public.support_threads t where t.id=thread_id and t.user_id=auth.uid())) or (sender='admin' and public.is_admin_uid(auth.uid()))) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='import_jobs' and policyname='import_jobs_read_admin') then
    execute 'drop policy "import_jobs_read_admin" on public.import_jobs';
  end if;
  execute $$ create policy "import_jobs_read_admin" on public.import_jobs for select using (public.is_admin_uid(auth.uid())) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='import_jobs' and policyname='import_jobs_write_admin') then
    execute 'drop policy "import_jobs_write_admin" on public.import_jobs';
  end if;
  execute $$ create policy "import_jobs_write_admin" on public.import_jobs for insert with check (public.is_admin_uid(auth.uid())) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='user_course_state' and policyname='course_state_read_own') then
    execute 'drop policy "course_state_read_own" on public.user_course_state';
  end if;
  execute $$ create policy "course_state_read_own" on public.user_course_state for select using (auth.uid()=user_id) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='user_course_state' and policyname='course_state_upsert_own') then
    execute 'drop policy "course_state_upsert_own" on public.user_course_state';
  end if;
  execute $$ create policy "course_state_upsert_own" on public.user_course_state for insert with check (auth.uid()=user_id) $$;
end $$;

do $$
begin
  if exists(select 1 from pg_policies where schemaname='public' and tablename='user_course_state' and policyname='course_state_update_own') then
    execute 'drop policy "course_state_update_own" on public.user_course_state';
  end if;
  execute $$ create policy "course_state_update_own" on public.user_course_state for update using (auth.uid()=user_id) with check (auth.uid()=user_id) $$;
end $$;

