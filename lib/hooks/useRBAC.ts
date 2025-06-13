import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { RBACService } from '@/lib/services/rbac'
import { Permission, Role, TeamMember } from '@/types/auth'

const rbacService = new RBACService()

interface UseRBACOptions {
  resourceId?: string
  resourceType?: string
}

export function useRBAC(options?: UseRBACOptions) {
  const { user } = useAuth()
  const [role, setRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user role and permissions
  useEffect(() => {
    const fetchRoleAndPermissions = async () => {
      if (!user) {
        setRole(null)
        setPermissions([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const userRole = await rbacService.getUserRole(user.id, options?.resourceId)
        setRole(userRole)

        const userPermissions = await rbacService.getUserPermissions(user.id)
        setPermissions(userPermissions)
      } catch (error) {
        console.error('Error fetching role and permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoleAndPermissions()
  }, [user, options?.resourceId])

  // Check if user has a specific permission
  const hasPermission = useCallback(
    async (action: string, resource: string): Promise<boolean> => {
      if (!user) return false

      return rbacService.hasPermission(
        user.id,
        action,
        resource,
        options?.resourceId
      )
    },
    [user, options?.resourceId]
  )

  // Check permission synchronously based on loaded permissions
  const canDo = useCallback(
    (action: string, resource: string): boolean => {
      if (!permissions.length) return false

      return permissions.some(permission => {
        // Check for wildcard permissions
        if (permission.action === '*' && permission.resource === '*') return true
        if (permission.action === '*' && permission.resource === resource) return true
        if (permission.action === action && permission.resource === '*') return true
        
        // Check for exact match
        return permission.action === action && permission.resource === resource
      })
    },
    [permissions]
  )

  // Role check helpers
  const isOwner = role === 'owner'
  const isAdmin = role === 'admin' || isOwner
  const isEditor = role === 'editor' || isAdmin
  const isViewer = role === 'viewer' || isEditor
  const isRespondent = role === 'respondent'

  return {
    role,
    permissions,
    loading,
    hasPermission,
    canDo,
    isOwner,
    isAdmin,
    isEditor,
    isViewer,
    isRespondent,
  }
}

// Hook for managing team members
export function useTeamMembers(resourceId: string) {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch team members
  const fetchMembers = useCallback(async () => {
    if (!resourceId) return

    setLoading(true)
    setError(null)

    try {
      const teamMembers = await rbacService.getTeamMembers(resourceId)
      setMembers(teamMembers)
    } catch (err) {
      setError('チームメンバーの取得に失敗しました')
      console.error('Error fetching team members:', err)
    } finally {
      setLoading(false)
    }
  }, [resourceId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Add team member
  const addMember = useCallback(
    async (email: string, role: Role): Promise<boolean> => {
      if (!user) return false

      try {
        const newMember = await rbacService.addTeamMember(
          resourceId,
          email,
          role,
          user.id
        )

        if (newMember) {
          await fetchMembers()
          return true
        }
        return false
      } catch (err) {
        console.error('Error adding team member:', err)
        return false
      }
    },
    [user, resourceId, fetchMembers]
  )

  // Update member role
  const updateMemberRole = useCallback(
    async (userId: string, newRole: Role): Promise<boolean> => {
      if (!user) return false

      try {
        const success = await rbacService.updateTeamMemberRole(
          resourceId,
          userId,
          newRole,
          user.id
        )

        if (success) {
          await fetchMembers()
        }
        return success
      } catch (err) {
        console.error('Error updating member role:', err)
        return false
      }
    },
    [user, resourceId, fetchMembers]
  )

  // Remove team member
  const removeMember = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!user) return false

      try {
        const success = await rbacService.removeTeamMember(
          resourceId,
          userId,
          user.id
        )

        if (success) {
          await fetchMembers()
        }
        return success
      } catch (err) {
        console.error('Error removing team member:', err)
        return false
      }
    },
    [user, resourceId, fetchMembers]
  )

  return {
    members,
    loading,
    error,
    addMember,
    updateMemberRole,
    removeMember,
    refetch: fetchMembers,
  }
}