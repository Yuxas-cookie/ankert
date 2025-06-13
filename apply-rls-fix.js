// Direct SQL execution to fix RLS policies

require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

// Extract project ref from URL
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1]

console.log('🔧 Applying RLS fixes to project:', PROJECT_REF)

const sqlStatements = [
  // Drop existing policies
  `DROP POLICY IF EXISTS "Users can view their own surveys" ON surveys;`,
  `DROP POLICY IF EXISTS "Users can create surveys" ON surveys;`,
  `DROP POLICY IF EXISTS "Users can update their own surveys" ON surveys;`,
  `DROP POLICY IF EXISTS "Users can delete their own surveys" ON surveys;`,
  
  // Create new policies
  `CREATE POLICY "Users can view their own surveys"
    ON surveys
    FOR SELECT
    USING (auth.uid() = user_id);`,
    
  `CREATE POLICY "Users can create surveys"
    ON surveys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);`,
    
  `CREATE POLICY "Users can update their own surveys"
    ON surveys
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);`,
    
  `CREATE POLICY "Users can delete their own surveys"
    ON surveys
    FOR DELETE
    USING (auth.uid() = user_id);`
]

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      query: sql
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SQL execution failed: ${error}`)
  }
}

async function applyFixes() {
  console.log('🚀 Starting RLS policy fixes...\n')

  for (const sql of sqlStatements) {
    try {
      console.log('Executing:', sql.substring(0, 50) + '...')
      await executeSql(sql)
      console.log('✅ Success\n')
    } catch (error) {
      console.error('❌ Failed:', error.message, '\n')
    }
  }

  console.log('✨ RLS fixes completed!')
}

// Alternative approach using fetch directly to the database REST API
async function directApproach() {
  console.log('\n🔄 Trying direct approach...')
  
  // Get all surveys to verify access
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/surveys?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    })
    
    const surveys = await response.json()
    console.log(`\n📊 Found ${surveys.length} surveys in total`)
    
    // Group by user
    const userSurveys = surveys.reduce((acc, survey) => {
      acc[survey.user_id] = (acc[survey.user_id] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📈 Surveys per user:')
    Object.entries(userSurveys).forEach(([userId, count]) => {
      console.log(`   User ${userId}: ${count} surveys`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run both approaches
applyFixes().then(() => directApproach())