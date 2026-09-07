do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'due_payment_status'
  ) then
    create type public.due_payment_status as enum ('unpaid', 'submitted', 'paid', 'rejected');
  end if;
end
$$;

create table if not exists public.due_payments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  member_id uuid not null references public.club_members (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  academic_session text not null,
  payment_reference text,
  proof_url text,
  status public.due_payment_status not null default 'unpaid',
  verified_by uuid references public.profiles (id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists due_payments_club_id_idx on public.due_payments (club_id);
create index if not exists due_payments_member_id_idx on public.due_payments (member_id);
create index if not exists due_payments_status_idx on public.due_payments (status);
create index if not exists due_payments_academic_session_idx on public.due_payments (academic_session);

drop trigger if exists due_payments_set_updated_at on public.due_payments;
create trigger due_payments_set_updated_at
before update on public.due_payments
for each row
execute function public.set_updated_at();

alter table public.due_payments enable row level security;

drop policy if exists due_payments_select_visible on public.due_payments;
create policy due_payments_select_visible
on public.due_payments
for select
using (
  exists (
    select 1
    from public.club_members cm
    where cm.id = due_payments.member_id
      and cm.profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = due_payments.club_id
          and p.role in ('president', 'executive')
        )
      )
  )
);
