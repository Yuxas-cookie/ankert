const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabase Admin Client（Service Role Key使用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// テストユーザーのデータ
const testUsers = [
  {
    email: 'test@example.com',
    password: 'Test1234!',
    fullName: 'テストユーザー',
    role: 'respondent'
  },
  {
    email: 'admin@example.com',
    password: 'Admin1234!',
    fullName: '管理者テスト',
    role: 'admin'
  },
  {
    email: 'viewer@example.com',
    password: 'Viewer1234!',
    fullName: '閲覧者テスト',
    role: 'viewer'
  }
]

async function createTestUsers() {
  console.log('🚀 テストユーザーの作成を開始します...\n')

  for (const user of testUsers) {
    try {
      console.log(`📝 ユーザー作成中: ${user.email}`)

      // 1. ユーザーを作成（メール確認をスキップ）
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // メール確認をスキップ
        user_metadata: {
          full_name: user.fullName
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  ${user.email} は既に登録されています`)
          continue
        }
        throw authError
      }

      console.log(`✅ ユーザー作成成功: ${user.email}`)
      console.log(`   ID: ${authData.user.id}`)
      console.log(`   パスワード: ${user.password}`)

      // 2. プロファイルが自動作成されているか確認
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profile) {
        console.log(`✅ プロファイル確認: 自動作成済み`)
      } else {
        console.log(`⚠️  プロファイルが見つかりません（次回ログイン時に作成されます）`)
      }

      console.log('')
    } catch (error) {
      console.error(`❌ エラー (${user.email}):`, error.message)
      console.log('')
    }
  }

  console.log('\n✨ テストユーザーの作成が完了しました！')
  console.log('\n📋 作成されたテストアカウント:')
  console.log('┌─────────────────────────┬──────────────┬─────────────┐')
  console.log('│ メールアドレス          │ パスワード   │ ロール      │')
  console.log('├─────────────────────────┼──────────────┼─────────────┤')
  testUsers.forEach(user => {
    console.log(`│ ${user.email.padEnd(23)} │ ${user.password.padEnd(12)} │ ${user.role.padEnd(11)} │`)
  })
  console.log('└─────────────────────────┴──────────────┴─────────────┘')
  console.log('\n🔐 これらのアカウントでログインできます: http://localhost:3000/login')
}

// スクリプトを実行
createTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 致命的なエラー:', error)
    process.exit(1)
  })