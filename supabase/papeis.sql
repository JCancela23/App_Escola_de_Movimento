-- Papéis: administrador (só o João: acessos, reuniões, relatórios, histórico), coordenador, preparador
alter table public.acessos drop constraint if exists acessos_papel_check;
alter table public.acessos add constraint acessos_papel_check check (papel in ('administrador', 'coordenador', 'preparador'));
create or replace function public.e_admin() returns boolean language sql stable set search_path = public as $$ select public.papel() = 'administrador' $$;
create or replace function public.e_coord() returns boolean language sql stable set search_path = public as $$ select public.papel() in ('administrador', 'coordenador') $$;
create or replace function public.e_equipa() returns boolean language sql stable set search_path = public as $$ select public.papel() in ('administrador', 'coordenador', 'preparador') $$;

drop policy if exists acessos_ler on public.acessos;
create policy acessos_ler on public.acessos for select to authenticated using (id = lower(auth.jwt() ->> 'email') or public.e_admin());
drop policy if exists acessos_gerir on public.acessos;
create policy acessos_gerir on public.acessos for all to authenticated using (public.e_admin()) with check (public.e_admin());

drop policy if exists coord_tudo on public.reunioes;
drop policy if exists admin_tudo on public.reunioes;
create policy admin_tudo on public.reunioes for all to authenticated using (public.e_admin()) with check (public.e_admin());

drop policy if exists historico_ler on public.historico;
create policy historico_ler on public.historico for select to authenticated using (public.e_admin());

update public.acessos set papel = 'administrador' where id = 'jcancela87@gmail.com';
