'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CosmicCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'titanium' | 'glass' | 'nebula' | 'aurora'
  metallic?: boolean
  dynamicIsland?: boolean
}

export const CosmicCard: React.FC<CosmicCardProps> = ({
  children,
  className = '',
  variant = 'titanium',
  metallic = true,
  dynamicIsland = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 3D tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [7.5, -7.5])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7.5, 7.5])
  
  const springConfig = { stiffness: 400, damping: 30 }
  const rotateXSpring = useSpring(rotateX, springConfig)
  const rotateYSpring = useSpring(rotateY, springConfig)
  
  // Metallic shine effect
  const [shinePosition, setShinePosition] = useState({ x: 50, y: 50 })
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    
    mouseX.set(x)
    mouseY.set(y)
    
    // Update shine position
    setShinePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }
  
  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
    setShinePosition({ x: 50, y: 50 })
  }
  
  const variantStyles = {
    titanium: 'bg-gradient-to-br from-card via-muted to-border dark:from-card dark:via-muted dark:to-border border-border/50 text-foreground',
    glass: 'bg-card/50 dark:bg-card/[0.03] backdrop-blur-xl border-border/50 text-foreground',
    nebula: 'bg-gradient-to-br from-[var(--cosmic-nebula)]/20 dark:from-[var(--cosmic-nebula)]/30 via-[var(--cosmic-star)]/10 dark:via-[var(--cosmic-star)]/20 to-[var(--cosmic-galaxy)]/10 dark:to-[var(--cosmic-galaxy)]/20 backdrop-blur-2xl border-border/30 text-foreground',
    aurora: 'bg-gradient-to-br from-[var(--cosmic-aurora)]/10 dark:from-[var(--cosmic-aurora)]/20 via-[var(--cosmic-star)]/10 dark:via-[var(--cosmic-star)]/20 to-[var(--cosmic-nebula)]/10 dark:to-[var(--cosmic-nebula)]/20 backdrop-blur-2xl border-border/30 text-foreground',
  }
  
  const glowEffects = {
    titanium: '',
    glass: 'shadow-[0_0_50px_rgba(var(--foreground-rgb),0.1)]',
    nebula: 'shadow-[0_0_80px_rgba(var(--cosmic-nebula-rgb),0.3),0_0_120px_rgba(var(--cosmic-star-rgb),0.2)]',
    aurora: 'shadow-[0_0_80px_rgba(var(--cosmic-aurora-rgb),0.3),0_0_120px_rgba(var(--cosmic-star-rgb),0.2)]',
  }
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden transition-all duration-700',
        dynamicIsland ? 'dynamic-island' : 'rounded-2xl',
        dynamicIsland && isExpanded && 'dynamic-island-expanded',
        variantStyles[variant],
        isHovered && glowEffects[variant],
        'border',
        className
      )}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => dynamicIsland && setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Titanium texture overlay */}
      {variant === 'titanium' && (
        <div className="absolute inset-0 titanium-texture pointer-events-none" />
      )}
      
      {/* Metallic shine effect */}
      {metallic && isHovered && (
        <motion.div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${shinePosition.x}% ${shinePosition.y}%, rgba(255,255,255,0.8), transparent 40%)`,
            mixBlendMode: 'overlay',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Nebula animation */}
      {variant === 'nebula' && (
        <div className="absolute inset-0 opacity-30 animate-nebula">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--cosmic-nebula)] via-[var(--cosmic-star)] to-[var(--cosmic-galaxy)]" />
        </div>
      )}
      
      {/* Aurora animation */}
      {variant === 'aurora' && (
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'linear-gradient(45deg, var(--cosmic-aurora), var(--cosmic-star), var(--cosmic-nebula))',
              'linear-gradient(45deg, var(--cosmic-star), var(--cosmic-nebula), var(--cosmic-aurora))',
              'linear-gradient(45deg, var(--cosmic-nebula), var(--cosmic-aurora), var(--cosmic-star))',
              'linear-gradient(45deg, var(--cosmic-aurora), var(--cosmic-star), var(--cosmic-nebula))',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
      
      {/* Starfield for cosmic variants */}
      {(variant === 'nebula' || variant === 'aurora') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-foreground/50 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
      
      {/* Content with depth */}
      <div className="relative z-10" style={{ transform: 'translateZ(50px)' }}>
        {children}
      </div>
      
      {/* Reflection layer */}
      {variant === 'titanium' && (
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-transparent to-background/10 pointer-events-none" />
      )}
    </motion.div>
  )
}