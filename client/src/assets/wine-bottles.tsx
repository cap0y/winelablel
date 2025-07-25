// Realistic wine bottle SVG components

export const ClassicBottle = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 120 320" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Classic Bordeaux bottle shape */}
    <defs>
      <linearGradient id="bottle-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1a2f1a" />
        <stop offset="50%" stopColor="#2d4a2d" />
        <stop offset="100%" stopColor="#1a2f1a" />
      </linearGradient>
    </defs>
    
    {/* Bottle body */}
    <path d="M20 60 L20 280 Q20 300 40 300 L80 300 Q100 300 100 280 L100 60 Q100 40 95 35 L85 30 L85 15 Q85 5 75 5 L45 5 Q35 5 35 15 L35 30 L25 35 Q20 40 20 60 Z" 
          fill="url(#bottle-gradient)" stroke="#0f1f0f" strokeWidth="1"/>
    
    {/* Neck */}
    <rect x="42" y="5" width="36" height="30" fill="url(#bottle-gradient)" stroke="#0f1f0f" strokeWidth="1"/>
    
    {/* Cork/top */}
    <rect x="40" y="0" width="40" height="8" fill="#8B4513" stroke="#654321" strokeWidth="1" rx="2"/>
    
    {/* Label area highlight */}
    <rect x="25" y="80" width="70" height="120" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" rx="3"/>
  </svg>
);

export const BurgundyBottle = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 120 320" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Burgundy bottle with sloped shoulders */}
    <defs>
      <linearGradient id="burgundy-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1a2f1a" />
        <stop offset="50%" stopColor="#2d4a2d" />
        <stop offset="100%" stopColor="#1a2f1a" />
      </linearGradient>
    </defs>
    
    {/* Bottle body with curved shoulders */}
    <path d="M25 65 Q25 55 30 50 Q35 45 40 42 L45 40 L45 25 Q45 15 50 10 Q55 5 60 5 Q65 5 70 10 Q75 15 75 25 L75 40 L80 42 Q85 45 90 50 Q95 55 95 65 L95 280 Q95 300 85 300 L35 300 Q25 300 25 280 Z" 
          fill="url(#burgundy-gradient)" stroke="#0f1f0f" strokeWidth="1"/>
    
    {/* Neck */}
    <rect x="45" y="5" width="30" height="25" fill="url(#burgundy-gradient)" stroke="#0f1f0f" strokeWidth="1"/>
    
    {/* Cork */}
    <rect x="43" y="0" width="34" height="8" fill="#8B4513" stroke="#654321" strokeWidth="1" rx="2"/>
    
    {/* Label area */}
    <rect x="30" y="85" width="60" height="110" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" rx="3"/>
  </svg>
);

export const ChampagneBottle = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 120 320" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Champagne bottle - thicker glass */}
    <defs>
      <linearGradient id="champagne-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1a2f1a" />
        <stop offset="50%" stopColor="#2d4a2d" />
        <stop offset="100%" stopColor="#1a2f1a" />
      </linearGradient>
    </defs>
    
    {/* Thicker bottle body */}
    <path d="M22 70 Q22 60 27 55 Q32 50 37 47 L42 45 L42 30 Q42 20 47 15 Q52 10 60 10 Q68 10 73 15 Q78 20 78 30 L78 45 L83 47 Q88 50 93 55 Q98 60 98 70 L98 285 Q98 305 88 305 L32 305 Q22 305 22 285 Z" 
          fill="url(#champagne-gradient)" stroke="#0f1f0f" strokeWidth="2"/>
    
    {/* Wider neck */}
    <rect x="42" y="10" width="36" height="25" fill="url(#champagne-gradient)" stroke="#0f1f0f" strokeWidth="2"/>
    
    {/* Wire cage */}
    <g stroke="#C0C0C0" strokeWidth="1" fill="none">
      <path d="M40 8 L42 15 L78 15 L80 8"/>
      <path d="M42 15 L48 25"/>
      <path d="M78 15 L72 25"/>
    </g>
    
    {/* Cork */}
    <rect x="38" y="0" width="44" height="10" fill="#8B4513" stroke="#654321" strokeWidth="1" rx="3"/>
    
    {/* Label area */}
    <rect x="27" y="90" width="66" height="120" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" rx="3"/>
  </svg>
);

