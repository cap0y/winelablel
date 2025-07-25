// Decorative elements and line stickers for wine labels

// Decorative Lines and Dividers
export const ElegantLine = ({ className = "w-full h-2" }) => (
  <svg viewBox="0 0 200 8" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="elegant-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="20%" stopColor="#d4af37" />
        <stop offset="80%" stopColor="#d4af37" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <rect x="0" y="3" width="200" height="2" fill="url(#elegant-line-grad)"/>
    <circle cx="100" cy="4" r="3" fill="#d4af37"/>
  </svg>
);

export const VintageDivider = ({ className = "w-full h-3" }) => (
  <svg viewBox="0 0 200 12" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6 Q60 2 100 6 Q140 10 180 6" stroke="#8b6914" strokeWidth="1.5" fill="none"/>
    <path d="M30 6 Q70 3 100 6 Q130 9 170 6" stroke="#d4af37" strokeWidth="1" fill="none"/>
    <g fill="#8b6914">
      <circle cx="50" cy="6" r="1.5"/>
      <circle cx="100" cy="6" r="2"/>
      <circle cx="150" cy="6" r="1.5"/>
    </g>
  </svg>
);

export const ModernLine = ({ className = "w-full h-1" }) => (
  <svg viewBox="0 0 200 4" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="1.5" width="140" height="1" fill="#d69e2e"/>
  </svg>
);

export const OrnateFrame = ({ className = "w-full h-6" }) => (
  <svg viewBox="0 0 200 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="ornate-pattern" patternUnits="userSpaceOnUse" width="20" height="24">
        <path d="M10 2 Q15 6 10 10 Q5 6 10 2" fill="#d4af37"/>
        <path d="M10 14 Q15 18 10 22 Q5 18 10 14" fill="#d4af37"/>
      </pattern>
    </defs>
    <rect x="10" y="0" width="180" height="24" fill="url(#ornate-pattern)" opacity="0.7"/>
    <rect x="10" y="10" width="180" height="4" fill="#8b6914"/>
  </svg>
);

// Decorative Borders
export const RopeBorder = ({ className = "w-full h-4" }) => (
  <svg viewBox="0 0 200 16" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M0 8 Q10 4 20 8 Q30 12 40 8 Q50 4 60 8 Q70 12 80 8 Q90 4 100 8 Q110 12 120 8 Q130 4 140 8 Q150 12 160 8 Q170 4 180 8 Q190 12 200 8" 
          stroke="#8b7355" strokeWidth="3" fill="none"/>
    <path d="M0 8 Q10 6 20 8 Q30 10 40 8 Q50 6 60 8 Q70 10 80 8 Q90 6 100 8 Q110 10 120 8 Q130 6 140 8 Q150 10 160 8 Q170 6 180 8 Q190 10 200 8" 
          stroke="#6b5b47" strokeWidth="1.5" fill="none"/>
  </svg>
);

export const GoldBorder = ({ className = "w-full h-3" }) => (
  <svg viewBox="0 0 200 12" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gold-border-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="50%" stopColor="#ffed4e" />
        <stop offset="100%" stopColor="#d4af37" />
      </linearGradient>
    </defs>
    <rect x="0" y="3" width="200" height="6" fill="url(#gold-border-grad)"/>
    <rect x="0" y="4" width="200" height="4" fill="#d4af37"/>
    <rect x="0" y="5" width="200" height="2" fill="#ffd700"/>
  </svg>
);

// Decorative Corner Elements
export const CornerFlourish = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4 Q16 8 28 4 Q24 16 28 28 Q16 24 4 28 Q8 16 4 4" fill="#8b6914" opacity="0.7"/>
    <path d="M8 8 Q16 10 24 8 Q22 16 24 24 Q16 22 8 24 Q10 16 8 8" fill="#d4af37"/>
    <circle cx="16" cy="16" r="3" fill="#8b6914"/>
  </svg>
);

export const VintageCorner = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2 L12 2 L12 4 L4 4 L4 12 L2 12 Z" fill="#8b6914"/>
    <path d="M6 6 L10 6 L10 8 L8 8 L8 10 L6 10 Z" fill="#d4af37"/>
  </svg>
);

// Wine-themed Decorative Icons
export const GrapeVine = ({ className = "w-16 h-8" }) => (
  <svg viewBox="0 0 64 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M8 16 Q16 8 24 16 Q32 8 40 16 Q48 8 56 16" stroke="#2d5a2d" strokeWidth="2" fill="none"/>
    <g fill="#6b8e23">
      <circle cx="12" cy="14" r="2"/>
      <circle cx="20" cy="18" r="2"/>
      <circle cx="28" cy="14" r="2"/>
      <circle cx="36" cy="18" r="2"/>
      <circle cx="44" cy="14" r="2"/>
      <circle cx="52" cy="18" r="2"/>
    </g>
    <g fill="#228b22">
      <path d="M14 10 Q16 8 18 10 Q16 12 14 10"/>
      <path d="M30 10 Q32 8 34 10 Q32 12 30 10"/>
      <path d="M46 10 Q48 8 50 10 Q48 12 46 10"/>
    </g>
  </svg>
);

export const WineBarrel = ({ className = "w-12 h-8" }) => (
  <svg viewBox="0 0 48 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="24" cy="16" rx="20" ry="14" fill="#8b7355"/>
    <ellipse cx="24" cy="16" rx="18" ry="12" fill="#a0916f"/>
    <rect x="6" y="14" width="36" height="4" fill="#6b5b47"/>
    <rect x="6" y="8" width="36" height="2" fill="#6b5b47"/>
    <rect x="6" y="22" width="36" height="2" fill="#6b5b47"/>
    <circle cx="24" cy="16" r="3" fill="#5d4e37"/>
  </svg>
);

export const Chateau = ({ className = "w-16 h-12" }) => (
  <svg viewBox="0 0 64 48" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="24" width="32" height="20" fill="#8b7355"/>
    <polygon points="16,24 32,8 48,24" fill="#654321"/>
    <rect x="28" y="32" width="8" height="12" fill="#5d4e37"/>
    <rect x="20" y="28" width="6" height="8" fill="#2c1810"/>
    <rect x="38" y="28" width="6" height="8" fill="#2c1810"/>
    <polygon points="8,36 16,28 16,44 8,44" fill="#8b7355"/>
    <polygon points="56,36 48,28 48,44 56,44" fill="#8b7355"/>
    <polygon points="4,40 12,32 12,44 4,44" fill="#654321"/>
    <polygon points="60,40 52,32 52,44 60,44" fill="#654321"/>
  </svg>
);

// Export all decorative elements
export const decorativeElements = {
  lines: {
    elegant: ElegantLine,
    vintage: VintageDivider,
    modern: ModernLine,
    ornate: OrnateFrame,
  },
  borders: {
    rope: RopeBorder,
    gold: GoldBorder,
  },
  corners: {
    flourish: CornerFlourish,
    vintage: VintageCorner,
  },
  themed: {
    grapeVine: GrapeVine,
    barrel: WineBarrel,
    chateau: Chateau,
  }
};