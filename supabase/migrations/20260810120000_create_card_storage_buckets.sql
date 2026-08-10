-- Private buckets for user-uploaded card photos and voice recordings.
-- Not public: objects are only reachable via a signed URL, and RLS below
-- restricts even authenticated access to each user's own folder.
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('card-images', 'card-images', false, 10485760),  -- 10 MB
  ('card-audio', 'card-audio', false, 10485760)
on conflict (id) do nothing;

-- Objects are stored as "<bucket>/<user_id>/<position>.<ext>" — the first
-- path segment is the owning user's id, mirroring the tiles table's RLS.
create policy "Users can read their own card images"
  on storage.objects for select
  using (bucket_id = 'card-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own card images"
  on storage.objects for insert
  with check (bucket_id = 'card-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own card images"
  on storage.objects for update
  using (bucket_id = 'card-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'card-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own card images"
  on storage.objects for delete
  using (bucket_id = 'card-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read their own card audio"
  on storage.objects for select
  using (bucket_id = 'card-audio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload their own card audio"
  on storage.objects for insert
  with check (bucket_id = 'card-audio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own card audio"
  on storage.objects for update
  using (bucket_id = 'card-audio' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'card-audio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own card audio"
  on storage.objects for delete
  using (bucket_id = 'card-audio' and (storage.foldername(name))[1] = auth.uid()::text);
