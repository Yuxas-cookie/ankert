'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSurveyPermissions } from '@/lib/hooks/useSurveyPermissions'
import { createSurveyPermissionSchema, type CreateSurveyPermissionInput, type SurveyPermissionType } from '@/lib/validations/survey-permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Eye, EyeOff } from 'lucide-react'

interface SurveyAccessControlProps {
  surveyId: string
  isOwner?: boolean
}

const permissionTypeLabels: Record<SurveyPermissionType, string> = {
  public: '一般公開',
  url_access: 'URLを知っている人のみ',
  authenticated: 'ログインユーザーのみ',
  restricted: '特定ユーザーのみ'
}

const permissionTypeDescriptions: Record<SurveyPermissionType, string> = {
  public: '誰でも回答できます',
  url_access: 'URLを知っている人なら誰でも回答できます',
  authenticated: 'アカウントを持っているユーザーのみ回答できます',
  restricted: '指定されたメールアドレスのユーザーのみ回答できます'
}

export function SurveyAccessControl({ surveyId, isOwner = true }: SurveyAccessControlProps) {
  const [showForm, setShowForm] = useState(false)
  const [emailList, setEmailList] = useState('')
  const { permissions, loading, error, createPermission, deletePermission } = useSurveyPermissions(surveyId)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CreateSurveyPermissionInput>({
    resolver: zodResolver(createSurveyPermissionSchema),
    defaultValues: {
      survey_id: surveyId,
      permission_type: 'public'
    }
  })

  const permissionType = watch('permission_type')
  const startDate = watch('start_date')
  const endDate = watch('end_date')

  const onSubmit = async (data: CreateSurveyPermissionInput) => {
    const formData = {
      ...data,
      allowed_emails: data.permission_type === 'restricted' && emailList 
        ? emailList.split('\n').map(email => email.trim()).filter(email => email)
        : undefined
    }

    const { error } = await createPermission(formData)
    
    if (!error) {
      setShowForm(false)
      reset()
      setEmailList('')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('この権限設定を削除しますか？')) {
      await deletePermission(id)
    }
  }

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            アクセス権限
          </CardTitle>
          <CardDescription>
            このアンケートのアクセス設定を表示しています
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <p className="text-sm text-gray-500">アクセス権限が設定されていません</p>
          ) : (
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{permissionTypeLabels[permission.permission_type]}</div>
                  <div className="text-sm text-gray-500">{permissionTypeDescriptions[permission.permission_type]}</div>
                  {permission.start_date && permission.end_date && (
                    <div className="text-xs text-gray-400 mt-1">
                      公開期間: {new Date(permission.start_date).toLocaleDateString()} 〜 {new Date(permission.end_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EyeOff className="h-5 w-5" />
          アクセス権限管理
        </CardTitle>
        <CardDescription>
          アンケートの公開設定とアクセス制御を管理できます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 既存の権限設定一覧 */}
        <div className="space-y-3">
          <h4 className="font-medium">現在の設定</h4>
          {permissions.length === 0 ? (
            <p className="text-sm text-gray-500">アクセス権限が設定されていません</p>
          ) : (
            permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{permissionTypeLabels[permission.permission_type]}</div>
                  <div className="text-sm text-gray-500">{permissionTypeDescriptions[permission.permission_type]}</div>
                  {permission.start_date && permission.end_date && (
                    <div className="text-xs text-gray-400 mt-1">
                      公開期間: {new Date(permission.start_date).toLocaleDateString()} 〜 {new Date(permission.end_date).toLocaleDateString()}
                    </div>
                  )}
                  {permission.allowed_emails && permission.allowed_emails.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      許可ユーザー: {permission.allowed_emails.length}名
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(permission.id!)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* 新規設定追加フォーム */}
        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="permission_type">アクセス範囲</Label>
              <Select
                value={permissionType}
                onValueChange={(value: SurveyPermissionType) => setValue('permission_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(permissionTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {permissionTypeDescriptions[permissionType]}
              </p>
            </div>

            {(permissionType === 'url_access' || permissionType === 'authenticated') && (
              <div className="space-y-2">
                <Label htmlFor="password">パスワード保護（任意）</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワードを設定する場合は入力"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}

            {permissionType === 'restricted' && (
              <div className="space-y-2">
                <Label htmlFor="allowed_emails">許可するメールアドレス</Label>
                <Textarea
                  id="allowed_emails"
                  placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                  value={emailList}
                  onChange={(e) => setEmailList(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  1行に1つのメールアドレスを入力してください
                </p>
                {errors.allowed_emails && (
                  <p className="text-sm text-red-500">{errors.allowed_emails.message}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">公開開始日（任意）</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  {...register('start_date', { valueAsDate: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">公開終了日（任意）</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  {...register('end_date', { valueAsDate: true })}
                />
              </div>
            </div>
            {errors.end_date && (
              <p className="text-sm text-red-500">{errors.end_date.message}</p>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                設定を追加
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                キャンセル
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setShowForm(true)}>
            新しいアクセス設定を追加
          </Button>
        )}
      </CardContent>
    </Card>
  )
}