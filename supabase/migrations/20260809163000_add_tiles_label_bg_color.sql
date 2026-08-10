-- label and bg_color are user-editable in the Settings screen (card text label
-- and high-contrast color swatch) but were missing from the original tiles
-- schema. Add them so device-to-device sync doesn't drop those edits.
alter table public.tiles
  add column if not exists label text,
  add column if not exists bg_color text;
