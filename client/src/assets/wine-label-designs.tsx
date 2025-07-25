// Authentic wine label designs inspired by real wine labels

export const VintageLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vintage-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8f5f0" />
        <stop offset="100%" stopColor="#e8e0d5" />
      </linearGradient>
      <pattern id="vintage-texture" patternUnits="userSpaceOnUse" width="20" height="20">
        <rect width="20" height="20" fill="#f5f0e8"/>
        <circle cx="10" cy="10" r="0.5" fill="#d4c4a8" opacity="0.3"/>
      </pattern>
    </defs>
    
    {/* Background */}
    <rect width="200" height="240" fill="url(#vintage-bg)" rx="8"/>
    <rect width="200" height="240" fill="url(#vintage-texture)" opacity="0.3" rx="8"/>
    
    {/* Ornate border */}
    <rect x="8" y="8" width="184" height="224" fill="none" stroke="#8b6914" strokeWidth="2" rx="6"/>
    <rect x="12" y="12" width="176" height="216" fill="none" stroke="#d4af37" strokeWidth="1" rx="4"/>
    
    {/* Corner decorations */}
    <g fill="#8b6914">
      <path d="M20 20 L35 20 L35 25 L25 25 L25 35 L20 35 Z"/>
      <path d="M180 20 L165 20 L165 25 L175 25 L175 35 L180 35 Z"/>
      <path d="M20 220 L35 220 L35 215 L25 215 L25 205 L20 205 Z"/>
      <path d="M180 220 L165 220 L165 215 L175 215 L175 205 L180 205 Z"/>
    </g>
    
    {/* Vintage flourish */}
    <g transform="translate(100,50)" fill="#8b6914">
      <path d="M-20 0 Q-10 -10 0 0 Q10 -10 20 0 Q10 10 0 0 Q-10 10 -20 0"/>
    </g>
  </svg>
);

export const ModernLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="modern-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2d3748" />
        <stop offset="100%" stopColor="#1a202c" />
      </linearGradient>
      <linearGradient id="modern-accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d69e2e" />
        <stop offset="100%" stopColor="#f6e05e" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect width="200" height="240" fill="url(#modern-bg)" rx="4"/>
    
    {/* Geometric accent */}
    <rect x="0" y="0" width="200" height="20" fill="url(#modern-accent)"/>
    <rect x="0" y="220" width="200" height="20" fill="url(#modern-accent)"/>
    
    {/* Modern line elements */}
    <line x1="40" y1="40" x2="160" y2="40" stroke="#d69e2e" strokeWidth="1"/>
    <line x1="40" y1="200" x2="160" y2="200" stroke="#d69e2e" strokeWidth="1"/>
    
    {/* Minimalist diamond */}
    <g transform="translate(100,120)" fill="none" stroke="#d69e2e" strokeWidth="1.5">
      <path d="M0 -15 L15 0 L0 15 L-15 0 Z"/>
    </g>
  </svg>
);

export const ElegantLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="elegant-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#faf7f2" />
        <stop offset="100%" stopColor="#f1e9dc" />
      </linearGradient>
      <radialGradient id="elegant-center" cx="50%" cy="50%">
        <stop offset="0%" stopColor="rgba(139,105,20,0.1)" />
        <stop offset="100%" stopColor="rgba(139,105,20,0)" />
      </radialGradient>
    </defs>
    
    {/* Background */}
    <rect width="200" height="240" fill="url(#elegant-bg)" rx="8"/>
    <rect width="200" height="240" fill="url(#elegant-center)" rx="8"/>
    
    {/* Elegant frame */}
    <rect x="15" y="15" width="170" height="210" fill="none" stroke="#8b6914" strokeWidth="1.5" rx="6"/>
    
    {/* Ornate decorations */}
    <g transform="translate(100,40)" fill="#8b6914">
      <path d="M-30 0 Q-15 -8 0 0 Q15 -8 30 0 Q15 8 0 0 Q-15 8 -30 0"/>
      <circle cx="0" cy="0" r="3"/>
    </g>
    
    <g transform="translate(100,200)" fill="#8b6914">
      <path d="M-25 0 Q-12 -6 0 0 Q12 -6 25 0 Q12 6 0 0 Q-12 6 -25 0"/>
    </g>
    
    {/* Side decorations */}
    <g transform="translate(30,120)" fill="#8b6914">
      <path d="M0 -20 Q8 -10 0 0 Q8 10 0 20 Q-8 10 0 0 Q-8 -10 0 -20"/>
    </g>
    <g transform="translate(170,120)" fill="#8b6914">
      <path d="M0 -20 Q-8 -10 0 0 Q-8 10 0 20 Q8 10 0 0 Q8 -10 0 -20"/>
    </g>
  </svg>
);

