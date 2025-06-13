# Ticket 04-03: Survey Sharing and Permissions

## Overview
Implement comprehensive survey sharing and permissions system that allows survey creators to control access, collaboration, and visibility of their surveys. This system provides granular permission controls, secure sharing mechanisms, and collaborative features for team-based survey management.

## Goals
- Create flexible survey sharing and permission system
- Implement secure link sharing with access controls
- Build collaborative survey editing and management
- Provide granular permission controls for different user roles
- Enable public and private survey distribution methods

## Detailed Task Breakdown

### 1. Permission System Architecture
- [ ] **SurveyPermissionManager** - Core permission management
  - Permission matrix for survey operations
  - Role-based permission inheritance
  - Context-aware permission evaluation
  - Permission caching and optimization
- [ ] **PermissionTypes** - Granular permission definitions
  - View survey details and settings
  - Edit survey content and structure
  - Manage survey distribution and access
  - View and export response data
  - Delete and archive surveys
  - Share and invite collaborators
- [ ] **RoleBasedAccess** - Role-specific permission sets
  - Owner (full control)
  - Editor (edit content, manage distribution)
  - Analyst (view responses, export data)
  - Viewer (view survey and basic analytics)
  - Custom roles with specific permissions

### 2. Survey Sharing Mechanisms
- [ ] **ShareLinkGenerator** - Secure sharing link creation
  - Unique, non-guessable share URLs
  - Expirable share links with time limits
  - Password-protected sharing options
  - View-only vs. collaborative sharing modes
- [ ] **InvitationSystem** - Direct user invitations
  - Email-based collaboration invitations
  - Role-specific invitation templates
  - Bulk invitation capabilities
  - Invitation tracking and follow-up
- [ ] **PublicSharingControls** - Public access management
  - Public survey directory listing
  - Search engine indexing controls
  - Social media sharing optimization
  - Public access analytics and monitoring

### 3. Collaborative Editing Features
- [ ] **CollaborativeEditor** - Multi-user editing system
  - Real-time collaboration indicators
  - User presence awareness
  - Edit conflict resolution
  - Activity feed for collaborative changes
- [ ] **EditLocking** - Prevent editing conflicts
  - Section-level editing locks
  - Automatic lock release on inactivity
  - Lock override for emergency situations
  - Visual indicators for locked sections
- [ ] **ChangeTracking** - Collaboration audit trail
  - Detailed change history with attribution
  - Revert capabilities for unwanted changes
  - Comment system for collaborative feedback
  - Notification system for important changes

### 4. Access Control and Security
- [ ] **AccessValidator** - Permission validation middleware
  - API endpoint protection
  - Resource-level access checking
  - Context-aware permission evaluation
  - Audit logging for access attempts
- [ ] **ShareSecurity** - Secure sharing implementation
  - Link expiration and revocation
  - IP-based access restrictions
  - Device and browser limitations
  - Anti-abuse measures and rate limiting
- [ ] **DataPrivacy** - Privacy protection for shared surveys
  - Configurable data visibility levels
  - Response anonymization options
  - Selective data sharing capabilities
  - Compliance with privacy regulations

### 5. Team and Organization Sharing
- [ ] **TeamCollaboration** - Team-based survey sharing
  - Team-level survey visibility
  - Inherited permissions from team membership
  - Team survey templates and standards
  - Collaborative workflow management
- [ ] **OrganizationSharing** - Organization-wide sharing
  - Organization survey directory
  - Department-level access controls
  - Corporate branding and templates
  - Administrative oversight and controls
- [ ] **CrossOrganizationSharing** - External collaboration
  - Secure external partner access
  - Guest user management
  - Limited-time external access
  - External collaboration audit trails

### 6. Sharing Analytics and Management
- [ ] **SharingAnalytics** - Sharing performance tracking
  - Share link click tracking
  - Invitation acceptance rates
  - Collaboration activity metrics
  - Access pattern analysis
