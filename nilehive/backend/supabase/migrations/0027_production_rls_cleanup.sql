-- Production RLS cleanup for the president-owned workflow.
-- This migration supersedes older storage policies that still treated executives
-- as club owners for private dues/report assets.

drop policy if exists storage_objects_select_private_due_receipts on storage.objects;
create policy storage_objects_select_private_due_receipts
on storage.objects
for select
using (
  bucket_id = 'dues-receipts'
  and (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          (
            p.role = 'student'
            and (storage.foldername(name))[2] = auth.uid()::text
          )
          or p.role = 'admin'
          or (
            p.role = 'president'
            and p.club_id::text = (storage.foldername(name))[1]
          )
        )
    )
  )
);

drop policy if exists storage_objects_select_private_reports on storage.objects;
create policy storage_objects_select_private_reports
on storage.objects
for select
using (
  bucket_id = 'reports'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role = 'president'
          and p.club_id::text = (storage.foldername(name))[1]
        )
        or (
          p.role = 'advisor'
          and exists (
            select 1
            from public.clubs c
            where c.id::text = (storage.foldername(name))[1]
              and c.advisor_id = auth.uid()
          )
        )
      )
  )
);

drop policy if exists storage_objects_insert_public_assets_by_club on storage.objects;
create policy storage_objects_insert_public_assets_by_club
on storage.objects
for insert
with check (
  bucket_id in ('club-logos', 'event-media')
  and (storage.foldername(name))[1] is not null
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role = 'president'
          and p.club_id::text = (storage.foldername(name))[1]
        )
      )
  )
);

drop policy if exists storage_objects_insert_due_receipts_leadership on storage.objects;
create policy storage_objects_insert_due_receipts_leadership
on storage.objects
for insert
with check (
  bucket_id = 'dues-receipts'
  and (storage.foldername(name))[1] is not null
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role = 'president'
          and p.club_id::text = (storage.foldername(name))[1]
        )
      )
  )
);

drop policy if exists storage_objects_insert_reports_by_club on storage.objects;
create policy storage_objects_insert_reports_by_club
on storage.objects
for insert
with check (
  bucket_id = 'reports'
  and (storage.foldername(name))[1] is not null
  and (storage.foldername(name))[2] is not null
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role = 'president'
          and p.club_id::text = (storage.foldername(name))[1]
        )
      )
  )
);

drop policy if exists storage_objects_update_scoped_assets on storage.objects;
create policy storage_objects_update_scoped_assets
on storage.objects
for update
using (
  (
    bucket_id = 'dues-receipts'
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and (
            (
              p.role = 'student'
              and (storage.foldername(name))[2] = auth.uid()::text
            )
            or p.role = 'admin'
            or (
              p.role = 'president'
              and p.club_id::text = (storage.foldername(name))[1]
            )
          )
      )
    )
  )
  or (
    bucket_id in ('club-logos', 'event-media', 'reports')
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or (
            p.role = 'president'
            and p.club_id::text = (storage.foldername(name))[1]
          )
        )
    )
  )
)
with check (
  (
    bucket_id = 'dues-receipts'
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and (
            (
              p.role = 'student'
              and (storage.foldername(name))[2] = auth.uid()::text
            )
            or p.role = 'admin'
            or (
              p.role = 'president'
              and p.club_id::text = (storage.foldername(name))[1]
            )
          )
      )
    )
  )
  or (
    bucket_id in ('club-logos', 'event-media', 'reports')
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or (
            p.role = 'president'
            and p.club_id::text = (storage.foldername(name))[1]
          )
        )
    )
  )
);

drop policy if exists storage_objects_delete_scoped_assets on storage.objects;
create policy storage_objects_delete_scoped_assets
on storage.objects
for delete
using (
  (
    bucket_id = 'dues-receipts'
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and (
            (
              p.role = 'student'
              and (storage.foldername(name))[2] = auth.uid()::text
            )
            or p.role = 'admin'
            or (
              p.role = 'president'
              and p.club_id::text = (storage.foldername(name))[1]
            )
          )
      )
    )
  )
  or (
    bucket_id in ('club-logos', 'event-media', 'reports')
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or (
            p.role = 'president'
            and p.club_id::text = (storage.foldername(name))[1]
          )
        )
    )
  )
);
