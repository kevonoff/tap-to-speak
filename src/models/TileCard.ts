/**
 * TileCard is the single, canonical representation of one of the app's 18
 * communication cards — the UI's only source of truth for what to display.
 * It is a plain, immutable value with no persistence logic of its own: a
 * repository is responsible for loading, saving, and syncing TileCards, and
 * hands them to the UI already built. Nothing outside a repository should
 * construct or reshape a TileCard's `image`/`audio` fields directly.
 */

/**
 * What a piece of media (a card's image or audio) actually is, tracked
 * explicitly at the point it's created rather than guessed later from the
 * shape of a URI string:
 * - 'device': a file on this device's local filesystem, not (yet) known to
 *   be portable to another device.
 * - 'hosted': already portable without touching this device's filesystem —
 *   a built-in inline symbol, or a file already uploaded to Supabase Storage.
 */
import { BaseSettings } from '../types';
import { playRecordedAudio, saySpokenText } from '../utils/audio';

export type MediaKind = 'device' | 'hosted';
export type CardCategory = 'need' | 'feeling' | 'action' | 'person' | 'social';
const DEFAULT_BG_COLOR = '#3B82F6';
const UNTITLED_LABEL = 'Missing Label/Title';

export interface CardMedia {
  readonly kind: MediaKind;
  readonly uri: string;
}

export interface TileCardProps {
  position: number;
  label: string;
  spokenText: string;
  image: CardMedia;
  audio: CardMedia | null;
  bgColor: string;
  category?: CardCategory;
  // Bookkeeping only, not user-facing: the tiles row's updated_at as of the
  // last successful sync, used to detect whether it changed on another
  // device since. See the repository that owns syncing.
  lastSyncedUpdatedAt?: string | null;
}

export class TileCard {
  readonly position: number;
  readonly label: string;
  readonly spokenText: string;
  readonly image: CardMedia;
  readonly audio: CardMedia | null;
  readonly bgColor: string;
  readonly category?: CardCategory;
  readonly lastSyncedUpdatedAt: string | null;

  constructor(props: TileCardProps) {
    this.position = props.position;
    this.label = props.label;
    this.spokenText = props.spokenText;
    this.image = props.image;
    this.audio = props.audio;
    this.bgColor = props.bgColor || DEFAULT_BG_COLOR;
    this.category = props.category;
    this.lastSyncedUpdatedAt = props.lastSyncedUpdatedAt ?? null;
  }

  /** What to actually show as the label — falls back when blank. */
  get displayLabel(): string {
    return this.label.trim() || UNTITLED_LABEL;
  }

  /** What to actually speak when tapped and there's no recording. */
  get displaySpokenText(): string {
    return this.spokenText.trim() || this.displayLabel;
  }

  get hasRecording(): boolean {
    return this.audio !== null;
  }

  /** Plain URI strings, for components that just need something to render or play. */
  get imageUri(): string {
    return this.image.uri;
  }

  get audioUri(): string | null {
    return this.audio?.uri ?? null;
  }

  /** Returns a new TileCard with the given fields changed. TileCards are immutable. */
  with(changes: Partial<TileCardProps>): TileCard {
    return new TileCard({ ...this, ...changes });
  }

  /** Tags a URI as living on this device's filesystem (a fresh photo or recording). */
  static device(uri: string): CardMedia {
    return { kind: 'device', uri };
  }

  /** Tags a URI as already portable (a built-in symbol or an uploaded Storage URL). */
  static hosted(uri: string): CardMedia {
    return { kind: 'hosted', uri };
  }


  public PlayAudio(
    baseSettings: BaseSettings,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (this.audioUri) {
      playRecordedAudio(this.audioUri, onStart, onEnd, () => saySpokenText(this.spokenText, baseSettings, onStart, onEnd));
    } else {
      saySpokenText(this.spokenText, baseSettings, onStart, onEnd);
    }
  }
  

  
}
