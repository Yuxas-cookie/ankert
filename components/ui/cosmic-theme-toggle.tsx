'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const CosmicThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("relative w-16 h-10 rounded-full bg-muted", className)} />
    )
  }

  const isDark = theme === 'dark'

  return (
    <motion.button
      className={cn(
        "relative w-16 h-10 rounded-full p-0.5 transition-colors duration-500",
        isDark ? "bg-gradient-to-r from-zinc-900 to-zinc-800" : "bg-gradient-to-r from-zinc-200 to-zinc-300",
        "border",
        isDark ? "border-border/20" : "border-border/20",
        "shadow-inner",
        className
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background stars/sun rays */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="stars"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-0.5 h-0.5 bg-primary-foreground rounded-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="rays"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative w-full h-full">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-gradient-to-t from-transparent to-orange-400/30"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-8px)`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle ball */}
      <motion.div
        className={cn(
          "absolute top-0.5 w-9 h-9 rounded-full flex items-center justify-center",
          "shadow-lg",
          isDark 
            ? "bg-gradient-to-br from-zinc-700 to-zinc-800" 
            : "bg-gradient-to-br from-white to-zinc-100"
        )}
        animate={{
          x: isDark ? 24 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-5 h-5 text-[var(--cosmic-solar)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow effect */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full blur-md",
            isDark 
              ? "bg-[var(--cosmic-nebula)]/30" 
              : "bg-[var(--cosmic-solar)]/30"
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Cosmic effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0"
        whileHover={{
          opacity: 1,
        }}
        style={{
          background: isDark
            ? 'radial-gradient(circle at 30% 50%, rgba(94, 92, 230, 0.3), transparent 50%)'
            : 'radial-gradient(circle at 70% 50%, rgba(255, 214, 10, 0.3), transparent 50%)',
        }}
      />
    </motion.button>
  )
}