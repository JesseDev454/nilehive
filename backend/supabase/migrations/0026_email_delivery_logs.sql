create table if not exists public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'microsoft_graph',
  recipient_user_id uuid references public.profiles (id) on delete set null,
  recipient_email text,
  subject text not null,
  status text not null default 'skipped',
  announcement_id uuid references public.announcements (id) on delete cascade,
  notification_id uuid references public.notifications (id) on delete set null,
  proposal_id uuid references public.proposals (id) on delete cascade,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint email_deliveries_status_check check (status in ('skipped', 'sent', 'failed'))
);

create index if not exists email_deliveries_recipient_user_id_idx
  on public.email_deliveries (recipient_user_id);

create index if not exists email_deliveries_announcement_id_idx
  on public.email_deliveries (announcement_id);

create index if not exists email_deliveries_status_idx
  on public.email_deliveries (status);

drop trigger if exists email_deliveries_set_updated_at on public.email_deliveries;
create trigger email_deliveries_set_updated_at
before update on public.email_deliveries
for each row
execute function public.set_updated_at();

alter table public.email_deliveries enable row level security;

drop policy if exists email_deliveries_admin_select on public.email_deliveries;
create policy email_deliveries_admin_select
on public.email_deliveries
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
