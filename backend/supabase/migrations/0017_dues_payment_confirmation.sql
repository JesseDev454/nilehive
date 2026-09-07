create table if not exists public.club_payment_settings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null unique references public.clubs (id) on delete cascade,
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  payment_instructions text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.due_payments
  add column if not exists payment_account_name text,
  add column if not exists payment_paid_at date,
  add column if not exists payer_note text,
  add column if not exists submitted_at timestamptz;

create index if not exists club_payment_settings_club_id_idx on public.club_payment_settings (club_id);
create index if not exists due_payments_submitted_at_idx on public.due_payments (submitted_at);

drop trigger if exists club_payment_settings_set_updated_at on public.club_payment_settings;
create trigger club_payment_settings_set_updated_at
before update on public.club_payment_settings
for each row
execute function public.set_updated_at();

alter table public.club_payment_settings enable row level security;

drop policy if exists club_payment_settings_select_authenticated on public.club_payment_settings;
create policy club_payment_settings_select_authenticated
on public.club_payment_settings
for select
using (auth.uid() is not null);

drop policy if exists club_payment_settings_insert_admin_or_president on public.club_payment_settings;
create policy club_payment_settings_insert_admin_or_president
on public.club_payment_settings
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role = 'president'
          and p.club_id = club_payment_settings.club_id
        )
      )
  )
);

drop policy if exists club_payment_settings_update_admin_or_president on public.club_payment_settings;
create policy club_payment_settings_update_admin_or_president
on public.club_payment_settings
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role = 'president'
          and p.club_id = club_payment_settings.club_id
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role = 'president'
          and p.club_id = club_payment_settings.club_id
        )
      )
  )
);
