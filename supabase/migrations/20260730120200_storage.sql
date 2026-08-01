-- ============================================================================
-- Stockage des photos jointes aux propositions
--
-- Le bucket est public en lecture : la photo doit s'afficher pour le
-- destinataire (non authentifié) et dans les emails, où aucune session ne peut
-- être présentée. Les fichiers sont rangés sous `{user_id}/{uuid}.{ext}`, donc
-- non énumérables. Pour un besoin de confidentialité plus strict, passer le
-- bucket en privé et servir des URLs signées.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proposal-photos',
  'proposal-photos',
  true,
  5242880, -- 5 Mo
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lecture publique
create policy "proposal_photos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'proposal-photos');

-- Chaque utilisateur connecté n'écrit que dans son propre dossier
create policy "proposal_photos_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'proposal-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "proposal_photos_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'proposal-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "proposal_photos_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'proposal-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
