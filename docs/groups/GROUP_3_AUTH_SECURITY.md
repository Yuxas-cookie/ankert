# GROUP 3: Authentication & Security Team

## Team Composition
- **Team Lead**: Senior Security Engineer
- **Members**: 
  - 2 Backend Developers (Security Focus)
  - 1 DevSecOps Engineer
  - 1 Authentication Specialist
  - 1 Compliance Officer

## Mission Statement
Implement robust, secure authentication and authorization systems while ensuring data protection, privacy compliance, and threat prevention across the entire survey platform.

## Assigned Tickets

### High Priority (Week 1-2)

#### TICKET-008: Multi-Factor Authentication (MFA)
**Description**: Implement comprehensive MFA system with multiple methods
**Acceptance Criteria**:
- TOTP (Time-based One-Time Password) support
- SMS authentication
- Email verification codes
- Backup codes generation
- Recovery mechanisms

**Implementation Details**:
```typescript
// services/auth/mfa.service.ts
import { authenticator } from 'otplib';
import { QRCode } from 'qrcode-generator';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';

export class MFAService {
  private readonly smsService = new SmsService();
  private readonly emailService = new EmailService();

  async setupTOTP(userId: string, email: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    // Generate secret
    const secret = authenticator.generateSecret();
    
    // Generate QR code
    const service = 'Survey App';
    const otpauth = authenticator.keyuri(email, service, secret);
    const qrCode = await this.generateQRCode(otpauth);
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    // Store in database
    await this.storeMFASettings(userId, {
      totpSecret: secret,
      backupCodes: await this.hashBackupCodes(backupCodes),
      isEnabled: false, // Will be enabled after verification
    });

    return { secret, qrCode, backupCodes };
  }

  async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const user = await this.getUserMFASettings(userId);
    if (!user.totpSecret) return false;

    return authenticator.verify({
      token,
      secret: user.totpSecret,
      window: 2, // Allow 2 time steps (60 seconds) variance
    });
  }

  async sendSMSCode(userId: string, phoneNumber: string): Promise<void> {
    const code = this.generateSixDigitCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store code temporarily
    await this.storeTempCode(userId, 'sms', code, expiresAt);

    // Send SMS
    await this.smsService.send(phoneNumber, {
      message: `Your Survey App verification code is: ${code}`,
      template: 'mfa_verification',
    });
  }

  async sendEmailCode(userId: string, email: string): Promise<void> {
    const code = this.generateSixDigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code temporarily
    await this.storeTempCode(userId, 'email', code, expiresAt);

    // Send email
    await this.emailService.send(email, {
      subject: 'Your Survey App Verification Code',
      template: 'mfa_verification',
      data: { code, expiresIn: '10 minutes' },
    });
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await this.getUserMFASettings(userId);
    if (!user.backupCodes) return false;

    for (const hashedCode of user.backupCodes) {
      if (await this.verifyHash(code, hashedCode)) {
        // Remove used backup code
        await this.removeBackupCode(userId, hashedCode);
        return true;
      }
    }

    return false;
  }

  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateRecoveryCode());
    }
    return codes;
  }

  private generateRecoveryCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 7) result += '-'; // Format: XXXXXXXX-XXXXXXXX
    }
    return result;
  }
}
```

