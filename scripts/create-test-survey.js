#!/usr/bin/env node

/**
 * 🚀 Create Complete Test Survey Script
 * This script creates a comprehensive test survey with all question types
 * and sample responses for testing the response collection system.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bright}${colors.magenta}🚀 ${msg}${colors.reset}`)
};

async function getFirstUser() {
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(1);
  
  if (error || !users || users.length === 0) {
    log.error('No users found in database');
    return null;
  }
  
  return users[0];
}

async function createComprehensiveTestSurvey(userId) {
  log.header('Creating comprehensive test survey...');
  
  try {
    // Create the main survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .insert({
        user_id: userId,
        title: '🌟 コスミック・ユーザーエクスペリエンス調査',
        description: 'この包括的なアンケートでは、様々な質問タイプを使用してユーザーエクスペリエンスを調査します。このサンプルアンケートは、アプリの機能をテストするためのものです。',
        status: 'published',
        access_type: 'public',
        settings: {
          show_progress_bar: true,
          allow_navigation: true,
          randomize_questions: false,
          thank_you_message: '🎉 ご協力ありがとうございました！あなたのフィードバックは宇宙の彼方まで届きます。',
          primary_color: '#5E5CE6',
          auto_save: true
        },
        branding: {
          primary_color: '#5E5CE6',
          background_color: null,
          logo_url: null
        },
        tags: ['テスト', 'UI/UX', '包括的調査', 'サンプルデータ']
      })
      .select()
      .single();
    
    if (surveyError) {
      log.error(`Failed to create survey: ${surveyError.message}`);
      return null;
    }
    
    log.success(`Survey created: ${survey.title} (ID: ${survey.id})`);
    
    // Define all questions with various types
    const questions = [
      {
        survey_id: survey.id,
        question_type: 'text_short',
        question_text: '👋 まず、お名前またはニックネームを教えてください',
        description: '匿名でも構いません',
        is_required: true,
        order_index: 1,
        settings: {
          min_length: 1,
          max_length: 50,
          placeholder: 'お名前またはニックネーム'
        }
      },
      {
        survey_id: survey.id,
        question_type: 'single_choice',
        question_text: '🎨 アプリのコスミックデザインはいかがですか？',
        description: '宇宙的なデザインテーマについてお聞かせください',
        is_required: true,
        order_index: 2,
        settings: {
          other_option: false,
          randomize_options: false
        }
      },
      {
        survey_id: survey.id,
        question_type: 'rating_scale',
        question_text: '⭐ 全体的な使いやすさを5段階で評価してください',
        description: '1が最低、5が最高です',
        is_required: true,
        order_index: 3,
        settings: {
          scale_min: 1,
          scale_max: 5,
          scale_type: 'stars',
          scale_labels: ['非常に悪い', '悪い', '普通', '良い', '非常に良い']
        }
      },
      {
        survey_id: survey.id,
        question_type: 'multiple_choice',
        question_text: '🚀 どの機能を使用したことがありますか？（複数選択可）',
        description: '使用経験のある機能をすべて選択してください',
        is_required: false,
        order_index: 4,
        settings: {
          other_option: true,
          randomize_options: false
        }
      },
      {
        survey_id: survey.id,
        question_type: 'text_long',
        question_text: '💭 アプリの改善点やご要望があればお聞かせください',
        description: 'どんな小さなことでも構いません',
        is_required: false,
        order_index: 5,
        settings: {
          min_length: 0,
          max_length: 1000,
          placeholder: 'ご意見やご要望をお聞かせください...'
        }
      },
      {
        survey_id: survey.id,
        question_type: 'date',
        question_text: '📅 最初にこのアプリを使用した日はいつ頃ですか？',
        description: '大体の日付で構いません',
        is_required: false,
        order_index: 6,
        settings: {
          date_format: 'YYYY-MM-DD',
          min_date: '2024-01-01',
          max_date: new Date().toISOString().split('T')[0]
        }
      }
    ];
    
    // Insert questions
    const { data: createdQuestions, error: questionsError } = await supabase
      .from('questions')
      .insert(questions)
      .select();
    
    if (questionsError) {
      log.error(`Failed to create questions: ${questionsError.message}`);
      return survey;
    }
    
    log.success(`Created ${createdQuestions.length} questions`);
    
    // Create options for single choice question (Design rating)
    const designOptions = [
      { question_id: createdQuestions[1].id, option_text: '🌟 素晴らしい！まさに宇宙的で美しい', order_index: 1 },
      { question_id: createdQuestions[1].id, option_text: '😊 良い - 洗練されていて現代的', order_index: 2 },
      { question_id: createdQuestions[1].id, option_text: '😐 普通 - 特に印象に残らない', order_index: 3 },
      { question_id: createdQuestions[1].id, option_text: '😕 少し微妙 - 改善の余地あり', order_index: 4 },
      { question_id: createdQuestions[1].id, option_text: '😞 好みではない - 使いにくい', order_index: 5 }
    ];
    
    // Create options for multiple choice question (Features used)
    const featureOptions = [
      { question_id: createdQuestions[3].id, option_text: '📝 アンケート作成機能', order_index: 1 },
      { question_id: createdQuestions[3].id, option_text: '📊 回答分析・統計機能', order_index: 2 },
      { question_id: createdQuestions[3].id, option_text: '🌙 ダークモード/ライトモード切り替え', order_index: 3 },
      { question_id: createdQuestions[3].id, option_text: '👥 チーム機能・共同編集', order_index: 4 },
      { question_id: createdQuestions[3].id, option_text: '📱 モバイル対応', order_index: 5 },
      { question_id: createdQuestions[3].id, option_text: '🚀 リアルタイム更新', order_index: 6 },
      { question_id: createdQuestions[3].id, option_text: '🔒 プライバシー・セキュリティ機能', order_index: 7 },
      { question_id: createdQuestions[3].id, option_text: '📁 アンケート管理・整理機能', order_index: 8 }
    ];
    
    const allOptions = [...designOptions, ...featureOptions];
    
    // Insert options
    const { data: createdOptions, error: optionsError } = await supabase
      .from('question_options')
      .insert(allOptions)
      .select();
    
    if (optionsError) {
      log.error(`Failed to create options: ${optionsError.message}`);
      return survey;
    }
    
    log.success(`Created ${createdOptions.length} question options`);
    
    return survey;
    
  } catch (err) {
    log.error(`Failed to create comprehensive test survey: ${err.message}`);
    return null;
  }
}

async function createSampleResponses(survey, questions) {
  log.header('Creating sample responses...');
  
  const sampleData = [
    {
      name: '宇宙太郎',
      design_rating: '🌟 素晴らしい！まさに宇宙的で美しい',
      usability_rating: 5,
      features_used: ['📝 アンケート作成機能', '📊 回答分析・統計機能', '🌙 ダークモード/ライトモード切り替え'],
      feedback: 'アニメーションが美しく、操作が直感的です。特にコスミックテーマが気に入っています。',
      first_use_date: '2025-01-15'
    },
    {
      name: 'スターガール',
      design_rating: '😊 良い - 洗練されていて現代的',
      usability_rating: 4,
      features_used: ['📝 アンケート作成機能', '👥 チーム機能・共同編集', '📱 モバイル対応'],
      feedback: 'チーム機能が便利です。もう少し読み込み速度が速くなると嬉しいです。',
      first_use_date: '2025-02-10'
    },
    {
      name: 'コスモ研究者',
      design_rating: '🌟 素晴らしい！まさに宇宙的で美しい',
      usability_rating: 5,
      features_used: ['📊 回答分析・統計機能', '🚀 リアルタイム更新', '🔒 プライバシー・セキュリティ機能', '📁 アンケート管理・整理機能'],
      feedback: '分析機能が充実していて、研究に活用できています。セキュリティ面も安心です。',
      first_use_date: '2024-12-01'
    },
    {
      name: 'ミライ',
      design_rating: '😐 普通 - 特に印象に残らない',
      usability_rating: 3,
      features_used: ['📝 アンケート作成機能', '📱 モバイル対応'],
      feedback: '基本的な機能は問題ありませんが、もう少し簡単に使えるといいなと思います。',
      first_use_date: '2025-03-01'
    },
    {
      name: 'ギャラクシー',
      design_rating: '😊 良い - 洗練されていて現代的',
      usability_rating: 4,
      features_used: ['📝 アンケート作成機能', '📊 回答分析・統計機能', '🌙 ダークモード/ライトモード切り替え', '👥 チーム機能・共同編集'],
      feedback: 'ダークモードがとても見やすいです。チームでの作業もスムーズに行えました。',
      first_use_date: '2025-01-20'
    }
  ];
  
  try {
    for (let i = 0; i < sampleData.length; i++) {
      const sample = sampleData[i];
      
      // Create response record
      const responseStartTime = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000); // Random time in last 14 days
      const responseEndTime = new Date(responseStartTime.getTime() + (Math.random() * 300 + 120) * 1000); // 2-7 minutes later
      
      const { data: response, error: responseError } = await supabase
        .from('responses')
        .insert({
          survey_id: survey.id,
          is_complete: true,
          completion_percentage: 100,
          started_at: responseStartTime.toISOString(),
          completed_at: responseEndTime.toISOString(),
          last_activity_at: responseEndTime.toISOString(),
          time_spent: Math.floor((responseEndTime - responseStartTime) / 1000),
          page_views: Math.floor(Math.random() * 3) + 4, // 4-6 page views
          ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          user_agent: 'Mozilla/5.0 (Test Browser) Survey App Test',
          device_info: {
            browser: 'Chrome',
            os: 'macOS',
            device_type: 'desktop'
          }
        })
        .select()
        .single();
      
      if (responseError) {
        log.warning(`Failed to create response ${i + 1}: ${responseError.message}`);
        continue;
      }
      
      // Create answers for each question
      const answers = [
        {
          response_id: response.id,
          question_id: questions[0].id, // Name
          answer_text: sample.name,
          time_spent: Math.floor(Math.random() * 20) + 10
        },
        {
          response_id: response.id,
          question_id: questions[1].id, // Design rating
          answer_text: sample.design_rating,
          time_spent: Math.floor(Math.random() * 30) + 15
        },
        {
          response_id: response.id,
          question_id: questions[2].id, // Usability rating
          answer_numeric: sample.usability_rating,
          answer_text: String(sample.usability_rating),
          time_spent: Math.floor(Math.random() * 25) + 10
        },
        {
          response_id: response.id,
          question_id: questions[3].id, // Features used
          answer_value: sample.features_used,
          answer_text: sample.features_used.join(', '),
          time_spent: Math.floor(Math.random() * 45) + 20
        },
        {
          response_id: response.id,
          question_id: questions[4].id, // Feedback
          answer_text: sample.feedback,
          time_spent: Math.floor(Math.random() * 60) + 30
        },
        {
          response_id: response.id,
          question_id: questions[5].id, // First use date
          answer_date: sample.first_use_date,
          answer_text: sample.first_use_date,
          time_spent: Math.floor(Math.random() * 20) + 8
        }
      ];
      
      const { error: answersError } = await supabase
        .from('answers')
        .insert(answers);
      
      if (answersError) {
        log.warning(`Failed to create answers for response ${i + 1}: ${answersError.message}`);
      } else {
        log.success(`Created response ${i + 1} with ${answers.length} answers`);
      }
    }
    
    log.success(`Created ${sampleData.length} sample responses`);
    
  } catch (err) {
    log.error(`Failed to create sample responses: ${err.message}`);
  }
}

async function main() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log('🚀========================================================🚀');
  console.log('    Creating Comprehensive Test Survey with Sample Data');
  console.log('🚀========================================================🚀');
  console.log(colors.reset);
  
  // Get first user
  const user = await getFirstUser();
  if (!user) {
    log.error('Cannot proceed without a user');
    process.exit(1);
  }
  
  log.info(`Using user: ${user.email} (${user.id})`);
  
  // Create comprehensive survey
  const survey = await createComprehensiveTestSurvey(user.id);
  if (!survey) {
    log.error('Failed to create survey');
    process.exit(1);
  }
  
  // Get created questions
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('survey_id', survey.id)
    .order('order_index');
  
  if (questionsError || !questions) {
    log.error('Failed to fetch created questions');
    process.exit(1);
  }
  
  // Create sample responses
  await createSampleResponses(survey, questions);
  
  console.log(`\n${colors.bright}${colors.green}🎉 Comprehensive test survey created successfully!${colors.reset}`);
  console.log(`${colors.cyan}📋 Survey Title: ${survey.title}${colors.reset}`);
  console.log(`${colors.cyan}🆔 Survey ID: ${survey.id}${colors.reset}`);
  console.log(`${colors.cyan}📝 Questions: ${questions.length}${colors.reset}`);
  console.log(`${colors.cyan}📊 Sample Responses: 5${colors.reset}`);
  console.log(`\n${colors.bright}URLs for testing:${colors.reset}`);
  console.log(`${colors.yellow}🔗 Survey Management: http://localhost:3000/surveys/${survey.id}${colors.reset}`);
  console.log(`${colors.yellow}👁️  Survey Preview: http://localhost:3000/surveys/${survey.id}/preview${colors.reset}`);
  console.log(`${colors.yellow}📝 Public Response: http://localhost:3000/surveys/${survey.id}/respond${colors.reset}`);
  console.log(`${colors.yellow}📊 View Responses: http://localhost:3000/surveys/${survey.id}/responses${colors.reset}`);
  
  console.log(`\n${colors.bright}${colors.green}✅ Test survey setup completed!${colors.reset}`);
}

// Run the script
main().catch((error) => {
  log.error(`Script failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});