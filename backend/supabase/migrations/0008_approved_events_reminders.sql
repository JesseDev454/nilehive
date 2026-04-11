create table if not exists public.event_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  message text not null,
  remind_at timestamptz not null,
  delivery_status public.notification_delivery_status not null default 'stored',
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, proposal_id)
);

create index if not exists event_reminders_user_id_idx on public.event_reminders (user_id);
create index if not exists event_reminders_proposal_id_idx on public.event_reminders (proposal_id);
create index if not exists event_reminders_remind_at_idx on public.event_reminders (remind_at);

alter table public.event_reminders enable row level security;

drop policy if exists event_reminders_select_own on public.event_reminders;
create policy event_reminders_select_own
on public.event_reminders
for select
using (user_id = auth.uid());
