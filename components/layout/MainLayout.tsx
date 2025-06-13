'use client'

import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Container } from './Container'

interface MainLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = true,
  containerSize = 'full',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleSidebar={toggleSidebar}
        showSidebarToggle={showSidebar}
      />
      
      <div className="flex">
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={closeSidebar}
          />
        )}
        
        <main 
          className={`flex-1 ${showSidebar ? 'md:ml-64' : ''}`}
        >
          <Container size={containerSize} className="py-8">
            {children}
          </Container>
        </main>
      </div>
    </div>
  )
}