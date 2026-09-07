do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'notification_type'
  ) then
    create type public.notification_type as enum (
      'proposal_submitted',
      'advisor_approved',
      'advisor_rejected',
      'pending_admin_review'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'notification_delivery_status'
  ) then
    create type public.notification_delivery_status as enum ('stored');
  end if;
end
$$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  type public.notification_type not null,
  message text not null,
  delivery_status public.notification_delivery_status not null default 'stored',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_proposal_id_idx on public.notifications (proposal_id);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
on public.notifications
for select
using (user_id = auth.uid());
