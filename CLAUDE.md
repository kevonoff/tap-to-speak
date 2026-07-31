# Tap to Speak

AAC (augmentative/alternative communication) app for developing children and disabled people to communicate. User taps an image tile; it speaks a message out loud.

**Status: mid-rewrite.** Originally an MVP built in Google AI Studio — a browser-only Vite web app using IndexedDB/localStorage and Web Speech APIs. That version is being rebuilt as a cross-platform mobile app for the Play Store and App Store. Treat the old app as the functional spec, not code to port line-by-line — the storage layer, image generation, and audio all need native-appropriate implementations, not direct translations.

## Target stack
- **Expo (React Native)** — not bare RN. Use Expo modules for camera/image picker, audio recording, and TTS so we get EAS Build for store submission without fighting native config.
- **Supabase** — Postgres DB, auth, and storage buckets (for generated images and voice recordings). One service for accounts + data + files.
- **expo-av** — voice recording and playback.
- **expo-speech** (or a paid TTS provider if voice quality becomes an issue) — auto-generated voice from typed text.
- Image generation — carry over the Gemini image API integration from the old app; needs a server-side call (Supabase Edge Function) rather than client-side, so the API key isn't shipped in the app bundle.

## Core app structure
- **Home screen**: 3x6 grid (18 tiles) of images. Tap a tile → plays that tile's message (recorded audio or generated TTS). Small settings button in the corner.
- **Settings screen**: menu to configure each of the 18 tiles. Per tile:
  - Image: user can generate one (Gemini) or pick from device.
  - Message: user can record their own voice, or type text for auto-generated TTS.
- **Accounts**: users log in (Supabase Auth) and their 18-tile configuration is tied to their account, stored remotely — not just on-device.

## Known constraints carried over from the MVP (verify still true / decide whether to keep)
- Grid was hard-coded to exactly 18 tiles (3x6) — decide now whether to keep this fixed or make it configurable (a bigger/smaller grid could be a monetizable tier later — flag but don't build yet).
- Gemini image generation had fallback behavior for failures/rate limits — preserve this, now server-side.
- Old app's "lint" script was originally just a typecheck; ESLint (flat config, `eslint.config.js`) has since been added and `npm run lint` now runs `eslint . && tsc --noEmit`. There are existing warnings/errors in the old codebase (a few `any` types, some `setState`-in-effect issues) — not yet cleaned up.

## Commands
_Fill in once the Expo project is scaffolded:_
- `npx expo start` — run dev server
- `eas build --platform android` / `--platform ios` — store builds
- `npm run typecheck` — (confirm actual command once ported)

## Env vars
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (server-side only — Edge Function, never in client bundle)

## Workflow
- Commit to main. (Confirm with Kevin whether branch-per-feature is wanted once collaborators or CI are added.)

## Priorities for this rewrite, in order
1. Scaffold Expo app, get the static 3x6 grid + tap-to-play working with bundled placeholder audio.
2. Wire up Supabase auth (login/signup) and a `tiles` table (user_id, image_url, audio_url or tts_text).
3. Settings screen: image picker + Gemini generation, voice recording, TTS text input — writing to Supabase.
4. Replace placeholder tiles with live data from Supabase per logged-in user.
5. EAS build + Play Store submission prep.