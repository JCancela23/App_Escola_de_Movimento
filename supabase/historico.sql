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
