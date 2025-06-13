import React from 'react'
import Link from 'next/link'
import { Container } from './Container'

interface PublicLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && (
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <Container>
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded bg-primary" />
                <span className="font-bold text-lg">Survey App</span>
              </Link>
              
              <div className="text-sm text-muted-foreground">
                アンケート回答ページ
              </div>
            </div>
          </Container>
        </header>
      )}

      <main className="flex-1">
        {children}
      </main>

      {showFooter && (
        <footer className="border-t border-border py-6">
          <Container>
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Powered by{' '}
                <Link href="/" className="font-medium hover:underline">
                  Survey App
                </Link>
              </p>
            </div>
          </Container>
        </footer>
      )}
    </div>
  )
}