'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Sparkles,
  Zap,
  Shield,
  Globe,
  Brain,
  Layers,
  Activity,
  Command,
  ChevronRight,
  Orbit,
  Atom,
  Monitor,
  Smartphone,
  BarChart3,
  TrendingUp
} from "lucide-react"
import { CosmicButton } from "@/components/ui/cosmic-button"
import { CosmicCard } from "@/components/ui/cosmic-card"

export default function Home() {
  const [time, setTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  
  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 500], [0, -100])
  const y2 = useTransform(scrollY, [0, 500], [0, -200])
  const scale = useTransform(scrollY, [0, 500], [1, 0.8])
  
  useEffect(() => {
    setMounted(true)
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const features = [
    {
      icon: Brain,
      title: "Neural Intelligence",
      description: "次世代AIが回答パターンを深層解析",
      variant: "nebula" as const,
    },
    {
      icon: Activity,
      title: "Quantum Analytics",
      description: "量子コンピューティング級の処理速度",
      variant: "aurora" as const,
    },
    {
      icon: Shield,
      title: "Titanium Security",
      description: "軍事レベルの暗号化技術",
      variant: "titanium" as const,
    },
    {
      icon: Orbit,
      title: "Orbital Sync",
      description: "衛星通信並みのリアルタイム同期",
      variant: "glass" as const,
    },
    {
      icon: Layers,
      title: "Dimensional Design",
      description: "多次元的なカスタマイズ性",
      variant: "nebula" as const,
    },
    {
      icon: Atom,
      title: "Atomic Performance",
      description: "分子レベルの最適化",
      variant: "aurora" as const,
    }
  ]
  
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-500">
      {/* Deep space background */}
      <div className="fixed inset-0 bg-cosmic dark:bg-cosmic" />
      
      {/* Static gradient background */}
      <div className="fixed inset-0">
        {/* Primary gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--cosmic-nebula)]/8 dark:from-[var(--cosmic-nebula)]/15 via-transparent to-[var(--cosmic-galaxy)]/4 dark:to-[var(--cosmic-galaxy)]/8" />
        
        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--cosmic-star)]/3 dark:via-[var(--cosmic-star)]/6 to-transparent" />
        
        {/* Accent gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-bl from-[var(--cosmic-aurora)]/2 dark:from-[var(--cosmic-aurora)]/4 via-transparent to-[var(--cosmic-solar)]/2 dark:to-[var(--cosmic-solar)]/3" />
      </div>
      
      {/* Static starfield */}
      <div className="fixed inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => {
          // Use deterministic values based on index to avoid hydration mismatch
          const size = ((i * 7) % 2) + 1
          const left = ((i * 13) % 100)
          const top = ((i * 17) % 100)
          const colorIndex = i % 3
          const colors = ['var(--cosmic-nebula)', 'var(--cosmic-star)', 'var(--cosmic-aurora)']
          const opacity = ((i * 3) % 5 + 2) / 10 // 0.2 to 0.6
          
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${top}%`,
                backgroundColor: colors[colorIndex],
                opacity: opacity,
              }}
            />
          )
        })}
      </div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div 
          className="relative z-10 text-center max-w-6xl mx-auto"
          style={{ scale }}
        >
          {/* Dynamic Island Time Display */}
          <motion.div 
            className="inline-block mb-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          >
            <CosmicCard variant="glass" dynamicIsland className="px-6 py-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-mono font-medium text-foreground">
                  {mounted && time ? time.toLocaleTimeString('ja-JP', { hour12: false }) : '00:00:00'}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="text-foreground/80">Tokyo, Japan</span>
              </div>
            </CosmicCard>
          </motion.div>
          
          {/* Main Title with Titanium Effect */}
          <motion.h1 
            className="mb-6 font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.span 
              className="block text-7xl sm:text-8xl md:text-9xl font-bold text-foreground pb-2"
              style={{ 
                y: y1,
                textShadow: '0 4px 20px rgba(var(--foreground-rgb), 0.3)',
              }}
            >
              Survey
            </motion.span>
            <motion.span 
              className="block text-6xl sm:text-7xl md:text-8xl mt-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--cosmic-nebula)] via-[var(--cosmic-star)] to-[var(--cosmic-aurora)]"
              style={{ 
                y: y2,
                filter: 'drop-shadow(0 4px 20px rgba(94, 92, 230, 0.5))',
              }}
            >
              Universe
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="mb-12 text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            宇宙規模のインサイト。原子レベルの精度。
            <br className="hidden sm:inline" />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--cosmic-solar)] to-[var(--cosmic-galaxy)]" style={{ filter: 'drop-shadow(0 2px 10px rgba(255, 214, 10, 0.4))' }}>
              次元を超えた
            </span>
            フィードバック体験
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link href="/register">
              <CosmicButton variant="cosmic" size="lg" icon={<Zap className="w-5 h-5" />}>
                Launch Experience
              </CosmicButton>
            </Link>
            <Link href="/surveys">
              <CosmicButton variant="glass" size="lg" icon={<Command className="w-5 h-5" />}>
                View Surveys
              </CosmicButton>
            </Link>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features Grid */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-foreground" style={{ textShadow: '0 4px 30px rgba(94, 92, 230, 0.3)' }}>
                Cosmic Features
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              iPhone 16 Proの技術とインスピレーションを受けた、宇宙レベルの機能群
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <CosmicCard variant={feature.variant} className="h-full p-8">
                  <feature.icon className="w-12 h-12 mb-4 text-foreground" />
                  <h3 className="text-2xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CosmicCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section with Dynamic Island */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <CosmicCard variant="titanium" className="p-16 relative overflow-hidden">
              {/* Animated background mesh */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'conic-gradient(from var(--angle) at 50% 50%, var(--cosmic-nebula), var(--cosmic-star), var(--cosmic-aurora), var(--cosmic-solar), var(--cosmic-galaxy), var(--cosmic-nebula))',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    '--angle': ['0deg', '360deg'],
                  } as any}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>
              
              <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                  Begin Your Journey
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  宇宙の果てまで広がる可能性。今すぐ体験を開始しましょう。
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <CosmicButton variant="nebula" size="lg" icon={<Sparkles className="w-5 h-5" />}>
                      Start Free Trial
                    </CosmicButton>
                  </Link>
                  <Link href="/surveys">
                    <CosmicButton variant="titanium" size="lg" icon={<ChevronRight className="w-5 h-5" />}>
                      Explore Surveys
                    </CosmicButton>
                  </Link>
                </div>
              </div>
            </CosmicCard>
          </motion.div>
        </div>
      </section>
    </div>
  )
}