- [ ] **ShareManagement** - Active share management
  - List and manage active shares
  - Bulk permission updates
  - Share expiration management
  - Access revocation capabilities

## Completion Criteria

### Functional Requirements
- [ ] Survey creators can share surveys with granular permission controls
- [ ] Invited users receive appropriate access based on their roles
- [ ] Share links work correctly with expiration and security features
- [ ] Collaborative editing prevents conflicts and maintains data integrity
- [ ] Permission checks are enforced across all survey operations
- [ ] Analytics provide insights into sharing and collaboration patterns

### Technical Requirements
- [ ] Permission system is performant and scalable
- [ ] Share links are secure and non-guessable
- [ ] Real-time collaboration works smoothly
- [ ] Database queries are optimized for permission checks
- [ ] API endpoints are properly protected
- [ ] Audit trails are complete and tamper-proof

### Security Requirements
- [ ] Unauthorized access is prevented at all levels
- [ ] Share links cannot be enumerated or guessed
- [ ] Sensitive data is protected based on permission levels
- [ ] Audit logs capture all security-relevant events
- [ ] Rate limiting prevents abuse of sharing features

## Test Cases

### Unit Tests
```typescript
describe('SurveyPermissionManager', () => {
  it('should check permissions correctly for different roles', () => {});
  it('should handle permission inheritance properly', () => {});
  it('should enforce context-aware permissions', () => {});
  it('should cache permissions for performance', () => {});
});

describe('ShareLinkGenerator', () => {
  it('should generate secure, unique share links', () => {});
  it('should handle link expiration correctly', () => {});
  it('should validate password-protected links', () => {});
  it('should prevent link enumeration attacks', () => {});
});

describe('CollaborativeEditor', () => {
  it('should handle concurrent edits without conflicts', () => {});
  it('should track changes with proper attribution', () => {});
  it('should manage editing locks effectively', () => {});
  it('should synchronize changes in real-time', () => {});
});
```

### Integration Tests
- [ ] End-to-end sharing and collaboration workflow
- [ ] Permission enforcement across API endpoints
- [ ] Real-time collaboration synchronization
- [ ] Cross-browser compatibility for collaboration

### Security Tests
- [ ] Permission bypass prevention
- [ ] Share link security validation
- [ ] Access control enforcement
- [ ] Rate limiting effectiveness

### Performance Tests
- [ ] Permission checking performance under load
- [ ] Large-scale collaboration scenarios
- [ ] Database query optimization validation
- [ ] Real-time synchronization performance

## Dependencies

### Internal Dependencies
- Ticket 04-01: User Authentication and Authorization (for user and role management)
- Ticket 04-04: Team Collaboration Features (for team-based sharing)
- Ticket 02-01: Survey Creation API (for survey data access)

### External Dependencies
- Supabase Row Level Security for database-level permissions
- Real-time subscriptions for collaborative features
- Email service for invitation notifications
- URL shortening service (optional) for cleaner share links

