-- Run once in Supabase SQL Editor. Then add your own Auth user ID to site_admins.
-- Visitors can read posts; only listed Auth users can insert, edit, or delete their own.

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_posts (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('quran', 'hadith', 'scholar', 'reflection')),
  text text not null check (length(trim(text)) between 1 and 5000),
  source text not null check (length(trim(source)) between 1 and 300),
  author text,
  category text not null check (category in ('patience', 'contemplation', 'love', 'softeners', 'scholars', 'duaa')),
  tags text[] not null default '{}',
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists site_posts_created_at_idx on public.site_posts (created_at desc);
create index if not exists site_posts_owner_id_idx on public.site_posts (owner_id);

alter table public.site_admins enable row level security;
alter table public.site_posts enable row level security;

-- Supabase projects may grant CRUD to both roles by default. Remove it first.
revoke all on table public.site_admins from anon, authenticated;
revoke all on table public.site_posts from anon, authenticated;
grant select on table public.site_admins to authenticated;
grant select on table public.site_posts to anon, authenticated;
grant insert, update, delete on table public.site_posts to authenticated;

drop policy if exists "admins can view own membership" on public.site_admins;
create policy "admins can view own membership"
  on public.site_admins for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "everyone can read published posts" on public.site_posts;
create policy "everyone can read published posts"
  on public.site_posts for select to anon, authenticated
  using (true);

drop policy if exists "admins can publish own posts" on public.site_posts;
create policy "admins can publish own posts"
  on public.site_posts for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.site_admins where user_id = (select auth.uid()))
  );

drop policy if exists "admins can edit own posts" on public.site_posts;
create policy "admins can edit own posts"
  on public.site_posts for update to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (select 1 from public.site_admins where user_id = (select auth.uid()))
  )
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.site_admins where user_id = (select auth.uid()))
  );

drop policy if exists "admins can remove own posts" on public.site_posts;
create policy "admins can remove own posts"
  on public.site_posts for delete to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (select 1 from public.site_admins where user_id = (select auth.uid()))
  );

-- Optional live updates for other visitors. The app also refreshes on window focus.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'site_posts'
     ) then
    alter publication supabase_realtime add table public.site_posts;
  end if;
end $$;

-- IMPORTANT: create your own user under Authentication > Users first.
-- Then run the following separately, replacing the example UUID with that user's ID:
-- insert into public.site_admins (user_id)
-- values ('00000000-0000-0000-0000-000000000000')
-- on conflict (user_id) do nothing;