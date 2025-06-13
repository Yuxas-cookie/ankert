const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAnalyticsTestData() {
  console.log('🚀 分析機能テストデータ作成スクリプト');
  console.log('=====================================\n');

  try {
    // テスト用ユーザーを取得
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);

    if (!users || users.length === 0) {
      console.error('❌ ユーザーが見つかりません');
      return;
    }

    const testUser = users[0];
    console.log(`✅ テストユーザー: ${testUser.email}`);

    // 分析用のアンケートを作成
    const surveyData = {
      user_id: testUser.id,
      title: '顧客満足度調査（分析テスト用）',
      description: '回答分析機能のテストのための包括的なアンケートです',
      status: 'published',
      published_at: new Date().toISOString()
    };

    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .insert(surveyData)
      .select()
      .single();

    if (surveyError) {
      console.error('❌ アンケート作成エラー:', surveyError);
      return;
    }

    console.log(`✅ アンケート作成完了: ${survey.id}`);

    // 多様な質問タイプを作成
    const questions = [
      {
        survey_id: survey.id,
        question_type: 'single_choice',
        question_text: 'サービスの総合満足度を教えてください',
        is_required: true,
        order_index: 1
      },
      {
        survey_id: survey.id,
        question_type: 'multiple_choice',
        question_text: '最も価値を感じた機能を選択してください（複数選択可）',
        is_required: true,
        order_index: 2
      },
      {
        survey_id: survey.id,
        question_type: 'rating_scale',
        question_text: 'サポートの品質を評価してください',
        is_required: true,
        order_index: 3,
        settings: { min: 1, max: 10 }
      },
      {
        survey_id: survey.id,
        question_type: 'text_long',
        question_text: '改善点や要望があればお聞かせください',
        is_required: false,
        order_index: 4
      },
      {
        survey_id: survey.id,
        question_type: 'matrix_single',
        question_text: '各項目について評価してください',
        is_required: true,
        order_index: 5
      }
    ];

    const { data: createdQuestions } = await supabase
      .from('questions')
      .insert(questions)
      .select();

    console.log(`✅ ${createdQuestions.length}個の質問を作成`);

    // 選択肢を追加
    const options = [
      // 質問1の選択肢
      { question_id: createdQuestions[0].id, option_text: 'とても満足', order_index: 1 },
      { question_id: createdQuestions[0].id, option_text: '満足', order_index: 2 },
      { question_id: createdQuestions[0].id, option_text: '普通', order_index: 3 },
      { question_id: createdQuestions[0].id, option_text: '不満', order_index: 4 },
      { question_id: createdQuestions[0].id, option_text: 'とても不満', order_index: 5 },
      // 質問2の選択肢
      { question_id: createdQuestions[1].id, option_text: '使いやすさ', order_index: 1 },
      { question_id: createdQuestions[1].id, option_text: '機能の豊富さ', order_index: 2 },
      { question_id: createdQuestions[1].id, option_text: 'パフォーマンス', order_index: 3 },
      { question_id: createdQuestions[1].id, option_text: 'デザイン', order_index: 4 },
      { question_id: createdQuestions[1].id, option_text: 'カスタマーサポート', order_index: 5 },
      // 質問5（マトリックス）の選択肢
      { question_id: createdQuestions[4].id, option_text: '価格設定', order_index: 1 },
      { question_id: createdQuestions[4].id, option_text: '機能性', order_index: 2 },
      { question_id: createdQuestions[4].id, option_text: 'サポート', order_index: 3 },
      { question_id: createdQuestions[4].id, option_text: 'ドキュメント', order_index: 4 }
    ];

    await supabase.from('question_options').insert(options);
    console.log('✅ 選択肢を追加');

    // 100件のテスト回答を生成（分析に十分なデータ量）
    console.log('\n📊 テスト回答を生成中...');
    
    const devices = ['desktop', 'mobile', 'tablet'];
    const userAgents = {
      desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
      mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
      tablet: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)'
    };
    
    const sentiments = [
      'とても満足しています。素晴らしいサービスです！',
      '概ね満足していますが、いくつか改善点があります。',
      'まあまあです。期待していたほどではありませんでした。',
      '使いやすくて気に入っています。',
      'サポートの対応が素晴らしかったです。',
      '価格に見合った価値があると思います。',
      'もう少し機能が充実していると良いです。',
      'デザインが洗練されていて使いやすいです。',
      'レスポンスが遅いのが気になります。',
      '他社と比較して優れていると思います。'
    ];

    // 過去30日間にわたる回答を生成
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (let i = 0; i < 100; i++) {
      // ランダムな日時を生成（過去30日間）
      const randomDays = Math.floor(Math.random() * 30);
      const startedAt = new Date(thirtyDaysAgo);
      startedAt.setDate(startedAt.getDate() + randomDays);
      startedAt.setHours(Math.floor(Math.random() * 24));
      startedAt.setMinutes(Math.floor(Math.random() * 60));

      // 完了時間（1-15分後）
      const completedAt = new Date(startedAt);
      completedAt.setMinutes(completedAt.getMinutes() + Math.floor(Math.random() * 15) + 1);

      const device = devices[Math.floor(Math.random() * devices.length)];
      
      const responseData = {
        survey_id: survey.id,
        started_at: startedAt.toISOString(),
        completed_at: Math.random() > 0.1 ? completedAt.toISOString() : null, // 90%完了率
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        user_agent: userAgents[device],
        is_complete: Math.random() > 0.1
      };

      const { data: response } = await supabase
        .from('responses')
        .insert(responseData)
        .select()
        .single();

      // 回答を作成
      const answers = [];
      
      // 質問1（満足度）- 正規分布的に
      const satisfactionRand = Math.random();
      let satisfaction;
      if (satisfactionRand < 0.15) satisfaction = 'とても不満';
      else if (satisfactionRand < 0.25) satisfaction = '不満';
      else if (satisfactionRand < 0.45) satisfaction = '普通';
      else if (satisfactionRand < 0.75) satisfaction = '満足';
      else satisfaction = 'とても満足';
      
      answers.push({
        response_id: response.id,
        question_id: createdQuestions[0].id,
        answer_text: satisfaction
      });

      // 質問2（複数選択）
      const selectedFeatures = [];
      if (Math.random() > 0.3) selectedFeatures.push('使いやすさ');
      if (Math.random() > 0.4) selectedFeatures.push('機能の豊富さ');
      if (Math.random() > 0.5) selectedFeatures.push('パフォーマンス');
      if (Math.random() > 0.6) selectedFeatures.push('デザイン');
      if (Math.random() > 0.7) selectedFeatures.push('カスタマーサポート');
      
      answers.push({
        response_id: response.id,
        question_id: createdQuestions[1].id,
        answer_text: selectedFeatures.join(', ')
      });

      // 質問3（評価スケール）
      const rating = Math.floor(Math.random() * 10) + 1;
      answers.push({
        response_id: response.id,
        question_id: createdQuestions[2].id,
        answer_value: rating
      });

      // 質問4（自由記述）- 70%の確率で回答
      if (Math.random() > 0.3) {
        answers.push({
          response_id: response.id,
          question_id: createdQuestions[3].id,
          answer_text: sentiments[Math.floor(Math.random() * sentiments.length)]
        });
      }

      // 質問5（マトリックス）
      const matrixAnswers = {
        '価格設定': ['優秀', '良い', '普通', '改善が必要'][Math.floor(Math.random() * 4)],
        '機能性': ['優秀', '良い', '普通', '改善が必要'][Math.floor(Math.random() * 4)],
        'サポート': ['優秀', '良い', '普通', '改善が必要'][Math.floor(Math.random() * 4)],
        'ドキュメント': ['優秀', '良い', '普通', '改善が必要'][Math.floor(Math.random() * 4)]
      };
      
      answers.push({
        response_id: response.id,
        question_id: createdQuestions[4].id,
        answer_text: JSON.stringify(matrixAnswers)
      });

      await supabase.from('answers').insert(answers);
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ ${i + 1}/100 回答を作成`);
      }
    }

    console.log('\n🎉 テストデータ作成完了！');
    console.log('=====================================');
    console.log(`📊 アンケートID: ${survey.id}`);
    console.log(`📈 回答数: 100件`);
    console.log(`🔗 分析ページ: http://localhost:3000/surveys/${survey.id}/responses`);
    console.log(`🧪 テストページ: http://localhost:3000/test-analytics`);
    console.log('\n分析機能をテストするには、上記URLにアクセスしてください。');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// スクリプトを実行
createAnalyticsTestData();