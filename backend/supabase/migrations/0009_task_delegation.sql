do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'task_priority'
  ) then
    create type public.task_priority as enum ('low', 'medium', 'high');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'task_status'
  ) then
    create type public.task_status as enum ('pending', 'in_progress', 'completed', 'blocked');
  end if;
end
$$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  assigned_by uuid not null references public.profiles (id) on delete restrict,
  assigned_to uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  description text,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'pending',
  due_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  changed_by uuid not null references public.profiles (id) on delete restrict,
  old_status public.task_status,
  new_status public.task_status not null,
  remarks text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_club_id_idx on public.tasks (club_id);
create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_due_date_idx on public.tasks (due_date);
create index if not exists task_status_history_task_id_idx on public.task_status_history (task_id);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

alter table public.tasks enable row level security;
alter table public.task_status_history enable row level security;

drop policy if exists tasks_select_visible on public.tasks;
create policy tasks_select_visible
on public.tasks
for select
using (
  assigned_to = auth.uid()
  or assigned_by = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'president'
      and p.club_id = tasks.club_id
  )
);

drop policy if exists task_status_history_select_visible on public.task_status_history;
create policy task_status_history_select_visible
on public.task_status_history
for select
using (
  exists (
    select 1
    from public.tasks t
    where t.id = task_status_history.task_id
      and (
        t.assigned_to = auth.uid()
        or t.assigned_by = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'president'
            and p.club_id = t.club_id
        )
      )
  )
);
