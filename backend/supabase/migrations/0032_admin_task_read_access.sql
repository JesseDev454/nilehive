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
      and (
        p.role = 'admin'
        or (
          p.role = 'president'
          and p.club_id = tasks.club_id
        )
      )
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
            and (
              p.role = 'admin'
              or (
                p.role = 'president'
                and p.club_id = t.club_id
              )
            )
        )
      )
  )
);
