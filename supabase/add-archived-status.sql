-- Run once in Supabase SQL Editor if you already created show_reviews earlier.

alter table public.show_reviews drop constraint if exists show_reviews_status_check;

alter table public.show_reviews add constraint show_reviews_status_check check (
  status in ('watching', 'completed', 'dropped', 'queued', 'archived')
);