```typescript
// controllers/auth/mfa.controller.ts
import { Request, Response } from 'express';
import { MFAService } from '../../services/auth/mfa.service';
import { AuthenticatedRequest } from '../../types/auth';

export class MFAController {
  private mfaService = new MFAService();

  async setupTOTP(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, email } = req.user;
      const result = await this.mfaService.setupTOTP(userId, email);
      
      res.json({
        success: true,
        data: {
          qrCode: result.qrCode,
          backupCodes: result.backupCodes,
          message: 'Scan the QR code with your authenticator app',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to setup TOTP',
      });
    }
  }

  async verifyTOTP(req: AuthenticatedRequest, res: Response) {
    try {
      const { token } = req.body;
      const { userId } = req.user;

      const isValid = await this.mfaService.verifyTOTP(userId, token);
      
      if (isValid) {
        await this.mfaService.enableMFA(userId);
        res.json({
          success: true,
          message: 'MFA enabled successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid verification code',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Verification failed',
      });
    }
  }

  async verifyMFA(req: Request, res: Response) {
    try {
      const { userId, code, method } = req.body;

      let isValid = false;
      
      switch (method) {
        case 'totp':
          isValid = await this.mfaService.verifyTOTP(userId, code);
          break;
        case 'sms':
        case 'email':
          isValid = await this.mfaService.verifyTempCode(userId, method, code);
          break;
        case 'backup':
          isValid = await this.mfaService.verifyBackupCode(userId, code);
          break;
      }

      if (isValid) {
        // Generate session token
        const sessionToken = await this.generateSessionToken(userId);
        res.json({
          success: true,
          token: sessionToken,
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid verification code',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'MFA verification failed',
      });
    }
  }
}
```

#### TICKET-016: Role-Based Access Control (RBAC)
**Description**: Implement comprehensive RBAC system
**Acceptance Criteria**:
- Hierarchical role system
- Permission-based access control
- Dynamic role assignment
- Role inheritance
- Audit logging

**Implementation Details**:
```typescript
// models/auth/Role.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './Permission';
import { User } from '../User';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ type: 'int', default: 0 })
  level: number; // Higher level = more permissions

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: Permission[];

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

```typescript
// models/auth/Permission.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './Role';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'survey:create', 'user:delete', 'analytics:view'

  @Column()
  resource: string; // e.g., 'survey', 'user', 'analytics'

  @Column()
  action: string; // e.g., 'create', 'read', 'update', 'delete'

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

```typescript
// services/auth/rbac.service.ts
import { Repository } from 'typeorm';
import { Role } from '../../models/auth/Role';
import { Permission } from '../../models/auth/Permission';
import { User } from '../../models/User';

export class RBACService {
  constructor(
    private roleRepository: Repository<Role>,
    private permissionRepository: Repository<Permission>,
    private userRepository: Repository<User>
  ) {}

  async checkPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) return false;

    // Check if user has the specific permission through any role
    for (const role of user.roles) {
      if (role.permissions.some(p => p.name === permission)) {
        return true;
      }
    }

    return false;
  }

  async checkMultiplePermissions(
    userId: string, 
    permissions: string[]
  ): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {};
    
    for (const permission of permissions) {
      result[permission] = await this.checkPermission(userId, permission);
    }

    return result;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) return [];

    const permissions = new Set<string>();
    
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        permissions.add(permission.name);
      }
    }

    return Array.from(permissions);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!user || !role) {
      throw new Error('User or role not found');
    }

    // Check if user already has this role
    if (user.roles.some(r => r.id === roleId)) {
      return;
    }

    user.roles.push(role);
    await this.userRepository.save(user);

    // Log the role assignment
    await this.logRoleChange(userId, 'assigned', roleId);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.roles = user.roles.filter(role => role.id !== roleId);
    await this.userRepository.save(user);

    // Log the role removal
    await this.logRoleChange(userId, 'removed', roleId);
  }

  private async logRoleChange(
    userId: string, 
    action: 'assigned' | 'removed', 
    roleId: string
  ): Promise<void> {
    // Implementation for audit logging
    console.log(`Role ${action}: User ${userId}, Role ${roleId}`);
  }
}
```

```typescript
// middleware/auth/permission.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { RBACService } from '../../services/auth/rbac.service';
import { AuthenticatedRequest } from '../../types/auth';

export const requirePermission = (permission: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const rbacService = new RBACService(/* repositories */);
      const hasPermission = await rbacService.checkPermission(req.user.userId, permission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required: permission,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Permission check failed',
      });
    }
  };
};

export const requireAnyPermission = (permissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const rbacService = new RBACService(/* repositories */);
      
      for (const permission of permissions) {
        const hasPermission = await rbacService.checkPermission(req.user.userId, permission);
        if (hasPermission) {
          next();
          return;
        }
      }

      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: permissions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Permission check failed',
      });
    }
  };
};
```