export const PremiumLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="premium-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1a1a2e" />
        <stop offset="50%" stopColor="#16213e" />
        <stop offset="100%" stopColor="#0f1419" />
      </linearGradient>
      <linearGradient id="gold-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="50%" stopColor="#ffed4e" />
        <stop offset="100%" stopColor="#d4af37" />
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect width="200" height="240" fill="url(#premium-bg)" rx="6"/>
    
    {/* Gold frame */}
    <rect x="10" y="10" width="180" height="220" fill="none" stroke="url(#gold-accent)" strokeWidth="2" rx="4"/>
    <rect x="16" y="16" width="168" height="208" fill="none" stroke="url(#gold-accent)" strokeWidth="1" rx="2"/>
    
    {/* Premium crest */}
    <g transform="translate(100,60)" fill="url(#gold-accent)">
      <path d="M0 -20 L8 -12 L16 -16 L12 -6 L20 0 L12 6 L16 16 L8 12 L0 20 L-8 12 L-16 16 L-12 6 L-20 0 L-12 -6 L-16 -16 L-8 -12 Z"/>
      <circle cx="0" cy="0" r="6"/>
    </g>
    
    {/* Decorative lines */}
    <line x1="50" y1="180" x2="150" y2="180" stroke="url(#gold-accent)" strokeWidth="1"/>
    <line x1="60" y1="190" x2="140" y2="190" stroke="url(#gold-accent)" strokeWidth="0.5"/>
  </svg>
);

export const RusticLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="wood-grain" patternUnits="userSpaceOnUse" width="40" height="8">
        <rect width="40" height="8" fill="#8b7355"/>
        <path d="M0 2 Q10 1 20 2 Q30 3 40 2" stroke="#6b5b47" strokeWidth="0.5" fill="none"/>
        <path d="M0 6 Q15 5 30 6 Q35 7 40 6" stroke="#6b5b47" strokeWidth="0.3" fill="none"/>
      </pattern>
      <filter id="rustic-shadow">
        <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#4a3c28" floodOpacity="0.3"/>
      </filter>
    </defs>
    
    {/* Wood background */}
    <rect width="200" height="240" fill="#a0916f" rx="6"/>
    <rect width="200" height="240" fill="url(#wood-grain)" opacity="0.8" rx="6"/>
    
    {/* Rope border effect */}
    <rect x="8" y="8" width="184" height="224" fill="none" stroke="#5d4e37" strokeWidth="3" rx="4" strokeDasharray="8,4"/>
    
    {/* Rustic badge */}
    <g transform="translate(100,50)">
      <circle cx="0" cy="0" r="25" fill="#5d4e37" filter="url(#rustic-shadow)"/>
      <circle cx="0" cy="0" r="20" fill="#8b7355" stroke="#5d4e37" strokeWidth="2"/>
      <path d="M-12 -8 L12 -8 L12 8 L-12 8 Z" fill="#5d4e37"/>
    </g>
    
    {/* Wood planks effect */}
    <line x1="0" y1="100" x2="200" y2="100" stroke="#6b5b47" strokeWidth="1" opacity="0.5"/>
    <line x1="0" y1="140" x2="200" y2="140" stroke="#6b5b47" strokeWidth="1" opacity="0.5"/>
  </svg>
);

export const ClassicLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="classic-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fffef7" />
        <stop offset="100%" stopColor="#f5f5dc" />
      </linearGradient>
      <pattern id="classic-dots" patternUnits="userSpaceOnUse" width="10" height="10">
        <rect width="10" height="10" fill="transparent"/>
        <circle cx="5" cy="5" r="0.5" fill="#d2b48c" opacity="0.3"/>
      </pattern>
    </defs>
    
    {/* Background */}
    <rect width="200" height="240" fill="url(#classic-bg)" rx="6"/>
    <rect width="200" height="240" fill="url(#classic-dots)" rx="6"/>
    
    {/* Classic border */}
    <rect x="12" y="12" width="176" height="216" fill="none" stroke="#8b4513" strokeWidth="2" rx="4"/>
    <rect x="18" y="18" width="164" height="204" fill="none" stroke="#cd853f" strokeWidth="1" rx="2"/>
    
    {/* Shield emblem */}
    <g transform="translate(100,60)" fill="#8b4513">
      <path d="M0 -20 Q-15 -15 -15 0 Q-15 15 0 20 Q15 15 15 0 Q15 -15 0 -20"/>
      <path d="M0 -15 Q-10 -12 -10 0 Q-10 10 0 15 Q10 10 10 0 Q10 -12 0 -15" fill="#cd853f"/>
    </g>
    
    {/* Classic flourishes */}
    <g transform="translate(50,180)" fill="#8b4513">
      <path d="M0 0 Q10 -5 20 0 Q10 5 0 0"/>
    </g>
    <g transform="translate(150,180)" fill="#8b4513">
      <path d="M0 0 Q-10 -5 -20 0 Q-10 5 0 0"/>
    </g>
  </svg>
);

