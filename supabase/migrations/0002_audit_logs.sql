-- Auditoria mínima de ações administrativas
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_id_idx on audit_logs(actor_id);
create index if not exists audit_logs_created_at_idx on audit_logs(created_at);

alter table audit_logs enable row level security;

-- Admin pode ler e inserir logs
do $$ begin
  create policy "audit_logs_admin_read" on audit_logs
    for select using (
      exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "audit_logs_admin_insert" on audit_logs
    for insert with check (
      exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    );
exception when duplicate_object then null; end $$;
