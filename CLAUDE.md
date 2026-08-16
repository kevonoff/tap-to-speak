@AGENTS.md

# Tap to Speak

AAC (augmentative/alternative communication) app for developing children and disabled people to communicate. User taps an image tile; it speaks a message out loud.

**Status: mid-rewrite.** Originally an MVP built in Google AI Studio — a browser-only Vite web app using IndexedDB/localStorage and Web Speech APIs. That version is being rebuilt as a cross-platform mobile app for the Play Store and App Store. Treat the old app as the functional spec, not code to port line-by-line — the storage layer and audio need native-appropriate implementations, not direct translations.

## Target stack
- **Expo (React Native)** — not bare RN. Use Expo modules for camera/image picker, audio recording, and TTS so we get EAS Build for store submission without fighting native config.
- **Supabase** — Postgres DB, auth, and storage buckets (for card images and voice recordings). One service for accounts + data + files.
- **expo-av** — voice recording and playback.
- **expo-speech** (or a paid TTS provider if voice quality becomes an issue) — auto-generated voice from typed text.

## Core app structure
- **Home screen**: 3x6 grid (18 tiles) of images. Tap a tile → plays that tile's message (recorded audio or generated TTS). Small settings button in the corner.
- **Settings screen**: menu to configure each of the 18 tiles. Per tile:
  - Image: user can pick a photo from their device, or choose a built-in symbol.
  - Message: user can record their own voice, or type text for auto-generated TTS.
- **Accounts**: users log in (Supabase Auth) and their 18-tile configuration is tied to their account, stored remotely — not just on-device.

## Known constraints carried over from the MVP (verify still true / decide whether to keep)
- Grid was hard-coded to exactly 18 tiles (3x6) — decide now whether to keep this fixed or make it configurable (a bigger/smaller grid could be a monetizable tier later — flag but don't build yet).
- Old app's "lint" script was originally just a typecheck; ESLint (flat config, `eslint.config.js`, scaffolded via `npx expo lint` on 2026-08-16) has since been added and `npm run lint` now runs `expo lint && tsc --noEmit`. Clean as of 2026-08-16.

## Commands
The Expo app now lives at the repo root (moved up from `mobile/` on 2026-08-01).
- `npx expo start` — run dev server (scan QR with Expo Go, or press `a` for an Android emulator)
- `npx tsc --noEmit` — typecheck
- `npx expo export --platform android` — bundle-only sanity check (catches Metro/import errors without a device)
- `eas build --platform android` — store build (not yet configured — needs an EAS account and `eas.json`)

Requires Node 20+ (system Node is 26.5).

## Env vars
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Workflow
- Commit to main. (Confirm with Kevin whether branch-per-feature is wanted once collaborators or CI are added.)

## Priorities for this rewrite, in order
1. ~~Scaffold Expo app, get the static 3x6 grid + tap-to-play working with bundled placeholder audio.~~ Done — plus the full settings screen (image picker, voice recording, TTS text, category color) already wired to on-device storage (AsyncStorage + expo-file-system), ahead of the original ordering, since the source app has no accounts either. AI image generation was considered and dropped — the built-in symbol picker and device photo picker are the permanent solution, not a stand-in for something coming later.
2. ~~Wire up Supabase auth (login/signup) and a `tiles` table (user_id, image_url, audio_url or tts_text, position). Migration path for the on-device cards created in step 1.~~ Done — Google/Apple OAuth via Supabase, `tiles` table with RLS (plus `label`/`bg_color` columns added once those turned out to be user-editable), and a login sync that seeds Supabase from a device's local cards on first login or pulls existing tiles down on a returning one.
3. ~~Wire Settings screen writes to Supabase instead of local storage.~~ Done — edits and resets push to the `tiles` table; photos/recordings upload to private Supabase Storage buckets (`card-images`/`card-audio`, RLS-scoped per user), replacing local file:// paths with signed URLs so they're usable cross-device.
4. ~~Replace on-device data with live data from Supabase per logged-in user.~~ Done, via a local-first cache rather than a pure live-fetch: a device keeps using its own local image/audio file until the tiles row's `updated_at` shows it changed elsewhere, so normal use never waits on the network.
5. EAS build + Play Store submission prep — confirm React Native 0.86's actual minSdkVersion floor is compatible with the Android 8.0 (API 26) target set in `app.json`.