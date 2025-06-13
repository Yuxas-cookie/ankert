'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { FuturisticCard } from '@/components/ui/futuristic-card'
import { 
  BarChart3, 
  Sparkles, 
  Shield,
  Zap,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'

export default function RegisterPage() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }
  
  const benefits = [
    { icon: Zap, text: "AIパワードアナリティクス", color: "text-[var(--cosmic-solar)]" },
    { icon: Shield, text: "エンタープライズセキュリティ", color: "text-[var(--cosmic-aurora)]" },
    { icon: Sparkles, text: "無制限のアンケート作成", color: "text-[var(--cosmic-nebula)]" },
  ]
  
  return (
    <div 
      className="relative min-h-screen flex items-center justify-center py-12 bg-background"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(var(--cosmic-nebula-rgb), 0.15), transparent 50%),
            radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(var(--cosmic-star-rgb), 0.1), transparent 50%)
          `,
          opacity: 0.3,
        }}
      />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-grid-white/5 dark:bg-grid-white/5 animate-pulse" style={{ animationDuration: '8s' }} />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[var(--cosmic-nebula)]/20 to-[var(--cosmic-galaxy)]/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-[var(--cosmic-star)]/20 to-[var(--cosmic-aurora)]/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      <motion.div
        className="relative z-10 w-full max-w-5xl px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <motion.div
            className="hidden lg:block space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div>
              <h2 className="text-5xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cosmic-nebula)] via-[var(--cosmic-galaxy)] to-[var(--cosmic-star)]">Join the Future</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                次世代のフィードバックプラットフォームで、
                ビジネスを加速させましょう
              </p>
            </div>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  className="flex items-center gap-4 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  <div className="relative">
                    <div className={`p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border ${benefit.color}`}>
                      <benefit.icon className="w-6 h-6" />
                    </div>
                    <div className={`absolute inset-0 rounded-xl ${benefit.color} opacity-30 blur-xl group-hover:opacity-50 transition-opacity`} />
                  </div>
                  <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                    {benefit.text}
                  </span>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              className="pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--cosmic-aurora)]" />
                  <span>30日間無料</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--cosmic-aurora)]" />
                  <span>クレカ不要</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[var(--cosmic-aurora)]" />
                  <span>即時開始</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right Side - Register Form */}
          <motion.div
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
                  className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-galaxy)] p-0.5"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-background">
                    <BarChart3 className="h-10 w-10 text-foreground" />
                  </div>
                </motion.div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-galaxy)] opacity-50 blur-xl group-hover:opacity-75 transition-opacity" />
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cosmic-nebula)] to-[var(--cosmic-star)]">Create Account</span>
              </h1>
              <p className="text-muted-foreground">革新的な旅を始めましょう</p>
            </motion.div>
            
            {/* Register Card */}
            <FuturisticCard variant="neural" className="p-8">
              <RegisterForm />
              
              {/* Login Link */}
              <motion.div
                className="mt-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <Link 
                  href="/login" 
                  className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                  すでにアカウントをお持ちの方は
                  <span className="text-accent group-hover:text-accent/80">ログイン</span>
                </Link>
              </motion.div>
            </FuturisticCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}