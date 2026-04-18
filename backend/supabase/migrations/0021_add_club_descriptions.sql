-- Migration to add a description field to the clubs table
-- so we can store the rich descriptions for each of the 14 official Nile University clubs.

alter table public.clubs add column if not exists description text;
