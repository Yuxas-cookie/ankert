import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          パスワードリセット
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          登録済みのメールアドレスを入力してください
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  )
}