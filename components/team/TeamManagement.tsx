'use client'

import React, { useState } from 'react'
import { useRBAC, useTeamMembers } from '@/lib/hooks/useRBAC'
import { ACTIONS, RESOURCES, Role } from '@/types/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MoreHorizontal, UserPlus, Shield, Users } from 'lucide-react'

interface TeamManagementProps {
  resourceId: string
  resourceType?: string
}

const roleLabels: Record<Role, string> = {
  owner: 'オーナー',
  admin: '管理者',
  editor: '編集者',
  viewer: '閲覧者',
  respondent: '回答者',
}

const roleColors: Record<Role, string> = {
  owner: 'destructive',
  admin: 'default',
  editor: 'secondary',
  viewer: 'outline',
  respondent: 'outline',
}

export function TeamManagement({ resourceId, resourceType = 'survey' }: TeamManagementProps) {
  const { canDo, role: currentUserRole } = useRBAC({ resourceId, resourceType })
  const { members, loading, error, addMember, updateMemberRole, removeMember } = useTeamMembers(resourceId)
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<Role>('viewer')
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const canManageTeam = canDo(ACTIONS.INVITE_MEMBER, RESOURCES.TEAM)
  const canUpdateRoles = canDo(ACTIONS.UPDATE_MEMBER_ROLE, RESOURCES.TEAM)
  const canRemoveMembers = canDo(ACTIONS.REMOVE_MEMBER, RESOURCES.TEAM)

  const handleAddMember = async () => {
    if (!newMemberEmail) return

    setIsAddingMember(true)
    setAddError(null)

    try {
      const success = await addMember(newMemberEmail, newMemberRole)
      if (success) {
        setIsAddDialogOpen(false)
        setNewMemberEmail('')
        setNewMemberRole('viewer')
      } else {
        setAddError('メンバーの追加に失敗しました。メールアドレスを確認してください。')
      }
    } catch (err) {
      setAddError('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    await updateMemberRole(userId, newRole)
  }

  const handleRemoveMember = async (userId: string) => {
    if (confirm('このメンバーを削除してもよろしいですか？')) {
      await removeMember(userId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}
          {error.includes('survey_collaborators') && (
            <div className="mt-2 text-sm">
              チーム機能を使用するには、データベースの更新が必要です。
              管理者にお問い合わせください。
            </div>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-medium">チームメンバー</h3>
          <Badge variant="secondary">{members.length}人</Badge>
        </div>

        {canManageTeam && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                メンバーを追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいメンバーを追加</DialogTitle>
                <DialogDescription>
                  メールアドレスとロールを指定して、新しいメンバーを追加します。
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {addError && (
                  <Alert variant="destructive">
                    <AlertDescription>{addError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    disabled={isAddingMember}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">ロール</Label>
                  <Select
                    value={newMemberRole}
                    onValueChange={(value) => setNewMemberRole(value as Role)}
                    disabled={isAddingMember}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">管理者</SelectItem>
                      <SelectItem value="editor">編集者</SelectItem>
                      <SelectItem value="viewer">閲覧者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isAddingMember}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={isAddingMember || !newMemberEmail}
                >
                  {isAddingMember ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      追加中...
                    </>
                  ) : (
                    '追加'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>メンバー</TableHead>
            <TableHead>ロール</TableHead>
            <TableHead>参加日</TableHead>
            <TableHead className="text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isCurrentUser = member.role === currentUserRole
            const canEditThisMember = canUpdateRoles && !isCurrentUser && member.role !== 'owner'
            const canRemoveThisMember = canRemoveMembers && !isCurrentUser && member.role !== 'owner'

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>
                        {member.name?.[0] || member.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.name || member.email}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-muted-foreground">(あなた)</span>
                        )}
                      </div>
                      {member.name && (
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {member.role === 'owner' && <Shield className="h-4 w-4" />}
                    <Badge variant={roleColors[member.role] as any}>
                      {roleLabels[member.role]}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(member.joined_at).toLocaleDateString('ja-JP')}
                </TableCell>
                <TableCell className="text-right">
                  {(canEditThisMember || canRemoveThisMember) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEditThisMember && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.user_id, 'admin')}
                              disabled={member.role === 'admin'}
                            >
                              管理者に変更
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.user_id, 'editor')}
                              disabled={member.role === 'editor'}
                            >
                              編集者に変更
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.user_id, 'viewer')}
                              disabled={member.role === 'viewer'}
                            >
                              閲覧者に変更
                            </DropdownMenuItem>
                          </>
                        )}
                        {canEditThisMember && canRemoveThisMember && (
                          <DropdownMenuSeparator />
                        )}
                        {canRemoveThisMember && (
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="text-destructive"
                          >
                            メンバーを削除
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}