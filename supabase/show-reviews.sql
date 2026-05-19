-- Run once in Supabase SQL Editor (same project as Emily is fine).

create table if not exists public.show_reviews (
  show_id text primary key,
  rating smallint,
  review text not null default '',
  status text not null default 'watching',
  updated_at timestamptz not null default now(),
  constraint show_reviews_rating_range check (
    rating is null or (rating >= 0 and rating <= 100)
  ),
  constraint show_reviews_status_check check (
    status in ('watching', 'completed', 'dropped', 'queued')
  )
);

-- If you already created the table without status, run this line only:
-- alter table public.show_reviews add column if not exists status text not null default 'watching';

alter table public.show_reviews enable row level security;

drop policy if exists "anon read show_reviews" on public.show_reviews;
drop policy if exists "anon insert show_reviews" on public.show_reviews;
drop policy if exists "anon update show_reviews" on public.show_reviews;
drop policy if exists "anon delete show_reviews" on public.show_reviews;

create policy "anon read show_reviews"
on public.show_reviews for select to anon, authenticated using (true);

create policy "anon insert show_reviews"
on public.show_reviews for insert to anon, authenticated with check (true);

create policy "anon update show_reviews"
on public.show_reviews for update to anon, authenticated using (true) with check (true);

create policy "anon delete show_reviews"
on public.show_reviews for delete to anon, authenticated using (true);
