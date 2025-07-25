// Authentic wine label design patterns

export const VintageLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="vintage-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#f8f6f0"/>
        <circle cx="10" cy="10" r="1" fill="#d4af37" opacity="0.3"/>
      </pattern>
    </defs>
    
    {/* Vintage paper background */}
    <rect width="160" height="200" fill="url(#vintage-pattern)" stroke="#d4af37" strokeWidth="2" rx="8"/>
    
    {/* Ornate border */}
    <rect x="10" y="10" width="140" height="180" fill="none" stroke="#8b4513" strokeWidth="1" rx="4"/>
    <rect x="15" y="15" width="130" height="170" fill="none" stroke="#d4af37" strokeWidth="0.5" rx="2"/>
    
    {/* Decorative corners */}
    <g fill="#8b4513" opacity="0.7">
      <path d="M20 20 L30 20 L25 30 Z"/>
      <path d="M140 20 L130 20 L135 30 Z"/>
      <path d="M20 180 L30 180 L25 170 Z"/>
      <path d="M140 180 L130 180 L135 170 Z"/>
    </g>
    
    {/* Vintage flourishes */}
    <g stroke="#8b4513" strokeWidth="1" fill="none" opacity="0.6">
      <path d="M40 40 Q50 35 60 40 Q70 45 80 40"/>
      <path d="M80 160 Q90 165 100 160 Q110 155 120 160"/>
    </g>
  </svg>
);

export const ModernLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="modern-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="100%" stopColor="#f0f0f0"/>
      </linearGradient>
    </defs>
    
    {/* Clean modern background */}
    <rect width="160" height="200" fill="url(#modern-gradient)" rx="4"/>
    
    {/* Geometric elements */}
    <rect x="20" y="30" width="120" height="2" fill="#333333"/>
    <rect x="20" y="168" width="120" height="2" fill="#333333"/>
    
    {/* Modern accent lines */}
    <g fill="#007acc" opacity="0.8">
      <rect x="0" y="0" width="4" height="200"/>
      <rect x="156" y="0" width="4" height="200"/>
    </g>
    
    {/* Minimalist design elements */}
    <circle cx="80" cy="50" r="8" fill="none" stroke="#333333" strokeWidth="1"/>
    <rect x="70" y="150" width="20" height="1" fill="#333333"/>
  </svg>
);

export const ElegantLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="elegant-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1a1a2e"/>
        <stop offset="50%" stopColor="#16213e"/>
        <stop offset="100%" stopColor="#1a1a2e"/>
      </linearGradient>
      <pattern id="elegant-texture" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#1a1a2e"/>
        <circle cx="4" cy="4" r="0.5" fill="#d4af37" opacity="0.2"/>
      </pattern>
    </defs>
    
    {/* Elegant dark background */}
    <rect width="160" height="200" fill="url(#elegant-texture)" rx="6"/>
    
    {/* Gold border */}
    <rect x="8" y="8" width="144" height="184" fill="none" stroke="#d4af37" strokeWidth="2" rx="4"/>
    <rect x="12" y="12" width="136" height="176" fill="none" stroke="#d4af37" strokeWidth="0.5" rx="2"/>
    
    {/* Elegant flourishes */}
    <g stroke="#d4af37" strokeWidth="1" fill="#d4af37" opacity="0.8">
      <path d="M80 25 Q75 20 70 25 Q75 30 80 25 Q85 20 90 25 Q85 30 80 25"/>
      <path d="M80 175 Q75 170 70 175 Q75 180 80 175 Q85 170 90 175 Q85 180 80 175"/>
    </g>
    
    {/* Decorative side elements */}
    <g fill="#d4af37" opacity="0.6">
      <rect x="25" y="60" width="1" height="80"/>
      <rect x="134" y="60" width="1" height="80"/>
      <circle cx="25" cy="60" r="2"/>
      <circle cx="25" cy="140" r="2"/>
      <circle cx="134" cy="60" r="2"/>
      <circle cx="134" cy="140" r="2"/>
    </g>
  </svg>
);

export const RusticLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="rustic-wood" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#deb887"/>
        <path d="M0 10 L40 10" stroke="#cd853f" strokeWidth="1" opacity="0.5"/>
        <path d="M0 25 L40 25" stroke="#cd853f" strokeWidth="0.5" opacity="0.3"/>
      </pattern>
    </defs>
    
    {/* Rustic wood background */}
    <rect width="160" height="200" fill="url(#rustic-wood)" rx="8"/>
    
    {/* Weathered border */}
    <rect x="12" y="12" width="136" height="176" fill="none" stroke="#8b4513" strokeWidth="3" rx="4" opacity="0.8"/>
    
    {/* Rustic elements */}
    <g fill="#8b4513" opacity="0.6">
      <circle cx="30" cy="30" r="3"/>
      <circle cx="130" cy="30" r="3"/>
      <circle cx="30" cy="170" r="3"/>
      <circle cx="130" cy="170" r="3"/>
    </g>
    
    {/* Wood grain lines */}
    <g stroke="#8b4513" strokeWidth="1" opacity="0.3" fill="none">
      <path d="M20 50 Q80 45 140 50"/>
      <path d="M20 100 Q80 95 140 100"/>
      <path d="M20 150 Q80 145 140 150"/>
    </g>
  </svg>
);

