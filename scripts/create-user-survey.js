#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSurveyForUser(userEmail) {
  try {
    // Find the user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (userError || !users) {
      throw new Error(`User not found: ${userEmail}`);
    }

    console.log(`Creating survey for user: ${users.email}`);

    // Create survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .insert({
        title: 'カスタマー満足度調査',
        description: 'お客様の貴重なご意見をお聞かせください。より良いサービス提供のために活用させていただきます。',
        created_by: users.id,
        is_public: true,
        theme: {
          primaryColor: '#5E5CE6',
          backgroundColor: '#ffffff',
          fontFamily: 'system-ui'
        }
      })
      .select()
      .single();

    if (surveyError) {
      throw new Error(`Failed to create survey: ${surveyError.message}`);
    }

    console.log(`✓ Survey created: ${survey.title} (ID: ${survey.id})`);

    // Create questions
    const questions = [
      {
        survey_id: survey.id,
        title: '当社のサービスに対する総合的な満足度はいかがですか？',
        type: 'single_choice',
        required: true,
        order: 1
      },
      {
        survey_id: survey.id,
        title: '改善を希望する分野を選んでください（複数選択可）',
        type: 'multiple_choice',
        required: true,
        order: 2
      },
      {
        survey_id: survey.id,
        title: 'サービスの利用頻度を教えてください',
        type: 'single_choice',
        required: true,
        order: 3
      },
      {
        survey_id: survey.id,
        title: '友人や同僚に当社のサービスを勧める可能性はどの程度ですか？',
        type: 'rating',
        required: true,
        order: 4,
        validation: {
          min: 0,
          max: 10
        }
      },
      {
        survey_id: survey.id,
        title: 'その他、ご意見・ご要望をお聞かせください',
        type: 'text',
        required: false,
        order: 5,
        validation: {
          maxLength: 500
        }
      }
    ];

    const { data: createdQuestions, error: questionsError } = await supabase
      .from('questions')
      .insert(questions)
      .select();

    if (questionsError) {
      throw new Error(`Failed to create questions: ${questionsError.message}`);
    }

    console.log(`✓ Created ${createdQuestions.length} questions`);

    // Create options for questions
    const options = [
      // Question 1 options
      { question_id: createdQuestions[0].id, text: '非常に満足', order: 1 },
      { question_id: createdQuestions[0].id, text: '満足', order: 2 },
      { question_id: createdQuestions[0].id, text: '普通', order: 3 },
      { question_id: createdQuestions[0].id, text: '不満', order: 4 },
      { question_id: createdQuestions[0].id, text: '非常に不満', order: 5 },
      
      // Question 2 options
      { question_id: createdQuestions[1].id, text: 'ユーザーインターフェース', order: 1 },
      { question_id: createdQuestions[1].id, text: '機能の充実度', order: 2 },
      { question_id: createdQuestions[1].id, text: 'パフォーマンス・速度', order: 3 },
      { question_id: createdQuestions[1].id, text: 'カスタマーサポート', order: 4 },
      { question_id: createdQuestions[1].id, text: '価格・料金体系', order: 5 },
      { question_id: createdQuestions[1].id, text: 'セキュリティ', order: 6 },
      
      // Question 3 options
      { question_id: createdQuestions[2].id, text: '毎日', order: 1 },
      { question_id: createdQuestions[2].id, text: '週に数回', order: 2 },
      { question_id: createdQuestions[2].id, text: '月に数回', order: 3 },
      { question_id: createdQuestions[2].id, text: '年に数回', order: 4 },
      { question_id: createdQuestions[2].id, text: 'ほとんど利用しない', order: 5 }
    ];

    const { data: createdOptions, error: optionsError } = await supabase
      .from('question_options')
      .insert(options)
      .select();

    if (optionsError) {
      throw new Error(`Failed to create options: ${optionsError.message}`);
    }

    console.log(`✓ Created ${createdOptions.length} options`);

    // Create test responses
    console.log('\nCreating test responses...');
    
    const responseData = [
      {
        survey_id: survey.id,
        is_anonymous: true,
        completed_at: new Date().toISOString()
      },
      {
        survey_id: survey.id,
        is_anonymous: true,
        completed_at: new Date().toISOString()
      },
      {
        survey_id: survey.id,
        is_anonymous: false,
        respondent_id: users.id,
        completed_at: new Date().toISOString()
      },
      {
        survey_id: survey.id,
        is_anonymous: true,
        completed_at: new Date().toISOString()
      },
      {
        survey_id: survey.id,
        is_anonymous: true,
        completed_at: new Date().toISOString()
      }
    ];

    const { data: responses, error: responseError } = await supabase
      .from('responses')
      .insert(responseData)
      .select();

    if (responseError) {
      throw new Error(`Failed to create responses: ${responseError.message}`);
    }

    console.log(`✓ Created ${responses.length} responses`);

    // Create answers for each response
    const q1Options = createdOptions.filter(o => o.question_id === createdQuestions[0].id);
    const q2Options = createdOptions.filter(o => o.question_id === createdQuestions[1].id);
    const q3Options = createdOptions.filter(o => o.question_id === createdQuestions[2].id);

    const answers = [];
    
    // Response 1
    answers.push(
      { response_id: responses[0].id, question_id: createdQuestions[0].id, option_id: q1Options[0].id },
      { response_id: responses[0].id, question_id: createdQuestions[1].id, option_id: q2Options[0].id },
      { response_id: responses[0].id, question_id: createdQuestions[1].id, option_id: q2Options[1].id },
      { response_id: responses[0].id, question_id: createdQuestions[2].id, option_id: q3Options[0].id },
      { response_id: responses[0].id, question_id: createdQuestions[3].id, rating_value: 9 },
      { response_id: responses[0].id, question_id: createdQuestions[4].id, text_value: '素晴らしいサービスです！UIが洗練されていて使いやすいです。' }
    );
    
    // Response 2
    answers.push(
      { response_id: responses[1].id, question_id: createdQuestions[0].id, option_id: q1Options[1].id },
      { response_id: responses[1].id, question_id: createdQuestions[1].id, option_id: q2Options[2].id },
      { response_id: responses[1].id, question_id: createdQuestions[2].id, option_id: q3Options[1].id },
      { response_id: responses[1].id, question_id: createdQuestions[3].id, rating_value: 7 },
      { response_id: responses[1].id, question_id: createdQuestions[4].id, text_value: 'パフォーマンスの改善を期待しています。' }
    );
    
    // Response 3
    answers.push(
      { response_id: responses[2].id, question_id: createdQuestions[0].id, option_id: q1Options[2].id },
      { response_id: responses[2].id, question_id: createdQuestions[1].id, option_id: q2Options[3].id },
      { response_id: responses[2].id, question_id: createdQuestions[1].id, option_id: q2Options[4].id },
      { response_id: responses[2].id, question_id: createdQuestions[2].id, option_id: q3Options[2].id },
      { response_id: responses[2].id, question_id: createdQuestions[3].id, rating_value: 5 },
      { response_id: responses[2].id, question_id: createdQuestions[4].id, text_value: '価格がもう少し手頃だと嬉しいです。サポートの対応も改善の余地があります。' }
    );
    
    // Response 4
    answers.push(
      { response_id: responses[3].id, question_id: createdQuestions[0].id, option_id: q1Options[0].id },
      { response_id: responses[3].id, question_id: createdQuestions[1].id, option_id: q2Options[1].id },
      { response_id: responses[3].id, question_id: createdQuestions[1].id, option_id: q2Options[5].id },
      { response_id: responses[3].id, question_id: createdQuestions[2].id, option_id: q3Options[0].id },
      { response_id: responses[3].id, question_id: createdQuestions[3].id, rating_value: 10 },
      { response_id: responses[3].id, question_id: createdQuestions[4].id, text_value: '完璧です！セキュリティも万全で安心して使えます。' }
    );
    
    // Response 5
    answers.push(
      { response_id: responses[4].id, question_id: createdQuestions[0].id, option_id: q1Options[1].id },
      { response_id: responses[4].id, question_id: createdQuestions[1].id, option_id: q2Options[0].id },
      { response_id: responses[4].id, question_id: createdQuestions[1].id, option_id: q2Options[2].id },
      { response_id: responses[4].id, question_id: createdQuestions[2].id, option_id: q3Options[1].id },
      { response_id: responses[4].id, question_id: createdQuestions[3].id, rating_value: 8 }
      // No text answer for this response
    );

    const { error: answersError } = await supabase
      .from('answers')
      .insert(answers);

    if (answersError) {
      throw new Error(`Failed to create answers: ${answersError.message}`);
    }

    console.log(`✓ Created ${answers.length} answers`);

    console.log('\n✅ Survey created successfully!');
    console.log(`\n📊 View survey at: http://localhost:3000/surveys/${survey.id}`);
    console.log(`📝 Edit survey at: http://localhost:3000/surveys/${survey.id}/edit`);
    console.log(`👁️ Preview survey at: http://localhost:3000/surveys/${survey.id}/preview`);
    console.log(`📱 Public survey URL: http://localhost:3000/surveys/${survey.id}/respond`);
    console.log(`📈 View responses at: http://localhost:3000/surveys/${survey.id}/responses`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get user email from command line
const userEmail = process.argv[2];

if (!userEmail) {
  console.log('Usage: node create-user-survey.js <user-email>');
  console.log('Example: node create-user-survey.js test@example.com');
  process.exit(1);
}

createSurveyForUser(userEmail);