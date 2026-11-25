-- Imagens dos planos (Escola de Movimento): espaço "planos" no Supabase Storage
-- Qualquer pessoa com o link vê a imagem; só administrador e coordenação carregam ou apagam.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('planos', 'planos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "planos_carregar" on storage.objects;
create policy "planos_carregar" on storage.objects for insert to authenticated
  with check (bucket_id = 'planos' and public.e_coord());

drop policy if exists "planos_apagar" on storage.objects;
create policy "planos_apagar" on storage.objects for delete to authenticated
  using (bucket_id = 'planos' and public.e_coord());