### Medium Priority (Week 3-4)

#### TICKET-023: OAuth Integration
**Description**: Implement OAuth 2.0 for third-party authentication
**Acceptance Criteria**:
- Google OAuth integration
- Microsoft OAuth integration
- GitHub OAuth integration
- Account linking functionality
- Secure token handling

**Implementation Details**:
```typescript
// services/auth/oauth.service.ts
import { OAuth2Client } from 'google-auth-library';
import { AuthorizationCode } from 'simple-oauth2';

export class OAuthService {
  private googleClient: OAuth2Client;
  private microsoftClient: AuthorizationCode;
  private githubClient: AuthorizationCode;

  constructor() {
    this.googleClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    this.microsoftClient = new AuthorizationCode({
      client: {
        id: process.env.MICROSOFT_CLIENT_ID!,
        secret: process.env.MICROSOFT_CLIENT_SECRET!,
      },
      auth: {
        tokenHost: 'https://login.microsoftonline.com',
        tokenPath: '/common/oauth2/v2.0/token',
        authorizePath: '/common/oauth2/v2.0/authorize',
      },
    });

    this.githubClient = new AuthorizationCode({
      client: {
        id: process.env.GITHUB_CLIENT_ID!,
        secret: process.env.GITHUB_CLIENT_SECRET!,
      },
      auth: {
        tokenHost: 'https://github.com',
        tokenPath: '/login/oauth/access_token',
        authorizePath: '/login/oauth/authorize',
      },
    });
  }

  async getGoogleAuthUrl(state: string): Promise<string> {
    return this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      state,
      prompt: 'consent',
    });
  }

  async handleGoogleCallback(code: string): Promise<{
    id: string;
    email: string;
    name: string;
    picture?: string;
  }> {
    const { tokens } = await this.googleClient.getToken(code);
    this.googleClient.setCredentials(tokens);

    const ticket = await this.googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token');
    }

    return {
      id: payload.sub,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture,
    };
  }

  async getMicrosoftAuthUrl(state: string): Promise<string> {
    return this.microsoftClient.authorizeURL({
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
      scope: 'openid profile email',
      state,
    });
  }

  async handleMicrosoftCallback(code: string): Promise<{
    id: string;
    email: string;
    name: string;
  }> {
    const result = await this.microsoftClient.getToken({
      code,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI!,
    });

    const accessToken = result.token.access_token as string;
    
    // Get user profile from Microsoft Graph
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const profile = await response.json();

    return {
      id: profile.id,
      email: profile.mail || profile.userPrincipalName,
      name: profile.displayName,
    };
  }

  async getGitHubAuthUrl(state: string): Promise<string> {
    return this.githubClient.authorizeURL({
      redirect_uri: process.env.GITHUB_REDIRECT_URI!,
      scope: 'user:email',
      state,
    });
  }

  async handleGitHubCallback(code: string): Promise<{
    id: string;
    email: string;
    name: string;
    avatar?: string;
  }> {
    const result = await this.githubClient.getToken({
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI!,
    });

    const accessToken = result.token.access_token as string;

    // Get user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'Survey-App',
      },
    });

    const user = await userResponse.json();

    // Get user email (may be private)
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'Survey-App',
      },
    });

    const emails = await emailResponse.json();
    const primaryEmail = emails.find((email: any) => email.primary)?.email;

    return {
      id: user.id.toString(),
      email: primaryEmail || user.email,
      name: user.name || user.login,
      avatar: user.avatar_url,
    };
  }
}
```

#### TICKET-030: Security Audit Logging
**Description**: Implement comprehensive security audit trail
**Acceptance Criteria**:
- Authentication events logging
- Authorization failures tracking
- Data access logging
- Suspicious activity detection
- Compliance reporting

