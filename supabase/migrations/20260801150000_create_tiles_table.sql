-- Tiles: each row is one of a user's communication cards
-- (image + a recorded voice message or typed TTS text).
create table if not exists public.tiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text,
  audio_url text,
  tts_text text,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tiles_user_position_unique unique (user_id, position)
);

create index if not exists tiles_user_id_idx on public.tiles (user_id);

-- Keep updated_at current on every row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tiles_set_updated_at on public.tiles;
create trigger tiles_set_updated_at
  before update on public.tiles
  for each row
  execute function public.set_updated_at();

alter table public.tiles enable row level security;

create policy "Users can view their own tiles"
  on public.tiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tiles"
  on public.tiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tiles"
  on public.tiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tiles"
  on public.tiles for delete
  using (auth.uid() = user_id);
