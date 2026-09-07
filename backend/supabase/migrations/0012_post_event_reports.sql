do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'event_report_status'
  ) then
    create type public.event_report_status as enum ('submitted');
  end if;
end
$$;

create table if not exists public.event_reports (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null unique references public.proposals (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  submitted_by uuid not null references public.profiles (id) on delete restrict,
  attendance_count integer not null check (attendance_count >= 0),
  summary text not null,
  challenges text,
  outcomes text,
  budget_used numeric(12, 2) check (budget_used >= 0),
  media_urls jsonb not null default '[]'::jsonb,
  report_file_url text,
  status public.event_report_status not null default 'submitted',
  submitted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists event_reports_club_id_idx on public.event_reports (club_id);
create index if not exists event_reports_submitted_by_idx on public.event_reports (submitted_by);
create index if not exists event_reports_status_idx on public.event_reports (status);
create index if not exists event_reports_submitted_at_idx on public.event_reports (submitted_at);

drop trigger if exists event_reports_set_updated_at on public.event_reports;
create trigger event_reports_set_updated_at
before update on public.event_reports
for each row
execute function public.set_updated_at();

alter table public.event_reports enable row level security;

drop policy if exists event_reports_select_visible on public.event_reports;
create policy event_reports_select_visible
on public.event_reports
for select
using (
  submitted_by = auth.uid()
  or exists (
    select 1
    from public.clubs c
    where c.id = event_reports.club_id
      and c.advisor_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = event_reports.club_id
          and p.role in ('president', 'executive')
        )
      )
  )
);

drop policy if exists event_reports_insert_executive_own_club on public.event_reports;
create policy event_reports_insert_executive_own_club
on public.event_reports
for insert
with check (
  submitted_by = auth.uid()
  and exists (
    select 1
    from public.profiles p
    join public.proposals pr on pr.id = event_reports.proposal_id
    where p.id = auth.uid()
      and p.role = 'executive'
      and p.club_id = event_reports.club_id
      and pr.club_id = event_reports.club_id
      and pr.status = 'approved'
  )
);
