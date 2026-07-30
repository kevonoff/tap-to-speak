import { AACCard, PresetAACSymbol } from '../types';

// Utility helper to create crisp SVG Data URLs for AAC symbols
const createSvgDataUrl = (bg: string, pathSvg: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="18" fill="${bg}"/>
    ${pathSvg}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_18_CARDS: AACCard[] = [
  {
    id: 'card-1',
    position: 1,
    label: 'Water',
    spokenText: 'I want water please',
    category: 'need',
    bgColor: '#3B82F6', // Blue for drinks/liquids
    imageUrl: createSvgDataUrl('#EFF6FF', `
      <path d="M50 18 C50 18 28 48 28 65 A22 22 0 0 0 72 65 C72 48 50 18 50 18 Z" fill="#2563EB"/>
      <path d="M42 58 C42 54 46 50 52 52" stroke="#93C5FD" stroke-width="4" stroke-linecap="round" fill="none"/>
    `)
  },
  {
    id: 'card-2',
    position: 2,
    label: 'Eat / Food',
    spokenText: 'I am hungry, I want to eat',
    category: 'need',
    bgColor: '#F59E0B', // Yellow/Orange for food
    imageUrl: createSvgDataUrl('#FFFBEB', `
      <circle cx="50" cy="52" r="32" fill="#FDE68A" stroke="#F59E0B" stroke-width="4"/>
      <path d="M38 35 C38 30 42 26 46 26 M54 26 C58 26 62 30 62 35" stroke="#D97706" stroke-width="3" stroke-linecap="round"/>
      <path d="M35 55 Q50 72 65 55" stroke="#B45309" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M48 20 C48 15 54 12 58 16" stroke="#16A34A" stroke-width="4" stroke-linecap="round" fill="none"/>
    `)
  },
  {
    id: 'card-3',
    position: 3,
    label: 'Toilet',
    spokenText: 'I need to go to the bathroom',
    category: 'need',
    bgColor: '#10B981', // Green
    imageUrl: createSvgDataUrl('#ECFDF5', `
      <rect x="30" y="20" width="40" height="28" rx="6" fill="#10B981"/>
      <ellipse cx="50" cy="58" rx="26" ry="18" fill="#D1FAE5" stroke="#059669" stroke-width="4"/>
      <ellipse cx="50" cy="58" rx="14" ry="9" fill="#059669"/>
      <rect x="42" y="72" width="16" height="15" rx="3" fill="#047857"/>
    `)
  },
  {
    id: 'card-4',
    position: 4,
    label: 'Help',
    spokenText: 'Please help me',
    category: 'need',
    bgColor: '#EF4444', // Urgent Red
    imageUrl: createSvgDataUrl('#FEF2F2', `
      <path d="M50 15 L82 75 L18 75 Z" fill="#EF4444" rx="4"/>
      <path d="M50 32 L50 56" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
      <circle cx="50" cy="67" r="4.5" fill="#FFFFFF"/>
    `)
  },
  {
    id: 'card-5',
    position: 5,
    label: 'Yes',
    spokenText: 'Yes',
    category: 'social',
    bgColor: '#22C55E', // Green
    imageUrl: createSvgDataUrl('#F0FDF4', `
      <circle cx="50" cy="50" r="35" fill="#22C55E"/>
      <path d="M32 50 L44 62 L68 36" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    `)
  },
  {
    id: 'card-6',
    position: 6,
    label: 'No',
    spokenText: 'No thank you',
    category: 'social',
    bgColor: '#EF4444', // Red
    imageUrl: createSvgDataUrl('#FEF2F2', `
      <circle cx="50" cy="50" r="35" fill="#EF4444"/>
      <path d="M35 35 L65 65 M65 35 L35 65" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" fill="none"/>
    `)
  },
  {
    id: 'card-7',
    position: 7,
    label: 'More',
    spokenText: 'I want more please',
    category: 'action',
    bgColor: '#8B5CF6', // Purple
    imageUrl: createSvgDataUrl('#F5F3FF', `
      <circle cx="50" cy="50" r="34" fill="#8B5CF6"/>
      <path d="M50 28 L50 72 M28 50 L72 50" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round"/>
    `)
  },
  {
    id: 'card-8',
    position: 8,
    label: 'All Done',
    spokenText: 'I am all done',
    category: 'action',
    bgColor: '#6B7280', // Slate/Gray
    imageUrl: createSvgDataUrl('#F3F4F6', `
      <path d="M25 50 Q50 20 75 50 T25 50" fill="#9CA3AF"/>
      <rect x="20" y="46" width="60" height="12" rx="6" fill="#4B5563"/>
      <path d="M30 65 L70 65" stroke="#1F2937" stroke-width="6" stroke-linecap="round"/>
    `)
  },
  {
    id: 'card-9',
    position: 9,
    label: 'Happy',
    spokenText: 'I feel happy today',
    category: 'feeling',
    bgColor: '#F59E0B',
    imageUrl: createSvgDataUrl('#FEF3C7', `
      <circle cx="50" cy="50" r="35" fill="#FBBF24"/>
      <circle cx="38" cy="40" r="5" fill="#1F2937"/>
      <circle cx="62" cy="40" r="5" fill="#1F2937"/>
      <path d="M32 56 Q50 75 68 56" stroke="#1F2937" stroke-width="6" stroke-linecap="round" fill="none"/>
    `)
  },
  {
    id: 'card-10',
    position: 10,
    label: 'Sad',
    spokenText: 'I feel sad',
    category: 'feeling',
    bgColor: '#60A5FA',
    imageUrl: createSvgDataUrl('#EFF6FF', `
      <circle cx="50" cy="50" r="35" fill="#93C5FD"/>
      <circle cx="38" cy="42" r="4.5" fill="#1E3A8A"/>
      <circle cx="62" cy="42" r="4.5" fill="#1E3A8A"/>
      <path d="M34 65 Q50 50 66 65" stroke="#1E3A8A" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M68 48 C68 53 64 56 64 56 C64 56 60 53 60 48 C60 45 68 45 68 48 Z" fill="#2563EB"/>
    `)
  },
  {
    id: 'card-11',
    position: 11,
    label: 'Tired',
    spokenText: 'I am tired, I want to rest',
    category: 'feeling',
    bgColor: '#6366F1',
    imageUrl: createSvgDataUrl('#EEF2FF', `
      <path d="M50 18 A28 28 0 1 0 78 46 A22 22 0 1 1 50 18 Z" fill="#6366F1"/>
      <text x="65" y="30" font-family="sans-serif" font-weight="bold" font-size="20" fill="#818CF8">Z</text>
      <text x="76" y="20" font-family="sans-serif" font-weight="bold" font-size="14" fill="#A5B4FC">z</text>
    `)
  },
  {
    id: 'card-12',
    position: 12,
    label: 'Play',
    spokenText: 'I want to play toys',
    category: 'action',
    bgColor: '#EC4899',
    imageUrl: createSvgDataUrl('#FDF2F8', `
      <rect x="22" y="22" width="26" height="26" rx="5" fill="#F43F5E"/>
      <text x="31" y="41" font-family="sans-serif" font-weight="bold" font-size="18" fill="#FFF">A</text>
      <rect x="52" y="22" width="26" height="26" rx="5" fill="#3B82F6"/>
      <text x="61" y="41" font-family="sans-serif" font-weight="bold" font-size="18" fill="#FFF">B</text>
      <rect x="37" y="52" width="26" height="26" rx="5" fill="#10B981"/>
      <text x="46" y="71" font-family="sans-serif" font-weight="bold" font-size="18" fill="#FFF">C</text>
    `)
  },
  {
    id: 'card-13',
    position: 13,
    label: 'Outside',
    spokenText: 'I want to go outside',
    category: 'action',
    bgColor: '#10B981',
    imageUrl: createSvgDataUrl('#F0FDF4', `
      <circle cx="50" cy="32" r="16" fill="#FBBF24"/>
      <path d="M15 80 Q32 55 50 80 Q68 55 85 80 Z" fill="#22C55E"/>
      <path d="M30 80 L30 65 L40 65 L40 80 Z" fill="#78350F"/>
    `)
  },
  {
    id: 'card-14',
    position: 14,
    label: 'Mom',
    spokenText: 'Mom',
    category: 'person',
    bgColor: '#F43F5E',
    imageUrl: createSvgDataUrl('#FFF1F2', `
      <circle cx="50" cy="38" r="18" fill="#FECDD3"/>
      <path d="M28 78 Q50 50 72 78 Z" fill="#FB7185"/>
      <path d="M30 38 Q50 18 70 38 Q70 24 50 20 Q30 24 30 38" fill="#E11D48"/>
      <circle cx="43" cy="38" r="2.5" fill="#881337"/>
      <circle cx="57" cy="38" r="2.5" fill="#881337"/>
      <path d="M44 46 Q50 51 56 46" stroke="#881337" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    `)
  },
  {
    id: 'card-15',
    position: 15,
    label: 'Dad',
    spokenText: 'Dad',
    category: 'person',
    bgColor: '#0284C7',
    imageUrl: createSvgDataUrl('#F0F9FF', `
      <circle cx="50" cy="38" r="18" fill="#BAE6FD"/>
      <path d="M28 78 Q50 52 72 78 Z" fill="#38BDF8"/>
      <path d="M32 28 Q50 20 68 28 C64 22 36 22 32 28" fill="#0369A1"/>
      <circle cx="43" cy="38" r="2.5" fill="#0C4A6E"/>
      <circle cx="57" cy="38" r="2.5" fill="#0C4A6E"/>
      <path d="M44 46 Q50 52 56 46" stroke="#0C4A6E" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    `)
  },
  {
    id: 'card-16',
    position: 16,
    label: 'Hug',
    spokenText: 'I want a hug',
    category: 'feeling',
    bgColor: '#EC4899',
    imageUrl: createSvgDataUrl('#FDF2F8', `
      <path d="M50 32 C50 32 30 18 20 30 C10 42 28 62 50 82 C72 62 90 42 80 30 C70 18 50 32 50 32 Z" fill="#F43F5E"/>
    `)
  },
  {
    id: 'card-17',
    position: 17,
    label: 'Hurt',
    spokenText: 'Ouch, something hurts me',
    category: 'need',
    bgColor: '#DC2626',
    imageUrl: createSvgDataUrl('#FEF2F2', `
      <rect x="25" y="40" width="50" height="20" rx="6" fill="#FCA5A5" transform="rotate(-25 50 50)"/>
      <circle cx="50" cy="50" r="5" fill="#DC2626"/>
      <path d="M42 20 L58 20 M50 12 L50 28" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
    `)
  },
  {
    id: 'card-18',
    position: 18,
    label: 'Thank You',
    spokenText: 'Thank you very much',
    category: 'social',
    bgColor: '#059669',
    imageUrl: createSvgDataUrl('#ECFDF5', `
      <path d="M32 75 L32 45 C32 40 45 20 52 20 C56 20 58 25 55 32 L48 45 L72 45 C78 45 82 50 80 56 L72 75 C70 78 66 80 62 80 L38 80 C34 80 32 78 32 75 Z" fill="#10B981"/>
      <rect x="20" y="45" width="10" height="35" rx="3" fill="#047857"/>
    `)
  }
];

export const PRESET_LIBRARY: PresetAACSymbol[] = [
  {
    id: 'preset-milk',
    title: 'Milk',
    spokenText: 'I want milk please',
    category: 'need',
    bgColor: '#3B82F6',
    svgIcon: createSvgDataUrl('#EFF6FF', `<rect x="35" y="25" width="30" height="55" rx="6" fill="#FFFFFF" stroke="#3B82F6" stroke-width="4"/><rect x="42" y="15" width="16" height="10" fill="#60A5FA"/>`)
  },
  {
    id: 'preset-juice',
    title: 'Juice',
    spokenText: 'I want juice',
    category: 'need',
    bgColor: '#F59E0B',
    svgIcon: createSvgDataUrl('#FFFBEB', `<path d="M32 30 L36 75 C37 80 63 80 64 75 L68 30 Z" fill="#FBBF24"/><line x1="56" y1="12" x2="44" y2="45" stroke="#EF4444" stroke-width="5" stroke-linecap="round"/>`)
  },
  {
    id: 'preset-music',
    title: 'Music',
    spokenText: 'I want to listen to music',
    category: 'action',
    bgColor: '#8B5CF6',
    svgIcon: createSvgDataUrl('#F5F3FF', `<circle cx="35" cy="65" r="10" fill="#8B5CF6"/><circle cx="65" cy="55" r="10" fill="#8B5CF6"/><path d="M43 65 L43 25 L73 15 L73 55" stroke="#8B5CF6" stroke-width="6" fill="none"/>`)
  },
  {
    id: 'preset-book',
    title: 'Book / Story',
    spokenText: 'Read me a story book',
    category: 'action',
    bgColor: '#10B981',
    svgIcon: createSvgDataUrl('#ECFDF5', `<path d="M18 30 Q50 20 82 30 L82 72 Q50 62 18 72 Z" fill="#D1FAE5" stroke="#059669" stroke-width="4"/><line x1="50" y1="22" x2="50" y2="67" stroke="#059669" stroke-width="4"/>`)
  },
  {
    id: 'preset-quiet',
    title: 'Quiet / Stop',
    spokenText: 'It is too loud, I need quiet',
    category: 'feeling',
    bgColor: '#6B7280',
    svgIcon: createSvgDataUrl('#F3F4F6', `<circle cx="50" cy="50" r="30" fill="#9CA3AF"/><path d="M40 38 L40 62 M50 38 L50 62 M60 38 L60 62" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>`)
  }
];
