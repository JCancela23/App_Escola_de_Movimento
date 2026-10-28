-- Escola do Movimento: tabelas, permissões (RLS) e tempo real.
-- Cada tabela guarda um registo por linha: id + data (JSON), como na app.

create table if not exists public.acessos (
  id text primary key,               -- email em minúsculas
  papel text not null check (papel in ('coordenador', 'preparador')),
  nome text default '',
  criado_em timestamptz default now()
);

do $$
declare t text;
begin
  foreach t in array array['equipas','alteracoes','exercicios','plano','sessoes','notas','atletas','avaliacoes','pessoas','reunioes','planos','material','planeadas','semanas'] loop
    execute format('create table if not exists public.%I (id text primary key, data jsonb not null default ''{}'', atualizado_em timestamptz default now())', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;
alter table public.acessos enable row level security;

-- Papel de quem está autenticado (null = sem acesso de equipa técnica)
create or replace function public.papel() returns text
language sql stable security definer set search_path = public as $$
  select papel from public.acessos where id = lower(coalesce(auth.jwt() ->> 'email', ''))
$$;
create or replace function public.e_equipa() returns boolean language sql stable set search_path = public as $$ select public.papel() in ('coordenador', 'preparador') $$;
create or replace function public.e_coord() returns boolean language sql stable set search_path = public as $$ select public.papel() = 'coordenador' $$;

-- Leitura pública (pais, treinadores, direção, sem conta). As avaliações só têm ids de atletas; os nomes estão em 'atletas', que é privada.
do $$
declare t text;
begin
  foreach t in array array['equipas','alteracoes','exercicios','plano','sessoes','avaliacoes'] loop
    execute format('drop policy if exists ler_publico on public.%I', t);
    execute format('create policy ler_publico on public.%I for select to anon, authenticated using (true)', t);
  end loop;
  -- Escrita pela equipa técnica (coordenação e preparação física)
  foreach t in array array['equipas','alteracoes','sessoes','avaliacoes'] loop
    execute format('drop policy if exists escrever_equipa on public.%I', t);
    execute format('create policy escrever_equipa on public.%I for all to authenticated using (public.e_equipa()) with check (public.e_equipa())', t);
  end loop;
  -- Escrita só pela coordenação
  foreach t in array array['exercicios','plano'] loop
    execute format('drop policy if exists escrever_coord on public.%I', t);
    execute format('create policy escrever_coord on public.%I for all to authenticated using (public.e_coord()) with check (public.e_coord())', t);
  end loop;
  -- Dados internos: só a equipa técnica lê e escreve
  foreach t in array array['notas','atletas'] loop
    execute format('drop policy if exists equipa_tudo on public.%I', t);
    execute format('create policy equipa_tudo on public.%I for all to authenticated using (public.e_equipa()) with check (public.e_equipa())', t);
  end loop;
end $$;

-- Reuniões: só a coordenação (por agora)
drop policy if exists coord_tudo on public.reunioes;
create policy coord_tudo on public.reunioes for all to authenticated using (public.e_coord()) with check (public.e_coord());

-- Planos de sessão: a equipa técnica vê, a coordenação prepara
do $$
declare t text;
begin
  foreach t in array array['planos','planeadas','semanas'] loop
    execute format('drop policy if exists equipa_ler on public.%I', t);
    execute format('create policy equipa_ler on public.%I for select to authenticated using (public.e_equipa())', t);
    execute format('drop policy if exists coord_escrever on public.%I', t);
    execute format('create policy coord_escrever on public.%I for all to authenticated using (public.e_coord()) with check (public.e_coord())', t);
  end loop;
end $$;
-- Material: a equipa técnica lê e escreve
drop policy if exists equipa_tudo on public.material;
create policy equipa_tudo on public.material for all to authenticated using (public.e_equipa()) with check (public.e_equipa());

-- Pessoas e contactos: só a equipa técnica lê e escreve
drop policy if exists pessoas_ler on public.pessoas;
create policy pessoas_ler on public.pessoas for select to authenticated using (public.e_equipa());
drop policy if exists pessoas_escrever on public.pessoas;
create policy pessoas_escrever on public.pessoas for all to authenticated using (public.e_equipa()) with check (public.e_equipa());

-- Acessos: cada um vê o seu; a coordenação gere todos
drop policy if exists acessos_ler on public.acessos;
create policy acessos_ler on public.acessos for select to authenticated using (id = lower(auth.jwt() ->> 'email') or public.e_coord());
drop policy if exists acessos_gerir on public.acessos;
create policy acessos_gerir on public.acessos for all to authenticated using (public.e_coord()) with check (public.e_coord());

-- Acesso pela API (o RLS acima decide o que cada um pode fazer)
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

-- Tempo real
do $$
declare t text;
begin
  foreach t in array array['equipas','alteracoes','exercicios','plano','sessoes','notas','atletas','avaliacoes','pessoas','reunioes','planos','material','planeadas','semanas'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- Primeiro coordenador (troque pelo email certo, se for outro)
-- insert into public.acessos (id, papel, nome) values ('email@exemplo.pt', 'coordenador', 'Nome') on conflict (id) do nothing;
-- Histórico: quem registou, alterou ou apagou o quê (só a coordenação vê)
create table if not exists public.historico (
  id bigint generated always as identity primary key,
  em timestamptz not null default now(),
  por text,
  tabela text not null,
  registo text not null,
  acao text not null,
  antes jsonb,
  depois jsonb
);
alter table public.historico enable row level security;
drop policy if exists historico_ler on public.historico;
create policy historico_ler on public.historico for select to authenticated using (public.e_coord());
revoke all on public.historico from anon, authenticated;
grant select on public.historico to authenticated;

-- Marca cada registo com quem o gravou (_por, _em) e guarda a mudança no histórico
create or replace function public.registar_historico() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  quem text := nullif(lower(coalesce(auth.jwt() ->> 'email', '')), '');
  velho jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  novo jsonb;
begin
  if tg_op <> 'DELETE' and tg_table_name <> 'acessos' then
    new.data := coalesce(new.data, '{}'::jsonb) || jsonb_build_object('_por', quem, '_em', now());
  end if;
  novo := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  -- sem mudança real (só a marca) não fica no histórico; reuniões guardam sozinhas e não entram
  if tg_table_name = 'reunioes' or (tg_op = 'UPDATE' and (velho->'data') - '_por' - '_em' is not distinct from (novo->'data') - '_por' - '_em' and velho - 'data' - 'atualizado_em' is not distinct from novo - 'data' - 'atualizado_em') then
    return coalesce(new, old);
  end if;
  insert into public.historico (por, tabela, registo, acao, antes, depois)
  values (quem, tg_table_name, coalesce(novo ->> 'id', velho ->> 'id'), lower(tg_op), velho, novo);
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['equipas','alteracoes','exercicios','plano','sessoes','notas','atletas','avaliacoes','pessoas','reunioes','planos','material','planeadas','semanas','acessos'] loop
    execute format('drop trigger if exists historico on public.%I', t);
    execute format('create trigger historico before insert or update or delete on public.%I for each row execute function public.registar_historico()', t);
  end loop;
  begin
    alter publication supabase_realtime add table public.historico;
  exception when duplicate_object then null;
  end;
end $$;
