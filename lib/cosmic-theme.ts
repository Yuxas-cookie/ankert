// 🌌 Cosmic Design System - Apple iPhone 16 Pro Inspired
// 宇宙的なデザインシステム

export const cosmicTheme = {
  // Titanium & Space Colors
  colors: {
    titanium: {
      light: '#E8E8ED',
      natural: '#B4B4B8',
      dark: '#48484A',
      black: '#1C1C1E',
    },
    cosmic: {
      deepSpace: '#000000',
      nebulaPurple: '#5E5CE6',
      starBlue: '#0A84FF',
      galaxyPink: '#FF375F',
      auroraGreen: '#30D158',
      solarGold: '#FFD60A',
      cometSilver: '#C7C7CC',
    },
    glass: {
      ultraThin: 'rgba(255, 255, 255, 0.001)',
      thin: 'rgba(255, 255, 255, 0.01)',
      light: 'rgba(255, 255, 255, 0.03)',
      medium: 'rgba(255, 255, 255, 0.05)',
      thick: 'rgba(255, 255, 255, 0.08)',
    },
    glow: {
      nebula: 'radial-gradient(ellipse at center, rgba(94, 92, 230, 0.4), transparent 70%)',
      aurora: 'radial-gradient(ellipse at center, rgba(48, 209, 88, 0.3), transparent 70%)',
      solar: 'radial-gradient(ellipse at center, rgba(255, 214, 10, 0.3), transparent 70%)',
    }
  },
  
  // Materials & Textures
  materials: {
    titanium: {
      background: 'linear-gradient(135deg, #B4B4B8 0%, #E8E8ED 50%, #B4B4B8 100%)',
      texture: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cfilter id="titanium"%3E%3CfeTurbulence baseFrequency="0.9" numOctaves="4" /%3E%3CfeColorMatrix values="0 0 0 0 0.7 0 0 0 0 0.7 0 0 0 0 0.74 0 0 0 1 0"/%3E%3C/filter%3E%3C/defs%3E%3Crect width="100" height="100" filter="url(%23titanium)" opacity="0.05"/%3E%3C/svg%3E")',
    },
    glass: {
      frosted: {
        backdropFilter: 'blur(40px) saturate(180%)',
        background: 'rgba(255, 255, 255, 0.01)',
        border: '0.5px solid rgba(255, 255, 255, 0.08)',
      },
      clear: {
        backdropFilter: 'blur(20px) saturate(150%)',
        background: 'rgba(255, 255, 255, 0.001)',
        border: '0.5px solid rgba(255, 255, 255, 0.05)',
      }
    },
    mesh: {
      gradient: 'conic-gradient(from 180deg at 50% 50%, #5E5CE6 0deg, #0A84FF 60deg, #30D158 120deg, #FFD60A 180deg, #FF375F 240deg, #5E5CE6 360deg)',
      animated: 'conic-gradient(from var(--angle, 0deg) at 50% 50%, #5E5CE6 0deg, #0A84FF 60deg, #30D158 120deg, #FFD60A 180deg, #FF375F 240deg, #5E5CE6 360deg)',
    }
  },
  
  // Spatial Effects
  effects: {
    dynamicIsland: {
      idle: 'rounded-[28px] scale-100',
      expanded: 'rounded-[48px] scale-110',
      morph: 'transition-all duration-700 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
    },
    cosmicGlow: {
      small: '0 0 30px rgba(94, 92, 230, 0.3), 0 0 60px rgba(10, 132, 255, 0.2)',
      medium: '0 0 60px rgba(94, 92, 230, 0.4), 0 0 120px rgba(10, 132, 255, 0.3)',
      large: '0 0 120px rgba(94, 92, 230, 0.5), 0 0 200px rgba(10, 132, 255, 0.4)',
    },
    starField: {
      near: 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent)',
      far: 'radial-gradient(1px 1px at 10% 10%, white, transparent), radial-gradient(1px 1px at 80% 80%, white, transparent), radial-gradient(0.5px 0.5px at 50% 50%, white, transparent)',
    },
    metallic: {
      shine: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.7) 50%, transparent 60%)',
      reflection: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)',
    }
  },
  
  // Motion
  motion: {
    cosmic: {
      float: 'float 20s ease-in-out infinite',
      orbit: 'orbit 30s linear infinite',
      pulse: 'pulse 4s ease-in-out infinite',
      shimmer: 'shimmer 3s ease-in-out infinite',
    },
    spring: {
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.23, 1, 0.32, 1)',
      sharp: 'cubic-bezier(0.12, 0.8, 0.32, 1)',
    }
  }
}

// Cosmic Animations
export const cosmicAnimations = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    33% { transform: translateY(-20px); }
    66% { transform: translateY(10px); }
  }
  
  @keyframes orbit {
    0% { transform: translateX(150px) translateY(0); }
    25% { transform: translateX(0) translateY(-150px); }
    50% { transform: translateX(-150px) translateY(0); }
    75% { transform: translateX(0) translateY(150px); }
    100% { transform: translateX(150px) translateY(0); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes nebula {
    0%, 100% { 
      filter: hue-rotate(0deg) brightness(1) contrast(1);
      transform: scale(1);
    }
    25% { 
      filter: hue-rotate(30deg) brightness(1.1) contrast(1.1);
      transform: scale(1.05);
    }
    50% { 
      filter: hue-rotate(-30deg) brightness(0.9) contrast(1.2);
      transform: scale(0.95);
    }
    75% { 
      filter: hue-rotate(60deg) brightness(1.2) contrast(0.9);
      transform: scale(1.02);
    }
  }
  
  @keyframes starTwinkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1); }
  }
`