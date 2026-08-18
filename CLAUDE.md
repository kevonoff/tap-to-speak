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
- `eas build --platform android --profile preview|production` — cloud build via EAS (`eas.json` configured, project linked to Expo account `mavericklegend`); `preview` = internal-distribution APK, `production` = Play Store AAB with `autoIncrement`. Both have been run successfully.
- `eas submit` — not yet used; current Play Store uploads are done manually via the Play Console UI (download the AAB from the `eas build` output link, upload under Testing → Internal testing → Create new release). Setting up a Google Service Account for `eas submit` to automate this is still open.

Requires Node 20+ (system Node is 26.5).

## Env vars
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

(`EXPO_PUBLIC_` prefix required — Expo only inlines prefixed vars into the client bundle. Copy `.env.example` to `.env` and fill in from the Supabase dashboard.)

## Data model — TileCard
As of 2026-08-16/17, the app's 18 cards are represented by a single canonical `TileCard` class (`src/models/TileCard.ts`) — it replaced an older `AACCard` interface everywhere. Key idea: a card's image/audio is a typed `CardMedia` value (`{ kind: 'device' | 'hosted', uri }`), tagged once at the point it's created (photo picker result → `device`, built-in symbol or Storage upload result → `hosted`) instead of being re-guessed later from a `file://` string prefix. This eliminated every ad-hoc "is this a local file?" string check that used to be scattered across `localStorage.ts`, `cardStorage.ts`, and `tilesSync.ts`. `TileCard` is intentionally pure (no I/O, no persistence) — it's the UI's read model only; `App.tsx` still calls `storage.ts`/`tilesSync.ts` directly for persistence (see "Next up" below for the plan to change that).

⚠️ **As of the last session, this refactor + several component renames (`AACCardItem` → `TileCardWorkspaceItem`, etc.) are uncommitted on `main`.** `git status`/`git diff` before doing anything else — there may also be further hand-edits on top (e.g. `TileCard.ts` picked up unused `expo-audio`/`expo-speech`/`expo-haptics` imports mid-edit, likely an unfinished attempt to move playback into a TileCard method — harmless dead-code warnings only, `tsc`/bundle both clean, but worth resolving — either finish that move or strip the unused imports). Confirm what's actually there before assuming this description is exact; verify with `npx tsc --noEmit` and the lint command below before continuing.

## Workflow
- Commit to main. (Confirm with Kevin whether branch-per-feature is wanted once collaborators or CI are added.)

## Priorities for this rewrite, in order
1. ~~Scaffold Expo app, get the static 3x6 grid + tap-to-play working with bundled placeholder audio.~~ Done — plus the full settings screen (image picker, voice recording, TTS text, category color) already wired to on-device storage (AsyncStorage + expo-file-system), ahead of the original ordering, since the source app has no accounts either. AI image generation was considered and dropped — the built-in symbol picker and device photo picker are the permanent solution, not a stand-in for something coming later.
2. ~~Wire up Supabase auth (login/signup) and a `tiles` table (user_id, image_url, audio_url or tts_text, position). Migration path for the on-device cards created in step 1.~~ Done — Google/Apple OAuth via Supabase, `tiles` table with RLS (plus `label`/`bg_color` columns added once those turned out to be user-editable), and a login sync that seeds Supabase from a device's local cards on first login or pulls existing tiles down on a returning one.
3. ~~Wire Settings screen writes to Supabase instead of local storage.~~ Done — edits and resets push to the `tiles` table; photos/recordings upload to private Supabase Storage buckets (`card-images`/`card-audio`, RLS-scoped per user), replacing local file:// paths with signed URLs so they're usable cross-device.
4. ~~Replace on-device data with live data from Supabase per logged-in user.~~ Done, via a local-first cache rather than a pure live-fetch: a device keeps using its own local image/audio file until the tiles row's `updated_at` shows it changed elsewhere, so normal use never waits on the network.
5. ~~EAS build + Play Store submission prep.~~ Mostly done: confirmed RN 0.86's minSdkVersion floor (24) is compatible with the API 26 target in `app.json` (empirically, via multiple successful native builds). EAS project linked (`mavericklegend` account), `eas.json` configured with development/preview/production profiles, EAS environment variables set for all three. Both a `preview` and a `production` build have succeeded. A Play Console developer account exists ("MaverickLegend", Personal type — see note below), an app was created there, and Internal Testing has been verified working end-to-end on a real device (opt-in link → real Play Store install). **Still open:** no `eas submit`/Google Service Account automation yet (manual upload only); no store listing/screenshots/privacy policy/data safety form (not required for internal testing, will be for any public track); going public also requires Google's new-personal-account gate — a closed test with 12+ testers opted in continuously for 14 days before production access unlocks.
6. Repository/data-layer refactor — explicitly deferred, not started. Goal (Kevin's framing): collapse `storage.ts` + `localStorage.ts` + `cardStorage.ts` + `tilesSync.ts` into one module (something like `cardsRepository.ts`) behind a tiny API (`getCards()`, `updateCard()`, `resetCards()`, `onLogin()`) so `App.tsx`/`CardEditorModal` never contain sync/auth/staleness-check logic directly — that becomes the repository's private concern. Likely shape: local-first cache + an outbox-style queue for pushing to Supabase, rather than today's per-write `if (user) { pushCardToSupabase(...) }` calls. Whether `storage.ts`'s settings half (voice rate/pitch/highContrast — local-only, no Supabase sync) folds into the same pattern or stays separate was still an open question when this was last discussed — ask Kevin before assuming either way, and don't just re-propose the design cold; he prefers to think out loud about it first.

## Known bug/behavior to watch for
Play Console's Order management page requires a merchant/payments account to even open — this is expected and not a blocker; the app is free with no in-app purchases, so it's safe to ignore until/unless monetization is actually added. Do not set one up preemptively — Kevin's LLC ("Maverick Legend") payments profile is deliberately not fully configured yet (address/paperwork pending), separate from his already-linked personal Google Payments profile.