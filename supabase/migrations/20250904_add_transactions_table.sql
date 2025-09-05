-- ISA Pay transactions table
create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    amount numeric(18,2) not null,
    currency text not null default 'KES',
    provider text not null check (provider in ('DPO','M-Pesa','Airtel','PayPal')),
    status text not null check (status in ('pending','success','failed')) default 'pending',
    reference_id text,
    redirect_url text,
    metadata jsonb,
    created_at timestamp with time zone not null default now()
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_provider on public.transactions(provider);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_reference_id on public.transactions(reference_id);

alter table public.transactions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'transactions' and policyname = 'allow_service_role_all'
  ) then
    create policy allow_service_role_all on public.transactions
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;


