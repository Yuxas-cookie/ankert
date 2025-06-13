const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestResponses() {
  try {
    // Get a test survey
    const { data: surveys, error: surveyError } = await supabase
      .from('surveys')
      .select('*, questions(*)')
      .limit(1);

    if (surveyError) {
      console.error('Error fetching survey:', surveyError);
      return;
    }

    if (!surveys || surveys.length === 0) {
      console.log('No surveys found. Please create a survey first.');
      return;
    }

    const survey = surveys[0];
    console.log(`Creating test responses for survey: ${survey.title}`);

    // Create 50 test responses
    const numResponses = 50;
    const responses = [];

    for (let i = 0; i < numResponses; i++) {
      // Create response data based on question types
      const responseData = {};
      
      survey.questions.forEach(question => {
        switch (question.question_type) {
          case 'single_choice':
          case 'multiple_choice':
            const options = question.options || ['選択肢1', '選択肢2', '選択肢3'];
            if (question.question_type === 'single_choice') {
              responseData[question.id] = options[Math.floor(Math.random() * options.length)];
            } else {
              // Multiple choice - select 1-3 options
              const numSelections = Math.floor(Math.random() * 3) + 1;
              const selected = [];
              for (let j = 0; j < numSelections; j++) {
                const option = options[Math.floor(Math.random() * options.length)];
                if (!selected.includes(option)) {
                  selected.push(option);
                }
              }
              responseData[question.id] = selected;
            }
            break;
          
          case 'text':
            const textResponses = [
              'とても良いサービスだと思います。',
              '改善の余地があると感じました。',
              '期待以上の体験でした。',
              '普通でした。',
              '素晴らしい経験でした！'
            ];
            responseData[question.id] = textResponses[Math.floor(Math.random() * textResponses.length)];
            break;
          
          case 'rating':
            responseData[question.id] = Math.floor(Math.random() * 5) + 1;
            break;
          
          case 'date':
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            responseData[question.id] = date.toISOString().split('T')[0];
            break;
          
          default:
            responseData[question.id] = `Sample response ${i + 1}`;
        }
      });

      // Create response record
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - Math.floor(Math.random() * 30));
      startTime.setHours(Math.floor(Math.random() * 24));
      startTime.setMinutes(Math.floor(Math.random() * 60));

      const completionTime = Math.floor(Math.random() * 600) + 60; // 1-11 minutes
      const endTime = new Date(startTime.getTime() + completionTime * 1000);

      const response = {
        survey_id: survey.id,
        response_data: responseData,
        status: Math.random() > 0.1 ? 'completed' : 'in_progress',
        started_at: startTime.toISOString(),
        completed_at: Math.random() > 0.1 ? endTime.toISOString() : null,
        submitted_at: Math.random() > 0.1 ? endTime.toISOString() : null,
        user_agent: `Mozilla/5.0 (${Math.random() > 0.5 ? 'Windows' : 'Mac'}) Test Browser`,
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        created_at: startTime.toISOString()
      };

      responses.push(response);
    }

    // Insert responses in batches
    const batchSize = 10;
    for (let i = 0; i < responses.length; i += batchSize) {
      const batch = responses.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('survey_responses')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} responses)`);
      }
    }

    console.log(`\nSuccessfully created ${responses.length} test responses for survey "${survey.title}"`);
    console.log(`Survey ID: ${survey.id}`);
    console.log('\nYou can now view the responses at:');
    console.log(`http://localhost:3002/surveys/${survey.id}/responses`);

  } catch (error) {
    console.error('Error creating test responses:', error);
  }
}

createTestResponses();