**Implementation Details**:
```typescript
// services/audit/audit.service.ts
import { Repository } from 'typeorm';
import { AuditLog } from '../../models/audit/AuditLog';

export enum AuditEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REMOVED = 'role_removed',
  PERMISSION_DENIED = 'permission_denied',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ACCOUNT_LOCKED = 'account_locked',
  PASSWORD_RESET = 'password_reset',
}

export interface AuditContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: Record<string, any>;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export class AuditService {
  constructor(private auditRepository: Repository<AuditLog>) {}

  async log(
    eventType: AuditEventType,
    context: AuditContext,
    success: boolean = true
  ): Promise<void> {
    const auditLog = new AuditLog();
    auditLog.eventType = eventType;
    auditLog.userId = context.userId;
    auditLog.sessionId = context.sessionId;
    auditLog.ipAddress = context.ipAddress;
    auditLog.userAgent = context.userAgent;
    auditLog.resource = context.resource;
    auditLog.action = context.action;
    auditLog.success = success;
    auditLog.details = context.details;
    auditLog.riskLevel = context.riskLevel || 'low';
    auditLog.timestamp = new Date();

    await this.auditRepository.save(auditLog);

    // Check for suspicious patterns
    if (context.riskLevel === 'high' || context.riskLevel === 'critical') {
      await this.handleSuspiciousActivity(auditLog);
    }
  }

  async getAuditTrail(
    filters: {
      userId?: string;
      eventType?: AuditEventType;
      startDate?: Date;
      endDate?: Date;
      riskLevel?: string;
    },
    pagination: { page: number; limit: number }
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const query = this.auditRepository.createQueryBuilder('audit');

    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.eventType) {
      query.andWhere('audit.eventType = :eventType', { eventType: filters.eventType });
    }

    if (filters.startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('audit.timestamp <= :endDate', { endDate: filters.endDate });
    }

    if (filters.riskLevel) {
      query.andWhere('audit.riskLevel = :riskLevel', { riskLevel: filters.riskLevel });
    }

    query.orderBy('audit.timestamp', 'DESC');
    query.skip((pagination.page - 1) * pagination.limit);
    query.take(pagination.limit);

    const [logs, total] = await query.getManyAndCount();

    return { logs, total };
  }

  async detectSuspiciousActivity(userId: string): Promise<boolean> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check for multiple failed login attempts
    const failedLogins = await this.auditRepository.count({
      where: {
        userId,
        eventType: AuditEventType.LOGIN_FAILURE,
        timestamp: { $gte: oneDayAgo } as any,
      },
    });

    if (failedLogins >= 5) {
      await this.log(AuditEventType.SUSPICIOUS_ACTIVITY, {
        userId,
        details: { reason: 'Multiple failed login attempts', count: failedLogins },
        riskLevel: 'high',
      });
      return true;
    }

    // Check for access from multiple IPs in short time
    const recentLogs = await this.auditRepository.find({
      where: {
        userId,
        eventType: AuditEventType.LOGIN_SUCCESS,
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } as any, // Last hour
      },
      select: ['ipAddress'],
    });

    const uniqueIPs = new Set(recentLogs.map(log => log.ipAddress));
    if (uniqueIPs.size >= 3) {
      await this.log(AuditEventType.SUSPICIOUS_ACTIVITY, {
        userId,
        details: { reason: 'Multiple IP addresses', count: uniqueIPs.size },
        riskLevel: 'medium',
      });
      return true;
    }

    return false;
  }

  private async handleSuspiciousActivity(auditLog: AuditLog): Promise<void> {
    // Send alert to security team
    console.log('SECURITY ALERT:', auditLog);
    
    // Additional actions based on risk level
    if (auditLog.riskLevel === 'critical') {
      // Lock account temporarily
      // Send immediate notification
      // Trigger incident response
    }
  }
}
```

### Low Priority (Week 5-6)

