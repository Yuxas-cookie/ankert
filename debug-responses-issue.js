// Debug responses issue for survey fc4fd802-d642-4ca1-b9d7-efdb67729b4f

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const surveyId = 'fc4fd802-d642-4ca1-b9d7-efdb67729b4f'
const userId = '844d8977-8a85-4e52-9881-92ff28995763' // gungamwing@gmail.com

console.log('🔍 Debugging Responses Issue\n')

async function debugResponses() {
  console.log('📝 Step 1: Verify Survey Ownership')
  console.log('=====================================\n')

  try {
    // Check survey details
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single()

    if (surveyError) {
      console.error('❌ Survey fetch error:', surveyError)
      return
    }

    console.log('Survey Details:')
    console.log(`- Title: ${survey.title}`)
    console.log(`- ID: ${survey.id}`)
    console.log(`- Owner ID: ${survey.user_id}`)
    console.log(`- Status: ${survey.status}`)
    console.log(`- Created: ${new Date(survey.created_at).toLocaleString('ja-JP')}`)
    console.log(`- Is Public: ${survey.is_public}`)
    
    if (survey.user_id === userId) {
      console.log('\n✅ Survey is owned by gungamwing@gmail.com')
    } else {
      console.log('\n❌ Survey is NOT owned by gungamwing@gmail.com')
      console.log(`   Actual owner: ${survey.user_id}`)
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }

  console.log('\n=====================================\n')
  console.log('📝 Step 2: Check Responses')
  console.log('=====================================\n')

  try {
    // Get all responses for this survey
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select(`
        *,
        answers (
          question_id,
          answer_text,
          answer_value
        )
      `)
      .eq('survey_id', surveyId)
      .order('completed_at', { ascending: false })

    if (responsesError) {
      console.error('❌ Responses fetch error:', responsesError)
      return
    }

    console.log(`✅ Found ${responses.length} responses`)
    
    if (responses.length > 0) {
      console.log('\nLatest 3 responses:')
      responses.slice(0, 3).forEach((response, index) => {
        console.log(`\n${index + 1}. Response ID: ${response.id}`)
        console.log(`   Status: ${response.is_complete ? 'Completed' : 'In Progress'}`)
        console.log(`   Submitted: ${response.completed_at ? new Date(response.completed_at).toLocaleString('ja-JP') : 'Not submitted'}`)
        console.log(`   Answers: ${response.answers ? response.answers.length : 0}`)
        if (response.user_id) {
          console.log(`   User ID: ${response.user_id}`)
        }
      })
    } else {
      console.log('\n⚠️  No responses found for this survey')
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }

  console.log('\n=====================================\n')
  console.log('📝 Step 3: Test RLS Policies')
  console.log('=====================================\n')

  try {
    // Create a client with the user's context
    const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Simulate user context by setting auth header
    console.log('Testing as anonymous user (simulating client-side fetch)...')
    
    const { data: anonResponses, error: anonError } = await userClient
      .from('responses')
      .select('*')
      .eq('survey_id', surveyId)

    if (anonError) {
      console.log('❌ Anonymous access denied (expected):', anonError.message)
    } else {
      console.log(`⚠️  Anonymous user can see ${anonResponses.length} responses (unexpected)`)
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }

  console.log('\n=====================================\n')
  console.log('📝 Step 4: Check Survey Questions')
  console.log('=====================================\n')

  try {
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order_index')

    if (questionsError) {
      console.error('❌ Questions fetch error:', questionsError)
      return
    }

    console.log(`✅ Found ${questions.length} questions`)
    questions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.question_text} (${q.question_type})`)
    })

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }

  console.log('\n=====================================\n')
  console.log('🎯 Summary and Recommendations')
  console.log('=====================================\n')
  
  console.log('To view responses in the app:')
  console.log('1. Make sure you are logged in as gungamwing@gmail.com')
  console.log('2. Navigate to: http://localhost:3002/surveys/fc4fd802-d642-4ca1-b9d7-efdb67729b4f/responses')
  console.log('3. If you still see "まだ回答がありません", check:')
  console.log('   - Browser console for errors')
  console.log('   - Network tab for failed API requests')
  console.log('   - Make sure the development server is running (npm run dev)')
  console.log('\nAPI Endpoint to test:')
  console.log(`GET http://localhost:3002/api/surveys/${surveyId}/responses`)
  console.log('(Must be authenticated as gungamwing@gmail.com)')
}

// Run debug
debugResponses();