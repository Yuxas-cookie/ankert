'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FuturisticCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'glass' | 'neural' | 'hologram' | 'quantum'
  interactive?: boolean
  glow?: boolean
}

export const FuturisticCard: React.FC<FuturisticCardProps> = ({
  children,
  className = '',
  variant = 'glass',
  interactive = true,
  glow = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  // Mouse tracking for neural effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // 3D rotation based on mouse position
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5])
  
  // Spring animation for smooth movement
  const springConfig = { stiffness: 300, damping: 20 }
  const rotateXSpring = useSpring(rotateX, springConfig)
  const rotateYSpring = useSpring(rotateY, springConfig)
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    
    mouseX.set(x)
    mouseY.set(y)
  }
  
  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }
  
  const variantStyles = {
    glass: 'bg-card/50 dark:bg-white/5 backdrop-blur-xl border border-border/50',
    neural: 'bg-gradient-to-br from-[var(--cosmic-nebula)]/20 to-[var(--cosmic-star)]/20 backdrop-blur-xl border border-[var(--cosmic-nebula)]/30',
    hologram: 'bg-gradient-to-br from-[var(--cosmic-aurora)]/10 via-[var(--cosmic-nebula)]/10 to-[var(--cosmic-galaxy)]/10 backdrop-blur-xl border border-border/50',
    quantum: 'bg-background/50 dark:bg-black/50 backdrop-blur-xl border border-[var(--cosmic-aurora)]/30',
  }
  
  const glowStyles = {
    glass: 'hover:shadow-[0_0_30px_rgba(var(--foreground-rgb),0.1)]',
    neural: 'hover:shadow-[0_0_40px_rgba(var(--cosmic-nebula-rgb),0.3)]',
    hologram: 'hover:shadow-[0_0_50px_rgba(var(--cosmic-star-rgb),0.4)]',
    quantum: 'hover:shadow-[0_0_35px_rgba(var(--cosmic-aurora-rgb),0.3)]',
  }
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 transition-all duration-500',
        variantStyles[variant],
        glow && glowStyles[variant],
        className
      )}
      style={{
        rotateX: interactive ? rotateXSpring : 0,
        rotateY: interactive ? rotateYSpring : 0,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={interactive ? { scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Background Effects */}
      {variant === 'neural' && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${(mouseX.get() + 0.5) * 100}% ${(mouseY.get() + 0.5) * 100}%, rgba(var(--cosmic-nebula-rgb),0.4), transparent 50%)`,
          }}
        />
      )}
      
      {variant === 'hologram' && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--cosmic-aurora)] via-[var(--cosmic-nebula)] to-[var(--cosmic-galaxy)] animate-gradient-x" />
        </div>
      )}
      
      {variant === 'quantum' && isHovered && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--cosmic-aurora)]/10 to-[var(--cosmic-star)]/10 animate-pulse" />
        </div>
      )}
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/5 dark:bg-grid-white/5" />
      
      {/* Content */}
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent -translate-x-full"
        animate={isHovered ? { translateX: '200%' } : {}}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}