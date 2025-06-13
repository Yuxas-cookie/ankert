'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LoginForm } from '@/components/auth/LoginForm'
import { FuturisticCard } from '@/components/ui/futuristic-card'
import { 
  BarChart3, 
  Sparkles, 
  Lock,
  User,
  ArrowRight
} from 'lucide-react'

export default function LoginPage() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }
  
  return (
    <div 
      className="relative min-h-screen flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(var(--cosmic-nebula-rgb), 0.15), transparent 50%)`,
        }}
      />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => {
          // Use deterministic values based on index
          const startX = ((i * 37) % 100)
          const startY = ((i * 41) % 100)
          const endX = ((i * 53) % 100)
          const endY = ((i * 59) % 100)
          const duration = ((i * 7) % 20) + 10
          const opacity = ((i * 3) % 5) / 10 + 0.3
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[var(--cosmic-star)] rounded-full"
              initial={{
                x: `${startX}%`,
                y: `${startY}%`,
              }}
              animate={{
                x: `${endX}%`,
                y: `${endY}%`,
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                filter: 'blur(1px)',
                opacity: opacity,
              }}
            />
          )
        })}
      </div>
      
      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Link href="/" className="group relative">
            <motion.div
              className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] p-0.5"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-background">
                <BarChart3 className="h-10 w-10 text-foreground" />
              </div>
            </motion.div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] opacity-50 blur-xl group-hover:opacity-75 transition-opacity" />
          </Link>
        </motion.div>
        
        {/* Welcome Text */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cosmic-nebula)] to-[var(--cosmic-star)]">Welcome Back</span>
          </h1>
          <p className="text-muted-foreground">未来のアンケート体験へ</p>
        </motion.div>
        
        {/* Login Card */}
        <FuturisticCard variant="glass" className="p-8">
          <div className="space-y-6">
            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Lock className="w-4 h-4 text-[var(--cosmic-aurora)]" />
                <span>安全な認証</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Sparkles className="w-4 h-4 text-[var(--cosmic-solar)]" />
                <span>AI機能搭載</span>
              </motion.div>
            </div>
            
            {/* Login Form */}
            <LoginForm />
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">または</span>
              </div>
            </div>
            
            {/* Register Link */}
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Link 
                href="/register" 
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                アカウントをお持ちでない方は
                <span className="text-primary group-hover:text-primary/80">新規登録</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </FuturisticCard>
        
        {/* Bottom Text */}
        <motion.p
          className="mt-8 text-center text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          By logging in, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:text-primary/80">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:text-primary/80">
            Privacy Policy
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}