#### TICKET-037: Session Management
**Description**: Advanced session management and security
**Acceptance Criteria**:
- Concurrent session control
- Session timeout handling
- Device management
- Session hijacking prevention
- Remember me functionality

**Implementation Details**:
```typescript
// services/auth/session.service.ts
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';

export interface SessionData {
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isRememberMe: boolean;
}

export class SessionService {
  constructor(
    private redisService: RedisService,
    private jwtService: JwtService
  ) {}

  async createSession(
    userId: string,
    deviceId: string,
    ipAddress: string,
    userAgent: string,
    rememberMe: boolean = false
  ): Promise<string> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expirationTime = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day

    const sessionData: SessionData = {
      userId,
      deviceId,
      ipAddress,
      userAgent,
      createdAt: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + expirationTime),
      isRememberMe: rememberMe,
    };

    // Store session in Redis
    await this.redisService.setex(
      `session:${sessionId}`,
      Math.floor(expirationTime / 1000),
      JSON.stringify(sessionData)
    );

    // Add to user's active sessions
    await this.redisService.sadd(`user_sessions:${userId}`, sessionId);

    // Enforce concurrent session limit
    await this.enforceConcurrentSessionLimit(userId);

    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await this.redisService.get(`session:${sessionId}`);
    if (!data) return null;

    const sessionData: SessionData = JSON.parse(data);

    // Check if session is expired
    if (new Date() > new Date(sessionData.expiresAt)) {
      await this.destroySession(sessionId);
      return null;
    }

    return sessionData;
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    const sessionData = await this.getSession(sessionId);
    if (!sessionData) return;

    sessionData.lastActivity = new Date();

    const ttl = await this.redisService.ttl(`session:${sessionId}`);
    await this.redisService.setex(
      `session:${sessionId}`,
      ttl,
      JSON.stringify(sessionData)
    );
  }

  async destroySession(sessionId: string): Promise<void> {
    const sessionData = await this.getSession(sessionId);
    if (sessionData) {
      // Remove from user's active sessions
      await this.redisService.srem(`user_sessions:${sessionData.userId}`, sessionId);
    }

    // Remove session data
    await this.redisService.del(`session:${sessionId}`);
  }

  async destroyAllUserSessions(userId: string, excludeSessionId?: string): Promise<void> {
    const sessionIds = await this.redisService.smembers(`user_sessions:${userId}`);

    for (const sessionId of sessionIds) {
      if (sessionId !== excludeSessionId) {
        await this.destroySession(sessionId);
      }
    }
  }

  async getUserActiveSessions(userId: string): Promise<SessionData[]> {
    const sessionIds = await this.redisService.smembers(`user_sessions:${userId}`);
    const sessions: SessionData[] = [];

    for (const sessionId of sessionIds) {
      const sessionData = await this.getSession(sessionId);
      if (sessionData) {
        sessions.push(sessionData);
      }
    }

    return sessions.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }

  private async enforceConcurrentSessionLimit(userId: string): Promise<void> {
    const maxConcurrentSessions = 5;
    const sessionIds = await this.redisService.smembers(`user_sessions:${userId}`);

    if (sessionIds.length > maxConcurrentSessions) {
      // Get all sessions with their data
      const sessionsWithData: Array<{ id: string; data: SessionData }> = [];

      for (const sessionId of sessionIds) {
        const sessionData = await this.getSession(sessionId);
        if (sessionData) {
          sessionsWithData.push({ id: sessionId, data: sessionData });
        }
      }

      // Sort by last activity (oldest first)
      sessionsWithData.sort((a, b) => 
        new Date(a.data.lastActivity).getTime() - new Date(b.data.lastActivity).getTime()
      );

      // Remove oldest sessions
      const sessionsToRemove = sessionsWithData.slice(0, sessionIds.length - maxConcurrentSessions);
      for (const session of sessionsToRemove) {
        await this.destroySession(session.id);
      }
    }
  }

  private generateSessionId(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}
```

