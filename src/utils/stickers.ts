export interface StickerItem {
  id: string;
  name: string;
  category: 'Emoji' | 'Reaction' | 'Arrow' | 'Badge' | 'Social Media' | 'News' | 'Decorative' | 'Speech Bubble';
  svg: string;
}

export const STICKER_CATEGORIES = [
  'Emoji',
  'Reaction',
  'Arrow',
  'Badge',
  'Social Media',
  'News',
  'Decorative',
  'Speech Bubble',
] as const;

export const STICKERS: StickerItem[] = [
  // Emojis & Reactions
  {
    id: 'emoji_fire',
    name: 'Fire',
    category: 'Reaction',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5C50 5 62 25 62 42C62 48 58 53 53 53C48 53 45 49 45 44C45 35 50 25 50 25C50 25 30 35 30 55C30 72 41 85 55 85C70 85 82 72 82 55C82 35 68 20 68 20C68 20 73 30 73 40C73 48 68 55 60 55C54 55 50 50 50 45C50 35 55 20 50 5Z" fill="url(#fire_grad)"/>
      <path d="M52 45C52 45 58 55 58 65C58 72 53 77 47 77C41 77 38 72 38 67C38 58 46 50 52 45Z" fill="#FFF275"/>
      <defs>
        <linearGradient id="fire_grad" x1="50" y1="5" x2="50" y2="85" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF1A00"/>
          <stop offset="0.5" stop-color="#FF7A00"/>
          <stop offset="1" stop-color="#FFDD00"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    id: 'reaction_100',
    name: '100 Score',
    category: 'Reaction',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="65%" text-anchor="middle" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="52" fill="#E11D48" letter-spacing="-3">100</text>
      <path d="M12 78L88 78" stroke="#E11D48" stroke-width="7" stroke-linecap="round"/>
      <path d="M18 88L82 88" stroke="#E11D48" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'reaction_sparkle',
    name: 'Sparkle Star',
    category: 'Reaction',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C50 32 68 50 95 50 C68 50 50 68 50 95 C50 68 32 50 5 50 C32 50 50 32 50 5 Z" fill="#FACC15"/>
      <circle cx="50" cy="50" r="8" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'reaction_heart',
    name: 'Heart Love',
    category: 'Reaction',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 82C50 82 15 58 15 32C15 18 26 12 37 12C44 12 48 16 50 20C52 16 56 12 63 12C74 12 85 18 85 32C85 58 50 82 50 82Z" fill="#F43F5E"/>
      <ellipse cx="34" cy="24" rx="6" ry="3" transform="rotate(-30 34 24)" fill="white" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'emoji_sunglasses',
    name: 'Cool Sunglasses',
    category: 'Emoji',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" fill="#FBBF24"/>
      <path d="M22 42C22 40 28 35 44 35C48 35 52 38 52 42L50 55C50 58 45 62 36 62C27 62 22 58 22 55Z" fill="#18181B"/>
      <path d="M78 42C78 40 72 35 56 35C52 35 48 38 48 42L50 55C50 58 55 62 64 62C73 62 78 58 78 55Z" fill="#18181B"/>
      <path d="M44 42H56" stroke="#18181B" stroke-width="4"/>
      <path d="M36 70C42 76 58 76 64 70" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  },

  // News Banners
  {
    id: 'news_breaking',
    name: 'Breaking News',
    category: 'News',
    svg: `<svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="60" rx="6" fill="#DC2626"/>
      <rect x="6" y="6" width="188" height="48" rx="4" fill="#991B1B" stroke="#FEF08A" stroke-width="2"/>
      <text x="50%" y="60%" text-anchor="middle" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="24" fill="#FFFFFF" letter-spacing="2">BREAKING NEWS</text>
    </svg>`,
  },
  {
    id: 'news_live',
    name: 'Live Badge',
    category: 'News',
    svg: `<svg viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="44" rx="22" fill="#EF4444"/>
      <circle cx="26" cy="22" r="7" fill="#FFFFFF"/>
      <text x="68" y="28" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="800" font-size="20" fill="#FFFFFF">LIVE</text>
    </svg>`,
  },
  {
    id: 'news_exclusive',
    name: 'Exclusive Tag',
    category: 'News',
    svg: `<svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H140L160 25L140 50H0V0Z" fill="#F59E0B"/>
      <text x="70" y="32" text-anchor="middle" font-family="'Impact', sans-serif" font-size="22" fill="#000000" letter-spacing="1">EXCLUSIVE</text>
    </svg>`,
  },

  // Badges & Sales
  {
    id: 'badge_sale_50',
    name: '50% OFF',
    category: 'Badge',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#E11D48"/>
      <circle cx="50" cy="50" r="39" stroke="#FFFFFF" stroke-dasharray="4 3" stroke-width="2"/>
      <text x="50%" y="46%" text-anchor="middle" font-family="'Impact', sans-serif" font-size="28" fill="#FFFFFF">50%</text>
      <text x="50%" y="70%" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="900" font-size="16" fill="#FDE047">OFF</text>
    </svg>`,
  },
  {
    id: 'badge_verified',
    name: 'Verified Badge',
    category: 'Badge',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10L61 17L75 16L81 29L92 37L90 51L97 63L88 73L89 87L75 89L66 99L50 94L34 99L25 89L11 87L12 73L3 63L10 51L8 37L19 29L25 16L39 17L50 10Z" fill="#3B82F6"/>
      <path d="M35 50L45 60L68 36" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'badge_special',
    name: 'Special Offer',
    category: 'Badge',
    svg: `<svg viewBox="0 0 140 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="140" height="44" rx="8" fill="#10B981"/>
      <text x="70" y="28" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" letter-spacing="1">SPECIAL OFFER</text>
    </svg>`,
  },

  // Arrows
  {
    id: 'arrow_neon_curved',
    name: 'Curved Neon Arrow',
    category: 'Arrow',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 75C25 40 50 25 78 30" stroke="#F43F5E" stroke-width="8" stroke-linecap="round"/>
      <path d="M65 18L82 30L68 45" stroke="#F43F5E" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'arrow_bold_right',
    name: 'Bold Arrow Right',
    category: 'Arrow',
    svg: `<svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 24H65V6L110 35L65 64V46H10V24Z" fill="#FACC15" stroke="#CA8A04" stroke-width="3"/>
    </svg>`,
  },

  // Social Media
  {
    id: 'social_youtube',
    name: 'YouTube Play',
    category: 'Social Media',
    svg: `<svg viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="70" rx="18" fill="#FF0000"/>
      <path d="M42 22L66 35L42 48V22Z" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'social_instagram',
    name: 'Instagram Icon',
    category: 'Social Media',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="28" fill="url(#ig_grad)"/>
      <rect x="22" y="22" width="56" height="56" rx="16" stroke="#FFFFFF" stroke-width="7"/>
      <circle cx="50" cy="50" r="14" stroke="#FFFFFF" stroke-width="7"/>
      <circle cx="68" cy="32" r="4" fill="#FFFFFF"/>
      <defs>
        <radialGradient id="ig_grad" cx="20%" cy="100%" r="120%">
          <stop stop-color="#FFDD55"/>
          <stop offset="0.2" stop-color="#FF543E"/>
          <stop offset="0.5" stop-color="#C837AB"/>
          <stop offset="1" stop-color="#4F5BD5"/>
        </radialGradient>
      </defs>
    </svg>`,
  },

  // Speech Bubbles & Decorative
  {
    id: 'bubble_comic',
    name: 'Comic Bubble',
    category: 'Speech Bubble',
    svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 15H120C128 15 135 22 135 30V65C135 73 128 80 120 80H50L25 95V80H20C12 80 5 73 5 65V30C5 22 12 15 20 15Z" fill="#FFFFFF" stroke="#000000" stroke-width="5" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'bubble_thought',
    name: 'Thought Bubble',
    category: 'Speech Bubble',
    svg: `<svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="45" r="28" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>
      <circle cx="85" cy="40" r="32" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>
      <circle cx="112" cy="55" r="22" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>
      <circle cx="65" cy="55" r="30" fill="#FFFFFF"/>
      <circle cx="35" cy="80" r="9" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
      <circle cx="22" cy="92" r="5" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
    </svg>`,
  },
  {
    id: 'dec_ribbon',
    name: 'Gold Ribbon',
    category: 'Decorative',
    svg: `<svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 10H150L140 25L150 40H10L20 25L10 10Z" fill="url(#rib_grad)" stroke="#CA8A04" stroke-width="2"/>
      <defs>
        <linearGradient id="rib_grad" x1="0" y1="0" x2="160" y2="50" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FDE047"/>
          <stop offset="0.5" stop-color="#EAB308"/>
          <stop offset="1" stop-color="#CA8A04"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    id: 'dec_crown',
    name: 'VIP Crown',
    category: 'Decorative',
    svg: `<svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 70H90L85 30L65 50L50 15L35 50L15 30L10 70Z" fill="#FACC15" stroke="#B45309" stroke-width="3"/>
      <circle cx="50" cy="15" r="5" fill="#EF4444"/>
      <circle cx="15" cy="30" r="4" fill="#3B82F6"/>
      <circle cx="85" cy="30" r="4" fill="#3B82F6"/>
    </svg>`,
  }
];
