'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { FuturisticButton } from '@/components/ui/futuristic-button'
import { CosmicThemeToggle } from '@/components/ui/cosmic-theme-toggle'
import { 
  Menu, 
  X,
  Activity,
  Layers,
  BarChart3,
  User,
  LogOut,
  Settings,
  Command,
  Sparkles
} from 'lucide-react'
import { Container } from './Container'

export const FuturisticHeader: React.FC = () => {
  const { user, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const navItems = [
    { name: 'ダッシュボード', href: '/dashboard', icon: Activity },
    { name: 'アンケート', href: '/surveys', icon: Layers },
    { name: '分析', href: '/analytics', icon: BarChart3 }
  ]
  
  return (
    <motion.header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/70 backdrop-blur-xl border-b border-border/50' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Container size="full">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-3">
            <motion.div
              className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] p-0.5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background/95">
                <BarChart3 className="h-5 w-5 text-foreground" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] opacity-50 blur-md group-hover:opacity-75 transition-opacity" />
            </motion.div>
            <span className="hidden sm:inline-block text-xl font-bold text-foreground">
              Survey <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cosmic-nebula)] to-[var(--cosmic-star)]">App</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className="group relative px-4 py-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-accent"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </Link>
            ))}
          </nav>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <CosmicThemeToggle />
            
            {/* User Menu / Auth Buttons */}
            {user ? (
              <div className="relative">
                <motion.button
                  className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-[var(--cosmic-nebula)] to-[var(--cosmic-star)] p-0.5"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-background/95">
                    <User className="h-5 w-5 text-foreground" />
                  </div>
                </motion.button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-card/95 backdrop-blur-xl border border-border overflow-hidden"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-3 border-b border-border">
                        <p className="text-sm text-muted-foreground">Signed in as</p>
                        <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                      </div>
                      
                      <div className="p-2">
                        <Link href="/settings" onClick={() => setIsUserMenuOpen(false)}>
                          <motion.div
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                            whileHover={{ x: 5 }}
                          >
                            <Settings className="h-4 w-4" />
                            設定
                          </motion.div>
                        </Link>
                        
                        <motion.button
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            signOut()
                          }}
                          whileHover={{ x: 5 }}
                        >
                          <LogOut className="h-4 w-4" />
                          ログアウト
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/login">
                  <FuturisticButton variant="ghost" size="sm">
                    ログイン
                  </FuturisticButton>
                </Link>
                <Link href="/register">
                  <FuturisticButton variant="primary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
                    サインアップ
                  </FuturisticButton>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden relative h-10 w-10 rounded-lg bg-card/50 backdrop-blur-sm border border-border flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
            </motion.button>
          </div>
        </div>
      </Container>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-20 inset-x-0 bg-background/95 backdrop-blur-xl border-b border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Container size="full">
              <nav className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                      whileHover={{ x: 5 }}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </motion.div>
                  </Link>
                ))}
                
                {!user && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <FuturisticButton variant="secondary" size="sm" className="w-full">
                        ログイン
                      </FuturisticButton>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <FuturisticButton variant="primary" size="sm" className="w-full">
                        サインアップ
                      </FuturisticButton>
                    </Link>
                  </div>
                )}
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}