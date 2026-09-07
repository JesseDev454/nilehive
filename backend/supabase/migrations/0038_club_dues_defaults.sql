alter table public.clubs
  add column if not exists dues_amount numeric(12, 2) not null default 5000
  check (dues_amount >= 0);

update public.clubs
set dues_amount = 5000
where dues_amount is null;
