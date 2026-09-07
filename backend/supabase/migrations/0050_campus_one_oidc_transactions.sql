create table if not exists public.campus_one_oidc_transactions (
  state text primary key,
  code_verifier text not null,
  nonce text not null,
  return_to text not null default '/',
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.campus_one_oidc_transactions enable row level security;

create policy "service role manages CampusOne OIDC transactions"
  on public.campus_one_oidc_transactions
  for all
  to service_role
  using (true)
  with check (true);
