insert into storage.buckets (id, name, public)
values
  ('club-logos', 'club-logos', true),
  ('event-media', 'event-media', true),
  ('dues-receipts', 'dues-receipts', false),
  ('reports', 'reports', false)
on conflict (id) do nothing;

-- Path conventions:
-- club-logos  : {club_id}/{file}
-- event-media : {club_id}/{file}
-- dues-receipts: {club_id}/{profile_id}/{file}
-- reports     : {club_id}/{proposal_id}/{file}

drop policy if exists storage_objects_select_public_assets on storage.objects;
drop policy if exists storage_objects_select_private_assets on storage.objects;
drop policy if exists storage_objects_insert_leadership_assets on storage.objects;
drop policy if exists storage_objects_insert_due_receipts on storage.objects;
drop policy if exists storage_objects_update_assets on storage.objects;
drop policy if exists storage_objects_delete_assets on storage.objects;

drop policy if exists storage_objects_select_public_by_bucket on storage.objects;
create policy storage_objects_select_public_by_bucket
on storage.objects
for select
using (bucket_id in ('club-logos', 'event-media'));

drop policy if exists storage_objects_select_private_due_receipts on storage.objects;
create policy storage_objects_select_private_due_receipts
on storage.objects
for select
using (
  bucket_id = 'dues-receipts'
  and (
    owner = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or (
            p.role in ('president', 'executive')
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
  )
);

drop policy if exists storage_objects_select_private_reports on storage.objects;
create policy storage_objects_select_private_reports
on storage.objects
for select
using (
  bucket_id = 'reports'
  and (
    owner = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or (
            p.role in ('president', 'executive')
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
          p.role in ('president', 'executive')
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

drop policy if exists storage_objects_insert_due_receipts_student on storage.objects;
create policy storage_objects_insert_due_receipts_student
on storage.objects
for insert
with check (
  bucket_id = 'dues-receipts'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] is not null
  and (storage.foldername(name))[2] = auth.uid()::text
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
      and (
        (p.club_id is not null and p.club_id::text = (storage.foldername(name))[1])
        or exists (
          select 1
          from public.membership_requests mr
          where mr.profile_id = auth.uid()
            and mr.club_id::text = (storage.foldername(name))[1]
            and mr.status in ('approved_pending_dues', 'active')
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
          p.role in ('president', 'executive')
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
          p.role in ('president', 'executive')
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

drop policy if exists storage_objects_update_scoped_assets on storage.objects;
create policy storage_objects_update_scoped_assets
on storage.objects
for update
using (
  owner = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role in ('president', 'executive')
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
)
with check (
  owner = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role in ('president', 'executive')
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

drop policy if exists storage_objects_delete_scoped_assets on storage.objects;
create policy storage_objects_delete_scoped_assets
on storage.objects
for delete
using (
  owner = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role in ('president', 'executive')
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
