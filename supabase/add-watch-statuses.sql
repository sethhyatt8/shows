-- Run once in Supabase SQL Editor if show_reviews already exists.

alter table public.show_reviews drop constraint if exists show_reviews_status_check;

alter table public.show_reviews add constraint show_reviews_status_check check (
  status in (
    'watching',
    'current',
    'new-season-soon',
    'completed',
    'dropped',
    'queued',
    'archived'
  )
);