#### TICKET-044: Data Encryption
**Description**: Implement end-to-end data encryption
**Acceptance Criteria**:
- Field-level encryption for sensitive data
- Key rotation management
- Encryption at rest
- Secure key storage
- Performance optimization

**Implementation Details**:
```typescript
// services/encryption/encryption.service.ts
import { createCipher, createDecipher, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  async encryptField(data: string, key: Buffer): Promise<string> {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('survey-app'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Combine IV, tag, and encrypted data
    const result = iv.toString('hex') + tag.toString('hex') + encrypted;
    return result;
  }

  async decryptField(encryptedData: string, key: Buffer): Promise<string> {
    // Extract IV, tag, and encrypted data
    const iv = Buffer.from(encryptedData.slice(0, this.ivLength * 2), 'hex');
    const tag = Buffer.from(encryptedData.slice(this.ivLength * 2, (this.ivLength + this.tagLength) * 2), 'hex');
    const encrypted = encryptedData.slice((this.ivLength + this.tagLength) * 2);

    const decipher = createDecipher(this.algorithm, key);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('survey-app'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async generateKey(password: string, salt: Buffer): Promise<Buffer> {
    return (await scryptAsync(password, salt, this.keyLength)) as Buffer;
  }

  generateSalt(): Buffer {
    return randomBytes(16);
  }

  async rotateKeys(): Promise<void> {
    // Implementation for key rotation
    // This would involve:
    // 1. Generate new encryption key
    // 2. Re-encrypt all sensitive data with new key
    // 3. Update key storage
    // 4. Remove old key after verification
  }
}
```

## Integration Points

### With Infrastructure Team (Group 1)
- JWT token management in API Gateway
- SSL/TLS certificate management
- Rate limiting for auth endpoints
- Session storage in Redis cluster

### With UI/UX Team (Group 2)
- Login/registration form components
- MFA setup interfaces
- Session timeout warnings
- Permission-based UI rendering

### With Survey Features Team (Group 4)
- Survey access control
- Response anonymization
- Sharing permissions
- Data privacy controls

### With Analytics Team (Group 5)
- Audit log analytics
- Security metrics dashboards
- Compliance reporting
- User behavior analysis

## Technical Specifications

### Security Framework
- **Authentication**: JWT with RS256 signing
- **Session Management**: Redis-based sessions
- **Password Security**: Argon2id hashing
- **MFA**: TOTP, SMS, Email verification
- **OAuth**: Google, Microsoft, GitHub

### Compliance Requirements
- **GDPR**: Data protection and privacy
- **SOC 2**: Security controls
- **ISO 27001**: Information security management
- **CCPA**: California consumer privacy

### Security Tools
- **Vulnerability Scanning**: OWASP ZAP
- **Dependency Scanning**: Snyk
- **SAST**: SonarQube Security
- **Secrets Management**: HashiCorp Vault
- **Monitoring**: Splunk Security

## Weekly Progress Management

### Week 1-2: Core Authentication
- [ ] Implement MFA system with TOTP and SMS
- [ ] Set up RBAC with permissions
- [ ] Configure OAuth providers
- [ ] Create audit logging framework

### Week 3-4: Advanced Security
- [ ] Implement session management
- [ ] Set up data encryption
- [ ] Configure security monitoring
- [ ] Create compliance reports

### Week 5-6: Testing & Hardening
- [ ] Conduct penetration testing
- [ ] Perform security audit
- [ ] Optimize performance
- [ ] Complete documentation

## Success Metrics
- **Security**: Zero critical vulnerabilities
- **Authentication**: 99.9% uptime for auth services
- **MFA Adoption**: 80% of users enable MFA
- **Audit**: 100% security events logged
- **Compliance**: Pass all required audits

## Resources & Documentation
- [Security Architecture](https://security.surveyapp.com)
- [Authentication API Docs](https://api.surveyapp.com/auth)
- [Compliance Dashboard](https://compliance.surveyapp.com)
- [Security Playbooks](https://playbooks.surveyapp.com)