export const RhineBottle = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 120 340" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Rhine/Hock bottle - tall and slender */}
    <defs>
      <linearGradient id="rhine-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8B4513" />
        <stop offset="50%" stopColor="#CD853F" />
        <stop offset="100%" stopColor="#8B4513" />
      </linearGradient>
    </defs>
    
    {/* Tall slender body */}
    <rect x="35" y="60" width="50" height="260" fill="url(#rhine-gradient)" stroke="#654321" strokeWidth="1" rx="8"/>
    
    {/* Long neck */}
    <rect x="50" y="5" width="20" height="60" fill="url(#rhine-gradient)" stroke="#654321" strokeWidth="1"/>
    
    {/* Cork */}
    <rect x="48" y="0" width="24" height="8" fill="#8B4513" stroke="#654321" strokeWidth="1" rx="2"/>
    
    {/* Label area */}
    <rect x="40" y="120" width="40" height="140" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" rx="3"/>
  </svg>
);

export const SparklingBottle = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 120 320" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Modern sparkling wine bottle */}
    <defs>
      <linearGradient id="sparkling-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f0f0f0" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f0f0f0" />
      </linearGradient>
    </defs>
    
    {/* Clear bottle body */}
    <path d="M24 65 Q24 55 29 50 Q34 45 39 42 L44 40 L44 25 Q44 15 49 10 Q54 5 60 5 Q66 5 71 10 Q76 15 76 25 L76 40 L81 42 Q86 45 91 50 Q96 55 96 65 L96 280 Q96 300 86 300 L34 300 Q24 300 24 280 Z" 
          fill="url(#sparkling-gradient)" stroke="#d0d0d0" strokeWidth="1"/>
    
    {/* Neck */}
    <rect x="44" y="5" width="32" height="25" fill="url(#sparkling-gradient)" stroke="#d0d0d0" strokeWidth="1"/>
    
    {/* Foil cap */}
    <rect x="42" y="0" width="36" height="12" fill="#FFD700" stroke="#FFA500" strokeWidth="1" rx="3"/>
    
    {/* Label area */}
    <rect x="29" y="85" width="62" height="115" fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" rx="3"/>
  </svg>
);

export const PremiumBottle = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 120 320" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Premium bottle with elegant design */}
    <defs>
      <linearGradient id="premium-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1a1a2e" />
        <stop offset="50%" stopColor="#16213e" />
        <stop offset="100%" stopColor="#1a1a2e" />
      </linearGradient>
    </defs>
    
    {/* Elegant bottle shape */}
    <path d="M22 62 Q22 52 28 47 Q34 42 40 40 L43 38 L43 28 Q43 18 48 13 Q53 8 60 8 Q67 8 72 13 Q77 18 77 28 L77 38 L80 40 Q86 42 92 47 Q98 52 98 62 L98 285 Q98 305 88 305 L32 305 Q22 305 22 285 Z" 
          fill="url(#premium-gradient)" stroke="#0a0a1a" strokeWidth="1"/>
    
    {/* Neck with detail */}
    <rect x="43" y="8" width="34" height="25" fill="url(#premium-gradient)" stroke="#0a0a1a" strokeWidth="1"/>
    <rect x="45" y="25" width="30" height="3" fill="#2a2a3e" />
    
    {/* Luxury cork */}
    <rect x="41" y="0" width="38" height="10" fill="#4B0082" stroke="#2F0052" strokeWidth="1" rx="3"/>
    
    {/* Premium label area */}
    <rect x="27" y="80" width="66" height="125" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" rx="4"/>
  </svg>
);

export const wineBottleComponents = {
  classic: ClassicBottle,
  burgundy: BurgundyBottle,
  champagne: ChampagneBottle,
  bordeaux: ClassicBottle, // Same as classic
  rhone: RhineBottle,
  sparkling: SparklingBottle,
  premium: PremiumBottle,
};