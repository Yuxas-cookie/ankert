'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { 
  SurveyPermission, 
  CreateSurveyPermissionInput,
  SurveyAccessInput,
  SurveyPermissionType 
} from '@/lib/validations/survey-permissions'

export function useSurveyPermissions(surveyId?: string) {
  const [permissions, setPermissions] = useState<SurveyPermission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  // アンケートの権限設定を取得
  const fetchPermissions = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('survey_permissions')
        .select('*')
        .eq('survey_id', id)
        .eq('is_active', true)

      if (error) throw error
      setPermissions(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '権限設定の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 権限設定を作成
  const createPermission = async (input: CreateSurveyPermissionInput) => {
    setLoading(true)
    setError(null)

    try {
      const permissionData = {
        ...input,
        password_hash: input.password ? await hashPassword(input.password) : null
      }

      const { data, error } = await supabase
        .from('survey_permissions')
        .insert([permissionData])
        .select()
        .single()

      if (error) throw error
      
      if (surveyId === input.survey_id) {
        setPermissions(prev => [...prev, data])
      }
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '権限設定の作成に失敗しました'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // 権限設定を更新
  const updatePermission = async (id: string, updates: Partial<CreateSurveyPermissionInput>) => {
    setLoading(true)
    setError(null)

    try {
      const updateData = {
        ...updates,
        password_hash: updates.password ? await hashPassword(updates.password) : undefined,
        updated_at: new Date()
      }

      const { data, error } = await supabase
        .from('survey_permissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setPermissions(prev => prev.map(p => p.id === id ? data : p))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '権限設定の更新に失敗しました'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // 権限設定を削除（論理削除）
  const deletePermission = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('survey_permissions')
        .update({ is_active: false, updated_at: new Date() })
        .eq('id', id)

      if (error) throw error
      
      setPermissions(prev => prev.filter(p => p.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '権限設定の削除に失敗しました'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // アンケートアクセス権限をチェック
  const checkAccess = async (input: SurveyAccessInput): Promise<{
    hasAccess: boolean
    requiresAuth: boolean
    requiresPassword: boolean
    error?: string
  }> => {
    try {
      const { data: permissions } = await supabase
        .from('survey_permissions')
        .select('*')
        .eq('survey_id', input.survey_id)
        .eq('is_active', true)

      if (!permissions || permissions.length === 0) {
        return { hasAccess: false, requiresAuth: false, requiresPassword: false, error: 'アクセス権限が設定されていません' }
      }

      const now = new Date()
      const activePermissions = permissions.filter(p => 
        (!p.start_date || new Date(p.start_date) <= now) &&
        (!p.end_date || new Date(p.end_date) >= now)
      )

      if (activePermissions.length === 0) {
        return { hasAccess: false, requiresAuth: false, requiresPassword: false, error: 'アンケートの公開期間外です' }
      }

      // 権限タイプ別のチェック
      for (const permission of activePermissions) {
        switch (permission.permission_type) {
          case 'public':
            return { hasAccess: true, requiresAuth: false, requiresPassword: false }

          case 'url_access':
            return { hasAccess: true, requiresAuth: false, requiresPassword: !!permission.password_hash }

          case 'authenticated':
            if (!user) {
              return { hasAccess: false, requiresAuth: true, requiresPassword: false }
            }
            return { hasAccess: true, requiresAuth: false, requiresPassword: !!permission.password_hash }

          case 'restricted':
            if (!user) {
              return { hasAccess: false, requiresAuth: true, requiresPassword: false }
            }
            if (permission.allowed_emails && !permission.allowed_emails.includes(user.email!)) {
              return { hasAccess: false, requiresAuth: false, requiresPassword: false, error: 'このアンケートへのアクセス権限がありません' }
            }
            return { hasAccess: true, requiresAuth: false, requiresPassword: !!permission.password_hash }
        }
      }

      return { hasAccess: false, requiresAuth: false, requiresPassword: false, error: '不明なエラー' }
    } catch (err) {
      return { hasAccess: false, requiresAuth: false, requiresPassword: false, error: 'アクセス権限の確認に失敗しました' }
    }
  }

  useEffect(() => {
    if (surveyId) {
      fetchPermissions(surveyId)
    }
  }, [surveyId])

  return {
    permissions,
    loading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    checkAccess,
    refetch: () => surveyId && fetchPermissions(surveyId)
  }
}

// パスワードハッシュ化ユーティリティ
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}