-- Migration 0042: Restore student INSERT access to the dues-receipts bucket.
--
-- Problem:
--   Migration 0027 (production_rls_cleanup) replaced the student-specific
--   INSERT policy (storage_objects_insert_due_receipts_student) with a
--   leadership-only policy (storage_objects_insert_due_receipts_leadership).
--   This left students completely unable to upload payment receipts,
--   producing "new row violates row level security" errors.
--
-- Fix:
--   Re-create the student INSERT policy. Students may upload to
--   dues-receipts/{club_id}/{their_own_uid}/... at any time while
--   they are authenticated, without needing a pre-existing membership
--   request (because the upload must happen *before* the join request
--   is created). The folder must still encode the uploader's own uid
--   as the second segment, which prevents students from writing into
--   other users' folders.

drop policy if exists storage_objects_insert_due_receipts_student on storage.objects;
create policy storage_objects_insert_due_receipts_student
on storage.objects
for insert
with check (
  bucket_id = 'dues-receipts'
  and auth.role() = 'authenticated'
  -- The first path segment is the club_id; must be present.
  and (storage.foldername(name))[1] is not null
  -- The second path segment must be the uploader's own user id.
  -- This is the primary security boundary: a student can only write
  -- into their own sub-folder inside whichever club folder they choose.
  and (storage.foldername(name))[2] = auth.uid()::text
  -- Restrict to authenticated users whose profile has the student role.
  -- Presidents / executives use the separate leadership policy.
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
  )
);
