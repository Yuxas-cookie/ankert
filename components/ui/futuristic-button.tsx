'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FuturisticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'neural' | 'quantum'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  loading?: boolean
  pulse?: boolean
}

export const FuturisticButton: React.FC<FuturisticButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  pulse = false,
  disabled,
  ...props
}) => {
  // Separate HTML props from motion props to avoid type conflicts
  const { onAnimationStart, onDragStart, onDragEnd, onDrag, ...htmlProps } = props as any
  const [isActive, setIsActive] = useState(false)
  
  const variants = {
    primary: 'bg-gradient-to-r from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] text-primary-foreground border-transparent shadow-[0_0_30px_rgba(94,92,230,0.5)]',
    secondary: 'bg-card/80 backdrop-blur-lg text-foreground border-border/50 hover:bg-card/90',
    ghost: 'bg-transparent text-foreground border-transparent hover:bg-accent hover:text-accent-foreground',
    neural: 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-primary-foreground border-purple-500/30',
    quantum: 'bg-gradient-to-r from-green-600/80 to-emerald-600/80 text-primary-foreground border-green-500/30',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const glowColors = {
    primary: 'var(--cosmic-nebula-rgb)',
    secondary: 'var(--foreground-rgb)',
    ghost: 'transparent',
    neural: 'var(--cosmic-nebula-rgb)',
    quantum: 'var(--cosmic-aurora-rgb)',
  }
  
  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300',
        'border backdrop-blur-sm overflow-hidden group',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onMouseLeave={() => setIsActive(false)}
      disabled={disabled || loading}
      style={{
        boxShadow: isActive
          ? `0 0 20px rgba(${glowColors[variant]}, 0.5), inset 0 0 20px rgba(${glowColors[variant]}, 0.5)`
          : variant === 'primary' ? '0 0 30px rgba(94, 92, 230, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
      {...htmlProps}
    >
      {/* Background animation layers */}
      <div className="absolute inset-0">
        {/* Gradient animation */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: variant === 'neural' 
              ? 'linear-gradient(45deg, var(--cosmic-nebula), var(--cosmic-galaxy), var(--cosmic-nebula))'
              : variant === 'quantum'
              ? 'linear-gradient(45deg, var(--cosmic-aurora), var(--cosmic-star), var(--cosmic-aurora))'
              : variant === 'primary'
              ? 'linear-gradient(45deg, var(--cosmic-nebula), var(--cosmic-star), var(--cosmic-nebula))'
              : 'none',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Pulse effect */}
        {pulse && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{
              boxShadow: [
                `0 0 0 0 ${glowColors[variant]}`,
                `0 0 0 10px transparent`,
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
        
        {/* Ripple effect on click */}
        {isActive && (
          <motion.span
            className="absolute inset-0 rounded-xl bg-foreground/10"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
          animate={{
            translateX: ['0%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 1,
          }}
        />
      </div>
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <motion.div
            className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : icon}
        {children}
      </span>
      
      {/* Edge glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-r from-[var(--cosmic-nebula)] via-[var(--cosmic-star)] to-[var(--cosmic-galaxy)] blur-sm" />
      </div>
    </motion.button>
  )
}