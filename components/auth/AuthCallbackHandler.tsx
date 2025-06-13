'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

export function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      // Wait a moment for auth to be processed
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      
      if (user) {
        router.push(redirectTo)
      } else {
        // If auth failed, redirect to login
        router.push('/login?error=Authentication failed')
      }
    }

    handleCallback()
  }, [user, router, searchParams])

  return null
}