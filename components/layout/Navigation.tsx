'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Home, 
  FileText, 
  PlusCircle, 
  LayoutDashboard, 
  LogOut, 
  User,
  Settings,
  Menu
} from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Survey App</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <Button 
                  variant={isActive('/') && pathname === '/' ? 'default' : 'ghost'} 
                  size="sm"
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  ホーム
                </Button>
              </Link>

              {user && (
                <>
                  <Link href="/dashboard">
                    <Button 
                      variant={isActive('/dashboard') ? 'default' : 'ghost'} 
                      size="sm"
                      className="gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      ダッシュボード
                    </Button>
                  </Link>

                  <Link href="/surveys">
                    <Button 
                      variant={isActive('/surveys') && !isActive('/surveys/new') ? 'default' : 'ghost'} 
                      size="sm"
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      アンケート一覧
                    </Button>
                  </Link>

                  <Link href="/surveys/new">
                    <Button 
                      variant={isActive('/surveys/new') ? 'default' : 'ghost'} 
                      size="sm"
                      className="gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      新規作成
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden md:inline">{user.email}</span>
                      <span className="md:hidden">メニュー</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Mobile Navigation Items */}
                    <div className="md:hidden">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          ダッシュボード
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/surveys" className="cursor-pointer">
                          <FileText className="mr-2 h-4 w-4" />
                          アンケート一覧
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/surveys/new" className="cursor-pointer">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          新規作成
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </div>

                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        プロフィール
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        設定
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    新規登録
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}