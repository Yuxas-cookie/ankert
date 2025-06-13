'use client'

import React, { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CosmicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'titanium' | 'cosmic' | 'nebula' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  loading?: boolean
  haptic?: boolean
}

export const CosmicButton: React.FC<CosmicButtonProps> = ({
  children,
  className = '',
  variant = 'titanium',
  size = 'md',
  icon,
  loading = false,
  haptic = true,
  disabled,
  ...props
}) => {
  // Separate HTML props from motion props to avoid type conflicts
  const { onAnimationStart, onDragStart, onDragEnd, onDrag, ...htmlProps } = props as any
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isPressed, setIsPressed] = useState(false)
  
  // 3D press effect
  const y = useMotionValue(0)
  const scale = useTransform(y, [0, 2], [1, 0.98])
  
  const variants = {
    titanium: 'bg-gradient-to-b from-muted to-border dark:from-muted dark:to-border text-foreground font-medium border-border/50 shadow-[0_1px_3px_rgba(var(--foreground-rgb),0.1),inset_0_1px_0_rgba(var(--foreground-rgb),0.1)]',
    cosmic: 'bg-gradient-to-r from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] text-primary-foreground font-medium border-[var(--cosmic-nebula)]/50 shadow-[0_0_30px_rgba(var(--cosmic-nebula-rgb),0.5)]',
    nebula: 'bg-gradient-to-r from-[var(--cosmic-galaxy)] via-[var(--cosmic-nebula)] to-[var(--cosmic-star)] text-primary-foreground font-medium border-border/30 shadow-[0_0_40px_rgba(var(--cosmic-nebula-rgb),0.4)]',
    glass: 'bg-card/70 dark:bg-card/[0.08] backdrop-blur-xl text-foreground font-medium border-border/50 shadow-[0_0_20px_rgba(var(--foreground-rgb),0.1)]',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const handlePress = () => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
    setIsPressed(true)
  }
  
  const handleRelease = () => {
    setIsPressed(false)
  }
  
  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200',
        'border backdrop-blur-sm overflow-hidden',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      style={{ scale, y }}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={handlePress}
      onTouchEnd={handleRelease}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      disabled={disabled || loading}
      {...htmlProps}
    >
      {/* Titanium texture */}
      {variant === 'titanium' && (
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/20 dark:via-foreground/10 to-transparent" />
          <div className="absolute inset-0 titanium-texture" />
        </div>
      )}
      
      {/* Cosmic gradient animation */}
      {variant === 'cosmic' && (
        <motion.div
          className="absolute inset-0 opacity-50"
          animate={{
            background: [
              'linear-gradient(45deg, var(--cosmic-nebula), var(--cosmic-star))',
              'linear-gradient(45deg, var(--cosmic-star), var(--cosmic-aurora))',
              'linear-gradient(45deg, var(--cosmic-aurora), var(--cosmic-nebula))',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
      
      {/* Nebula animation */}
      {variant === 'nebula' && (
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-70"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundImage: 'conic-gradient(from 180deg at 50% 50%, var(--cosmic-galaxy), var(--cosmic-nebula), var(--cosmic-star), var(--cosmic-aurora), var(--cosmic-solar), var(--cosmic-galaxy))',
              backgroundSize: '200% 200%',
            }}
          />
        </div>
      )}
      
      {/* Press effect overlay */}
      <motion.div
        className="absolute inset-0 bg-foreground/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPressed ? 0.1 : 0 }}
        transition={{ duration: 0.1 }}
      />
      
      {/* Metallic highlight */}
      {variant === 'titanium' && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)',
            mixBlendMode: 'overlay',
          }}
          animate={isPressed ? {} : {
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
          }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <motion.div
            className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : icon}
        {children}
      </span>
      
      {/* Dynamic Island morph effect */}
      {variant === 'cosmic' && (
        <motion.div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] opacity-0 blur-xl"
          animate={{
            opacity: isPressed ? 0.8 : 0,
            scale: isPressed ? 1.1 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  )
}