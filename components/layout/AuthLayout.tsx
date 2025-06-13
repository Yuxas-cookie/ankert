import React from 'react'
import Link from 'next/link'
import { Container } from './Container'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="h-12 w-12 rounded bg-primary" />
            <span className="font-bold text-2xl">Survey App</span>
          </Link>
        </div>

        {/* Title */}
        {title && (
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:underline">
            プライバシーポリシー
          </Link>
          <span className="mx-2">•</span>
          <Link href="/terms" className="hover:underline">
            利用規約
          </Link>
        </div>
      </div>
    </div>
  )
}