export const PremiumLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="premium-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2c3e50"/>
        <stop offset="50%" stopColor="#34495e"/>
        <stop offset="100%" stopColor="#2c3e50"/>
      </linearGradient>
      <linearGradient id="premium-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700"/>
        <stop offset="50%" stopColor="#ffed4e"/>
        <stop offset="100%" stopColor="#ffd700"/>
      </linearGradient>
    </defs>
    
    {/* Premium background */}
    <rect width="160" height="200" fill="url(#premium-bg)" rx="6"/>
    
    {/* Luxurious gold frame */}
    <rect x="6" y="6" width="148" height="188" fill="none" stroke="url(#premium-gold)" strokeWidth="2" rx="4"/>
    <rect x="10" y="10" width="140" height="180" fill="none" stroke="url(#premium-gold)" strokeWidth="0.5" rx="3"/>
    
    {/* Premium decorative elements */}
    <g fill="url(#premium-gold)">
      <polygon points="80,20 85,30 95,30 87,38 90,48 80,43 70,48 73,38 65,30 75,30"/>
      <rect x="70" y="170" width="20" height="2" rx="1"/>
      <circle cx="80" cy="180" r="2"/>
    </g>
    
    {/* Elegant side decorations */}
    <g stroke="url(#premium-gold)" strokeWidth="1" fill="none" opacity="0.8">
      <path d="M30 60 Q35 55 40 60 Q35 65 30 60"/>
      <path d="M120 60 Q125 55 130 60 Q125 65 120 60"/>
      <path d="M30 140 Q35 135 40 140 Q35 145 30 140"/>
      <path d="M120 140 Q125 135 130 140 Q125 145 120 140"/>
    </g>
  </svg>
);

export const ClassicLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="classic-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="#f5f5dc"/>
        <path d="M15 0 L15 30 M0 15 L30 15" stroke="#e6e6d4" strokeWidth="0.5" opacity="0.3"/>
      </pattern>
    </defs>
    
    {/* Classic cream background */}
    <rect width="160" height="200" fill="url(#classic-pattern)" rx="6"/>
    
    {/* Traditional border */}
    <rect x="15" y="15" width="130" height="170" fill="none" stroke="#8b4513" strokeWidth="2" rx="3"/>
    <rect x="20" y="20" width="120" height="160" fill="none" stroke="#8b4513" strokeWidth="1" rx="2"/>
    
    {/* Classic ornamental corners */}
    <g fill="#8b4513" opacity="0.7">
      <path d="M25 25 Q30 20 35 25 Q30 30 25 25"/>
      <path d="M125 25 Q130 20 135 25 Q130 30 125 25"/>
      <path d="M25 175 Q30 170 35 175 Q30 180 25 175"/>
      <path d="M125 175 Q130 170 135 175 Q130 180 125 175"/>
    </g>
    
    {/* Central medallion */}
    <circle cx="80" cy="100" r="25" fill="none" stroke="#8b4513" strokeWidth="1"/>
    <circle cx="80" cy="100" r="20" fill="none" stroke="#8b4513" strokeWidth="0.5"/>
  </svg>
);

export const MinimalLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 200" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Pure minimal design */}
    <rect width="160" height="200" fill="#ffffff" rx="2"/>
    
    {/* Subtle border */}
    <rect x="1" y="1" width="158" height="198" fill="none" stroke="#e0e0e0" strokeWidth="1" rx="2"/>
    
    {/* Minimal accent */}
    <rect x="20" y="40" width="120" height="1" fill="#333333"/>
    <rect x="60" y="160" width="40" height="1" fill="#333333"/>
    
    {/* Simple geometric element */}
    <circle cx="80" cy="100" r="12" fill="none" stroke="#333333" strokeWidth="1"/>
  </svg>
);

export const OrnateLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="ornate-pattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#8b0000"/>
        <circle cx="8" cy="8" r="2" fill="#ffd700" opacity="0.2"/>
      </pattern>
    </defs>
    
    {/* Rich burgundy background */}
    <rect width="160" height="200" fill="url(#ornate-pattern)" rx="8"/>
    
    {/* Ornate gold borders */}
    <rect x="8" y="8" width="144" height="184" fill="none" stroke="#ffd700" strokeWidth="2" rx="6"/>
    <rect x="12" y="12" width="136" height="176" fill="none" stroke="#ffd700" strokeWidth="1" rx="4"/>
    <rect x="16" y="16" width="128" height="168" fill="none" stroke="#ffd700" strokeWidth="0.5" rx="3"/>
    
    {/* Elaborate decorations */}
    <g fill="#ffd700" opacity="0.9">
      <path d="M80 20 Q70 15 70 25 Q75 30 80 25 Q85 30 90 25 Q90 15 80 20"/>
      <path d="M40 50 Q35 45 35 55 Q40 60 45 55 Q50 60 55 55 Q55 45 50 50 Q45 45 40 50"/>
      <path d="M105 50 Q110 45 115 50 Q120 45 125 50 Q125 55 120 60 Q115 55 110 60 Q105 55 105 50"/>
      <path d="M80 180 Q70 175 70 185 Q75 190 80 185 Q85 190 90 185 Q90 175 80 180"/>
    </g>
    
    {/* Ornate flourishes */}
    <g stroke="#ffd700" strokeWidth="1" fill="none" opacity="0.8">
      <path d="M30 80 Q40 75 50 80 Q60 85 70 80"/>
      <path d="M90 120 Q100 115 110 120 Q120 125 130 120"/>
    </g>
  </svg>
);

export const wineLabelDesigns = {
  vintage: VintageLabel,
  modern: ModernLabel,
  elegant: ElegantLabel,
  rustic: RusticLabel,
  premium: PremiumLabel,
  classic: ClassicLabel,
  minimal: MinimalLabel,
  ornate: OrnateLabel,
};