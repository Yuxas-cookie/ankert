// Script to test and fix survey access issues

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSurveyAccess() {
  console.log('🔍 Testing survey access...\n')

  try {
    // Get all surveys (using service role key bypasses RLS)
    const { data: surveys, error: surveysError } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })

    if (surveysError) {
      console.error('❌ Error fetching surveys:', surveysError)
      return
    }

    console.log(`📊 Found ${surveys.length} surveys total\n`)

    // Display surveys with their user IDs
    surveys.forEach(survey => {
      console.log(`📄 Survey: ${survey.title}`)
      console.log(`   ID: ${survey.id}`)
      console.log(`   User ID: ${survey.user_id}`)
      console.log(`   Status: ${survey.status}`)
      console.log(`   Created: ${new Date(survey.created_at).toLocaleString()}\n`)
    })

    // Check users
    console.log('👥 Checking users...\n')
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      
    if (usersError) {
      console.error('❌ Error fetching profiles:', usersError)
    } else {
      console.log(`Found ${users.length} users:`)
      users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
      })
    }

    // Check auth users
    console.log('\n🔐 Checking auth users...\n')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
    } else {
      console.log(`Found ${authUsers.users.length} auth users:`)
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
      })
    }

    // Check for mismatches
    console.log('\n🔍 Checking for user ID mismatches...\n')
    
    const authUserIds = authUsers?.users.map(u => u.id) || []
    const profileIds = users?.map(u => u.id) || []
    
    surveys.forEach(survey => {
      const inAuth = authUserIds.includes(survey.user_id)
      const inProfiles = profileIds.includes(survey.user_id)
      
      if (!inAuth || !inProfiles) {
        console.log(`⚠️  Survey "${survey.title}" has issues:`)
        console.log(`   - User ID: ${survey.user_id}`)
        console.log(`   - In auth.users: ${inAuth ? '✅' : '❌'}`)
        console.log(`   - In profiles: ${inProfiles ? '✅' : '❌'}\n`)
      }
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testSurveyAccess()