### Database Schema Extensions
```sql
-- Survey permissions
CREATE TABLE survey_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(survey_id, user_id)
);

-- Share links
CREATE TABLE survey_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  share_token VARCHAR(100) UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  access_type VARCHAR(50) DEFAULT 'view',
  password_hash VARCHAR(255),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Collaboration sessions
CREATE TABLE collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Edit locks
CREATE TABLE survey_edit_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  section_id VARCHAR(100),
  locked_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  locked_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(survey_id, section_id)
);

-- Change tracking
CREATE TABLE survey_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id),
  change_type VARCHAR(50),
  old_data JSONB,
  new_data JSONB,
  section_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Technical Implementation Notes

### Permission System Structure
```typescript
interface SurveyPermission {
  surveyId: string;
  userId: string;
  role: 'owner' | 'editor' | 'analyst' | 'viewer' | 'custom';
  permissions: Permission[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

interface Permission {
  resource: 'survey' | 'responses' | 'analytics' | 'settings';
  actions: ('create' | 'read' | 'update' | 'delete' | 'share' | 'export')[];
  conditions?: PermissionCondition[];
}

interface PermissionCondition {
  type: 'time_based' | 'ip_based' | 'device_based' | 'data_scope';
  value: any;
}
```

### Share Link Implementation
```typescript
class ShareLinkManager {
  async createShareLink(surveyId: string, options: ShareLinkOptions) {
    const shareToken = generateSecureToken(32);
    const passwordHash = options.password ? 
      await hashPassword(options.password) : null;
    
    const shareLink = await supabase
      .from('survey_share_links')
      .insert({
        survey_id: surveyId,
        share_token: shareToken,
        access_type: options.accessType || 'view',
        password_hash: passwordHash,
        max_uses: options.maxUses,
        expires_at: options.expiresAt
      })
      .select()
      .single();
    
    return {
      url: `${process.env.BASE_URL}/share/${shareToken}`,
      token: shareToken,
      ...shareLink.data
    };
  }
  
  async validateShareLink(token: string, password?: string) {
    const shareLink = await supabase
      .from('survey_share_links')
      .select('*')
      .eq('share_token', token)
      .eq('is_active', true)
      .single();
    
    if (!shareLink.data) {
      throw new Error('Invalid share link');
    }
    
    // Check expiration
    if (shareLink.data.expires_at && 
        new Date(shareLink.data.expires_at) < new Date()) {
      throw new Error('Share link has expired');
    }
    
    // Check usage limits
    if (shareLink.data.max_uses && 
        shareLink.data.current_uses >= shareLink.data.max_uses) {
      throw new Error('Share link usage limit exceeded');
    }
    
    // Check password if required
    if (shareLink.data.password_hash && 
        !await verifyPassword(password, shareLink.data.password_hash)) {
      throw new Error('Incorrect password');
    }
    
    // Increment usage count
    await supabase
      .from('survey_share_links')
      .update({ current_uses: shareLink.data.current_uses + 1 })
      .eq('id', shareLink.data.id);
    
    return shareLink.data;
  }
}
```

### Permission Checking Middleware
```typescript
export const requireSurveyPermission = (permission: string) => {
  return async (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
    const { surveyId } = req.query;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const hasPermission = await checkSurveyPermission(
      user.id, 
      surveyId as string, 
      permission
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Log access for audit purposes
    await logSurveyAccess(user.id, surveyId as string, permission);
    
    next();
  };
};

async function checkSurveyPermission(
  userId: string, 
  surveyId: string, 
  permission: string
): Promise<boolean> {
  // Check direct permissions
  const directPermission = await supabase
    .from('survey_permissions')
    .select('role, expires_at')
    .eq('survey_id', surveyId)
    .eq('user_id', userId)
    .single();
  
  if (directPermission.data) {
    // Check expiration
    if (directPermission.data.expires_at && 
        new Date(directPermission.data.expires_at) < new Date()) {
      return false;
    }
    
    return roleHasPermission(directPermission.data.role, permission);
  }
  
  // Check team-based permissions
  const teamPermissions = await checkTeamPermissions(userId, surveyId);
  if (teamPermissions.some(tp => roleHasPermission(tp.role, permission))) {
    return true;
  }
  
  // Check organization-based permissions
  const orgPermissions = await checkOrganizationPermissions(userId, surveyId);
  if (orgPermissions.some(op => roleHasPermission(op.role, permission))) {
    return true;
  }
  
  return false;
}
```

### Real-time Collaboration
```typescript
class CollaborationManager {
  private activeSessions = new Map<string, Set<string>>();
  
  async joinCollaboration(surveyId: string, userId: string) {
    // Create or update collaboration session
    await supabase
      .from('collaboration_sessions')
      .upsert({
        survey_id: surveyId,
        user_id: userId,
        last_activity: new Date().toISOString()
      });
    
    // Track active session
    if (!this.activeSessions.has(surveyId)) {
      this.activeSessions.set(surveyId, new Set());
    }
    this.activeSessions.get(surveyId)!.add(userId);
    
    // Notify other collaborators
    await this.broadcastPresence(surveyId, userId, 'joined');
  }
  
  async leaveCollaboration(surveyId: string, userId: string) {
    // Update session
    await supabase
      .from('collaboration_sessions')
      .update({ is_active: false })
      .eq('survey_id', surveyId)
      .eq('user_id', userId);
    
    // Remove from active sessions
    this.activeSessions.get(surveyId)?.delete(userId);
    
    // Release any locks held by this user
    await this.releaseUserLocks(surveyId, userId);
    
    // Notify other collaborators
    await this.broadcastPresence(surveyId, userId, 'left');
  }
  
  async acquireEditLock(surveyId: string, sectionId: string, userId: string) {
    const lockExpiry = new Date();
    lockExpiry.setMinutes(lockExpiry.getMinutes() + 5); // 5-minute lock
    
    try {
      await supabase
        .from('survey_edit_locks')
        .insert({
          survey_id: surveyId,
          section_id: sectionId,
          locked_by: userId,
          expires_at: lockExpiry.toISOString()
        });
      
      // Notify other collaborators
      await this.broadcastLockStatus(surveyId, sectionId, userId, 'locked');
      
      return true;
    } catch (error) {
      // Lock already exists
      return false;
    }
  }
  
  private async broadcastPresence(surveyId: string, userId: string, action: string) {
    await supabase
      .channel(`survey:${surveyId}`)
      .send({
        type: 'broadcast',
        event: 'presence',
        payload: { userId, action }
      });
  }
}
```

## File Structure
```
lib/permissions/
├── SurveyPermissionManager.ts
├── ShareLinkManager.ts
├── CollaborationManager.ts
├── AccessValidator.ts
└── PermissionCache.ts

components/sharing/
├── ShareDialog.tsx
├── InviteCollaborators.tsx
├── PermissionSettings.tsx
├── ShareLinkGenerator.tsx
├── CollaboratorList.tsx
└── ActiveCollaborators.tsx

middleware/
├── permission-check.ts
├── share-link-validation.ts
└── collaboration-session.ts

pages/api/surveys/[id]/
├── share.ts
├── collaborators.ts
├── permissions.ts
└── share-links.ts
```

### Permission Configuration
```typescript
const rolePermissions = {
  owner: {
    survey: ['create', 'read', 'update', 'delete', 'share'],
    responses: ['read', 'export', 'delete'],
    analytics: ['read', 'export'],
    settings: ['read', 'update']
  },
  editor: {
    survey: ['read', 'update', 'share'],
    responses: ['read', 'export'],
    analytics: ['read'],
    settings: ['read']
  },
  analyst: {
    survey: ['read'],
    responses: ['read', 'export'],
    analytics: ['read', 'export'],
    settings: ['read']
  },
  viewer: {
    survey: ['read'],
    responses: [],
    analytics: ['read'],
    settings: ['read']
  }
};
```

## Security Considerations

### Share Link Security
- Cryptographically secure token generation
- Non-enumerable token space
- Automatic expiration handling
- Password protection for sensitive surveys
- Usage tracking and limits

### Access Control
- Database-level row security policies
- API endpoint protection
- Context-aware permission evaluation
- Audit logging for all access attempts
- Rate limiting for sharing operations

### Collaboration Security
- Real-time presence validation
- Edit lock ownership verification
- Change attribution and tracking
- Conflict resolution with data integrity
- Session timeout and cleanup

## References
- [Role-Based Access Control (RBAC)](https://auth0.com/intro-to-iam/what-is-role-based-access-control-rbac)
- [Collaborative Editing Algorithms](https://en.wikipedia.org/wiki/Operational_transformation)
- [Secure Link Sharing Best Practices](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/09-Test_File_Permission)
- [Real-time Collaboration Patterns](https://www.smashingmagazine.com/2019/07/collaborative-editing-whiteboard-javascript/)