import { 
  Role, 
  Permission, 
  ROLE_PERMISSIONS, 
  TeamMember,
  Organization,
  AuditLog,
  ACTIONS,
  RESOURCES
} from '@/types/auth'
import { createClient } from '@/lib/supabase/client'

export class RBACService {
  private supabase = createClient()

  /**
   * Check if a user has permission to perform an action on a resource
   */
  async hasPermission(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string
  ): Promise<boolean> {
    try {
      // Get user's role for the resource
      const role = await this.getUserRole(userId, resourceId)
      if (!role) return false

      // Get permissions for the role
      const permissions = ROLE_PERMISSIONS[role]
      if (!permissions) return false

      // Check if user has the required permission
      return this.checkPermission(permissions, action, resource)
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  /**
   * Get user's role for a specific resource
   */
  async getUserRole(userId: string, resourceId?: string): Promise<Role | null> {
    try {
      // If checking survey-specific role
      if (resourceId) {
        const { data: member } = await this.supabase
          .from('survey_collaborators')
          .select('role')
          .eq('user_id', userId)
          .eq('survey_id', resourceId)
          .single()

        if (member) return member.role as Role

        // Check if user is the survey owner
        const { data: survey } = await this.supabase
          .from('surveys')
          .select('created_by')
          .eq('id', resourceId)
          .single()

        if (survey?.created_by === userId) return 'owner'
      }

      // Get user's default role from profiles
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('default_role')
        .eq('id', userId)
        .single()

      return (profile?.default_role as Role) || 'viewer'
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  }

  /**
   * Check if permissions array contains the required permission
   */
  private checkPermission(
    permissions: Permission[],
    action: string,
    resource: string
  ): boolean {
    return permissions.some(permission => {
      // Check for wildcard permissions
      if (permission.action === '*' && permission.resource === '*') return true
      if (permission.action === '*' && permission.resource === resource) return true
      if (permission.action === action && permission.resource === '*') return true
      
      // Check for exact match
      return permission.action === action && permission.resource === resource
    })
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const role = await this.getUserRole(userId)
    return role ? ROLE_PERMISSIONS[role] : []
  }

  /**
   * Add a team member with a specific role
   */
  async addTeamMember(
    resourceId: string,
    email: string,
    role: Role,
    invitedBy: string
  ): Promise<TeamMember | null> {
    try {
      // First, get user by email
      const { data: userData } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (!userData) {
        throw new Error('User not found')
      }

      // Add as collaborator
      const { data, error } = await this.supabase
        .from('survey_collaborators')
        .insert({
          survey_id: resourceId,
          user_id: userData.id,
          role,
          invited_by: invitedBy
        })
        .select()
        .single()

      if (error) throw error

      // Log the action
      await this.logAction(invitedBy, ACTIONS.INVITE_MEMBER, RESOURCES.TEAM, resourceId, {
        invited_user: email,
        role
      })

      return data as TeamMember
    } catch (error) {
      console.error('Error adding team member:', error)
      return null
    }
  }

  /**
   * Update team member role
   */
  async updateTeamMemberRole(
    resourceId: string,
    userId: string,
    newRole: Role,
    updatedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('survey_collaborators')
        .update({ role: newRole })
        .eq('survey_id', resourceId)
        .eq('user_id', userId)

      if (error) throw error

      // Log the action
      await this.logAction(updatedBy, ACTIONS.UPDATE_MEMBER_ROLE, RESOURCES.TEAM, resourceId, {
        user_id: userId,
        new_role: newRole
      })

      return true
    } catch (error) {
      console.error('Error updating team member role:', error)
      return false
    }
  }

  /**
   * Remove team member
   */
  async removeTeamMember(
    resourceId: string,
    userId: string,
    removedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('survey_collaborators')
        .delete()
        .eq('survey_id', resourceId)
        .eq('user_id', userId)

      if (error) throw error

      // Log the action
      await this.logAction(removedBy, ACTIONS.REMOVE_MEMBER, RESOURCES.TEAM, resourceId, {
        removed_user: userId
      })

      return true
    } catch (error) {
      console.error('Error removing team member:', error)
      return false
    }
  }

  /**
   * Get team members for a resource
   */
  async getTeamMembers(resourceId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await this.supabase
        .from('survey_collaborators')
        .select(`
          *,
          profiles:profiles!survey_collaborators_user_id_fkey (
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('survey_id', resourceId)

      if (error) throw error

      return (data || []).map(member => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        email: member.profiles.email,
        name: member.profiles.full_name,
        avatar_url: member.profiles.avatar_url,
        joined_at: member.created_at,
        invited_by: member.invited_by
      })) as TeamMember[]
    } catch (error) {
      console.error('Error getting team members:', error)
      return []
    }
  }

  /**
   * Log an action for audit trail
   */
  async logAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        })
    } catch (error) {
      console.error('Error logging action:', error)
    }
  }

  /**
   * Get audit logs for a resource
   */
  async getAuditLogs(
    resourceId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data as AuditLog[]
    } catch (error) {
      console.error('Error getting audit logs:', error)
      return []
    }
  }

  /**
   * Get client IP address
   */
  private async getClientIP(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return undefined
    }
  }

  /**
   * Create organization
   */
  async createOrganization(
    name: string,
    ownerId: string,
    settings?: Organization['settings']
  ): Promise<Organization | null> {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .insert({
          name,
          owner_id: ownerId,
          settings
        })
        .select()
        .single()

      if (error) throw error

      return data as Organization
    } catch (error) {
      console.error('Error creating organization:', error)
      return null
    }
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(
    orgId: string,
    settings: Organization['settings']
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('organizations')
        .update({ settings })
        .eq('id', orgId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error updating organization settings:', error)
      return false
    }
  }
}