export const MinimalLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="minimal-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f8f9fa" />
      </linearGradient>
    </defs>
    
    {/* Clean background */}
    <rect width="200" height="240" fill="url(#minimal-bg)" rx="4"/>
    
    {/* Minimal border */}
    <rect x="20" y="20" width="160" height="200" fill="none" stroke="#6c757d" strokeWidth="1" rx="2"/>
    
    {/* Simple accent lines */}
    <line x1="60" y1="60" x2="140" y2="60" stroke="#495057" strokeWidth="1"/>
    <line x1="60" y1="180" x2="140" y2="180" stroke="#495057" strokeWidth="1"/>
    
    {/* Minimal dot */}
    <circle cx="100" cy="120" r="2" fill="#495057"/>
  </svg>
);

export const OrnateLabel = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 200 240" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ornate-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#800020" />
        <stop offset="50%" stopColor="#a0002a" />
        <stop offset="100%" stopColor="#600018" />
      </linearGradient>
      <linearGradient id="ornate-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="50%" stopColor="#ffed4e" />
        <stop offset="100%" stopColor="#d4af37" />
      </linearGradient>
    </defs>
    
    {/* Rich background */}
    <rect width="200" height="240" fill="url(#ornate-bg)" rx="8"/>
    
    {/* Ornate gold frame */}
    <rect x="8" y="8" width="184" height="224" fill="none" stroke="url(#ornate-gold)" strokeWidth="3" rx="6"/>
    <rect x="14" y="14" width="172" height="212" fill="none" stroke="url(#ornate-gold)" strokeWidth="1" rx="4"/>
    
    {/* Elaborate corner decorations */}
    <g fill="url(#ornate-gold)">
      <g transform="translate(30,30)">
        <path d="M0 0 Q10 0 10 10 Q0 10 0 0"/>
        <path d="M-5 5 L15 5 M5 -5 L5 15" stroke="url(#ornate-gold)" strokeWidth="1"/>
      </g>
      <g transform="translate(170,30)">
        <path d="M0 0 Q-10 0 -10 10 Q0 10 0 0"/>
        <path d="M5 5 L-15 5 M-5 -5 L-5 15" stroke="url(#ornate-gold)" strokeWidth="1"/>
      </g>
      <g transform="translate(30,210)">
        <path d="M0 0 Q10 0 10 -10 Q0 -10 0 0"/>
        <path d="M-5 -5 L15 -5 M5 5 L5 -15" stroke="url(#ornate-gold)" strokeWidth="1"/>
      </g>
      <g transform="translate(170,210)">
        <path d="M0 0 Q-10 0 -10 -10 Q0 -10 0 0"/>
        <path d="M5 -5 L-15 -5 M-5 5 L-5 -15" stroke="url(#ornate-gold)" strokeWidth="1"/>
      </g>
    </g>
    
    {/* Central ornate motif */}
    <g transform="translate(100,120)" fill="url(#ornate-gold)">
      <path d="M0 -25 Q12 -20 20 -12 Q12 -4 0 0 Q-12 -4 -20 -12 Q-12 -20 0 -25"/>
      <path d="M0 25 Q12 20 20 12 Q12 4 0 0 Q-12 4 -20 12 Q-12 20 0 25"/>
      <path d="M-25 0 Q-20 -12 -12 -20 Q-4 -12 0 0 Q-4 12 -12 20 Q-20 12 -25 0"/>
      <path d="M25 0 Q20 -12 12 -20 Q4 -12 0 0 Q4 12 12 20 Q20 12 25 0"/>
      <circle cx="0" cy="0" r="8"/>
    </g>
  </svg>
);

export const wineLabelDesigns = {
  vintage: VintageLabel,
  modern: ModernLabel,
  elegant: ElegantLabel,
  premium: PremiumLabel,
  rustic: RusticLabel,
  classic: ClassicLabel,
  minimal: MinimalLabel,
  ornate: OrnateLabel,
};