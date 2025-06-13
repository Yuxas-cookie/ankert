// Role-Based Access Control Types

export type Role = 'owner' | 'admin' | 'editor' | 'viewer' | 'respondent'

export interface Permission {
  action: string
  resource: string
  conditions?: Record<string, any>
}

export interface RolePermissions {
  role: Role
  permissions: Permission[]
}

// Permission actions
export const ACTIONS = {
  // Survey actions
  CREATE_SURVEY: 'survey:create',
  READ_SURVEY: 'survey:read',
  UPDATE_SURVEY: 'survey:update',
  DELETE_SURVEY: 'survey:delete',
  PUBLISH_SURVEY: 'survey:publish',
  ARCHIVE_SURVEY: 'survey:archive',
  
  // Response actions
  VIEW_RESPONSES: 'response:view',
  EXPORT_RESPONSES: 'response:export',
  DELETE_RESPONSES: 'response:delete',
  
  // Analytics actions
  VIEW_ANALYTICS: 'analytics:view',
  EXPORT_ANALYTICS: 'analytics:export',
  
  // Team actions
  INVITE_MEMBER: 'team:invite',
  REMOVE_MEMBER: 'team:remove',
  UPDATE_MEMBER_ROLE: 'team:update_role',
  
  // Settings actions
  UPDATE_SETTINGS: 'settings:update',
  VIEW_SETTINGS: 'settings:view',
} as const

// Resource types
export const RESOURCES = {
  SURVEY: 'survey',
  RESPONSE: 'response',
  ANALYTICS: 'analytics',
  TEAM: 'team',
  SETTINGS: 'settings',
} as const

// Role definitions with permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    // Owner has all permissions
    { action: '*', resource: '*' }
  ],
  
  admin: [
    // Survey permissions
    { action: ACTIONS.CREATE_SURVEY, resource: RESOURCES.SURVEY },
    { action: ACTIONS.READ_SURVEY, resource: RESOURCES.SURVEY },
    { action: ACTIONS.UPDATE_SURVEY, resource: RESOURCES.SURVEY },
    { action: ACTIONS.DELETE_SURVEY, resource: RESOURCES.SURVEY },
    { action: ACTIONS.PUBLISH_SURVEY, resource: RESOURCES.SURVEY },
    { action: ACTIONS.ARCHIVE_SURVEY, resource: RESOURCES.SURVEY },
    
    // Response permissions
    { action: ACTIONS.VIEW_RESPONSES, resource: RESOURCES.RESPONSE },
    { action: ACTIONS.EXPORT_RESPONSES, resource: RESOURCES.RESPONSE },
    { action: ACTIONS.DELETE_RESPONSES, resource: RESOURCES.RESPONSE },
    
    // Analytics permissions
    { action: ACTIONS.VIEW_ANALYTICS, resource: RESOURCES.ANALYTICS },
    { action: ACTIONS.EXPORT_ANALYTICS, resource: RESOURCES.ANALYTICS },
    
    // Team permissions
    { action: ACTIONS.INVITE_MEMBER, resource: RESOURCES.TEAM },
    { action: ACTIONS.REMOVE_MEMBER, resource: RESOURCES.TEAM },
    { action: ACTIONS.UPDATE_MEMBER_ROLE, resource: RESOURCES.TEAM },
    
    // Settings permissions
    { action: ACTIONS.UPDATE_SETTINGS, resource: RESOURCES.SETTINGS },
    { action: ACTIONS.VIEW_SETTINGS, resource: RESOURCES.SETTINGS },
  ],
  
  editor: [
    // Survey permissions (no delete)
    { action: ACTIONS.CREATE_SURVEY, resource: RESOURCES.SURVEY },
    { action: ACTIONS.READ_SURVEY, resource: RESOURCES.SURVEY },
    { action: ACTIONS.UPDATE_SURVEY, resource: RESOURCES.SURVEY },
    { action: ACTIONS.PUBLISH_SURVEY, resource: RESOURCES.SURVEY },
    
    // Response permissions (no delete)
    { action: ACTIONS.VIEW_RESPONSES, resource: RESOURCES.RESPONSE },
    { action: ACTIONS.EXPORT_RESPONSES, resource: RESOURCES.RESPONSE },
    
    // Analytics permissions
    { action: ACTIONS.VIEW_ANALYTICS, resource: RESOURCES.ANALYTICS },
    { action: ACTIONS.EXPORT_ANALYTICS, resource: RESOURCES.ANALYTICS },
    
    // Settings permissions (view only)
    { action: ACTIONS.VIEW_SETTINGS, resource: RESOURCES.SETTINGS },
  ],
  
  viewer: [
    // Survey permissions (read only)
    { action: ACTIONS.READ_SURVEY, resource: RESOURCES.SURVEY },
    
    // Response permissions (view only)
    { action: ACTIONS.VIEW_RESPONSES, resource: RESOURCES.RESPONSE },
    
    // Analytics permissions (view only)
    { action: ACTIONS.VIEW_ANALYTICS, resource: RESOURCES.ANALYTICS },
    
    // Settings permissions (view only)
    { action: ACTIONS.VIEW_SETTINGS, resource: RESOURCES.SETTINGS },
  ],
  
  respondent: [
    // Can only respond to surveys
    { action: ACTIONS.READ_SURVEY, resource: RESOURCES.SURVEY, conditions: { publicOnly: true } },
  ]
}

// Team member interface
export interface TeamMember {
  id: string
  user_id: string
  organization_id?: string
  role: Role
  email: string
  name?: string
  avatar_url?: string
  joined_at: string
  invited_by?: string
  permissions?: Permission[]
}

// Organization interface
export interface Organization {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
  settings?: {
    defaultRole?: Role
    allowSelfSignup?: boolean
    requiredDomain?: string
  }
}

// Audit log interface
export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}