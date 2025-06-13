// 🚀 Futuristic Design System
// 未来的なデザインシステム - 2025年最先端UI

export const futuristicTheme = {
  // Neural Color Palette - AIインスパイアードカラー
  colors: {
    primary: {
      50: 'oklch(0.95 0.05 250)',
      100: 'oklch(0.90 0.10 250)',
      200: 'oklch(0.80 0.15 250)',
      300: 'oklch(0.70 0.20 250)',
      400: 'oklch(0.60 0.25 250)',
      500: 'oklch(0.50 0.30 250)', // Main
      600: 'oklch(0.45 0.28 250)',
      700: 'oklch(0.40 0.26 250)',
      800: 'oklch(0.35 0.24 250)',
      900: 'oklch(0.30 0.22 250)',
      gradient: 'linear-gradient(135deg, oklch(0.60 0.30 250), oklch(0.50 0.35 280))',
    },
    accent: {
      neon: 'oklch(0.75 0.40 180)', // Cyan neon
      plasma: 'oklch(0.70 0.35 300)', // Purple plasma
      quantum: 'oklch(0.65 0.30 120)', // Green quantum
      hologram: 'oklch(0.80 0.25 60)', // Orange hologram
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.10)',
      heavy: 'rgba(255, 255, 255, 0.15)',
      blur: 'rgba(255, 255, 255, 0.02)',
    },
    dark: {
      void: '#0a0a0f',
      deep: '#0f0f1a',
      surface: '#151525',
      elevated: '#1a1a2e',
    }
  },
  
  // Motion Design - 流体アニメーション
  motion: {
    spring: {
      stiff: { stiffness: 500, damping: 30 },
      medium: { stiffness: 300, damping: 20 },
      soft: { stiffness: 150, damping: 15 },
    },
    easing: {
      smooth: [0.32, 0.72, 0, 1],
      sharp: [0.12, 0.8, 0.32, 1],
      bounce: [0.68, -0.55, 0.265, 1.55],
    },
    duration: {
      instant: 150,
      fast: 300,
      normal: 500,
      slow: 800,
      crawl: 1200,
    }
  },
  
  // Spatial Design - 空間的デザイン
  space: {
    micro: '0.125rem',
    tiny: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
    huge: '4rem',
    massive: '8rem',
  },
  
  // Typography - ニューロモーフィックタイポグラフィ
  typography: {
    display: {
      size: 'clamp(3rem, 8vw, 6rem)',
      weight: 700,
      letterSpacing: '-0.04em',
      lineHeight: 0.95,
    },
    heading: {
      size: 'clamp(2rem, 5vw, 3.5rem)',
      weight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
    },
    body: {
      size: 'clamp(1rem, 1.5vw, 1.125rem)',
      weight: 400,
      letterSpacing: '0',
      lineHeight: 1.6,
    },
    code: {
      family: '"JetBrains Mono", "Fira Code", monospace',
      size: '0.875rem',
      weight: 500,
    }
  },
  
  // Effects - 特殊効果
  effects: {
    glow: {
      subtle: '0 0 20px rgba(124, 58, 237, 0.3)',
      medium: '0 0 40px rgba(124, 58, 237, 0.5)',
      intense: '0 0 60px rgba(124, 58, 237, 0.7)',
    },
    hologram: {
      filter: 'hue-rotate(var(--hue-rotate, 0deg)) saturate(1.5)',
      animation: 'hologram 10s linear infinite',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    neural: {
      pattern: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(124, 58, 237, 0.15), transparent 50%)',
    }
  },
  
  // Layout - 流動的レイアウト
  layout: {
    maxWidth: {
      xs: '20rem',
      sm: '30rem',
      md: '48rem',
      lg: '64rem',
      xl: '80rem',
      full: '100%',
    },
    grid: {
      columns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
      gap: 'clamp(1rem, 3vw, 2rem)',
    },
    radius: {
      none: '0',
      small: '0.5rem',
      medium: '1rem',
      large: '1.5rem',
      huge: '2rem',
      round: '9999px',
    }
  }
}

// Utility functions
export const glowEffect = (color: string, intensity: number = 1) => ({
  boxShadow: `
    0 0 ${20 * intensity}px ${color}40,
    0 0 ${40 * intensity}px ${color}20,
    0 0 ${60 * intensity}px ${color}10,
    inset 0 0 ${20 * intensity}px ${color}10
  `,
})

export const generateGradient = (angle: number, colors: string[]) => 
  `linear-gradient(${angle}deg, ${colors.join(', ')})`

export const neuralGlow = (x: number, y: number) => ({
  '--mouse-x': `${x}%`,
  '--mouse-y': `${y}%`,
} as React.CSSProperties)