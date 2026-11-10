-- Tarefas das reuniões: cada responsável vê e marca como feitas as tarefas atribuídas ao seu email.
-- O administrador vê e gere todas. As notas das reuniões continuam só do administrador.
create table if not exists public.tarefas (id text primary key, data jsonb not null default '{}', atualizado_em timestamptz default now());
alter table public.tarefas enable row level security;
drop policy if exists admin_tudo on public.tarefas;
create policy admin_tudo on public.tarefas for all to authenticated using (public.e_admin()) with check (public.e_admin());
drop policy if exists responsavel_ler on public.tarefas;
create policy responsavel_ler on public.tarefas for select to authenticated using ((data -> 'emails') ? lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists responsavel_marcar on public.tarefas;
create policy responsavel_marcar on public.tarefas for update to authenticated
  using ((data -> 'emails') ? lower(coalesce(auth.jwt() ->> 'email', '')))
  with check ((data -> 'emails') ? lower(coalesce(auth.jwt() ->> 'email', '')));
-- (a app grava com upsert, que precisa também de permissão de inserir)
drop policy if exists responsavel_inserir on public.tarefas;
create policy responsavel_inserir on public.tarefas for insert to authenticated with check ((data -> 'emails') ? lower(coalesce(auth.jwt() ->> 'email', '')));
grant select, insert, update, delete on public.tarefas to authenticated;
drop trigger if exists historico on public.tarefas;
create trigger historico before insert or update or delete on public.tarefas for each row execute function public.registar_historico();
do $$ begin
  alter publication supabase_realtime add table public.tarefas;
exception when duplicate_object then null;
end $$;
select 'tarefas pronta' as resultado;
