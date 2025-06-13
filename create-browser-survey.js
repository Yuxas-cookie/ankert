// Browser console script to create a test survey for the current user
// Run this script in the browser console while logged in

async function createTestSurvey() {
  try {
    // Get the current user
    const userResponse = await fetch('/api/auth/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('User not authenticated. Please log in first.');
    }

    const userData = await userResponse.json();
    console.log('Current user:', userData.user.email);

    // Create a new survey
    const surveyData = {
      title: 'ユーザーフィードバックアンケート',
      description: '製品やサービスに関するご意見をお聞かせください。',
      is_public: true,
      questions: [
        {
          title: 'サービスの満足度を教えてください',
          type: 'single_choice',
          required: true,
          order: 1,
          options: [
            { text: '非常に満足', order: 1 },
            { text: '満足', order: 2 },
            { text: '普通', order: 3 },
            { text: '不満', order: 4 },
            { text: '非常に不満', order: 5 }
          ]
        },
        {
          title: '最も改善してほしい点は何ですか？',
          type: 'multiple_choice',
          required: true,
          order: 2,
          options: [
            { text: 'ユーザーインターフェース', order: 1 },
            { text: '機能の充実', order: 2 },
            { text: 'パフォーマンス', order: 3 },
            { text: 'カスタマーサポート', order: 4 },
            { text: '価格', order: 5 }
          ]
        },
        {
          title: 'サービスをどのくらいの頻度で利用しますか？',
          type: 'single_choice',
          required: true,
          order: 3,
          options: [
            { text: '毎日', order: 1 },
            { text: '週に数回', order: 2 },
            { text: '月に数回', order: 3 },
            { text: 'ほとんど使わない', order: 4 }
          ]
        },
        {
          title: 'このサービスを他の人に勧めますか？（0-10で評価）',
          type: 'rating',
          required: true,
          order: 4,
          validation: {
            min: 0,
            max: 10
          }
        },
        {
          title: 'その他、ご意見・ご要望があればお聞かせください',
          type: 'text',
          required: false,
          order: 5
        }
      ]
    };

    const createResponse = await fetch('/api/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(surveyData),
    });

    if (!createResponse.ok) {
      throw new Error('Failed to create survey');
    }

    const survey = await createResponse.json();
    console.log('✓ Survey created:', survey.title);
    console.log('Survey ID:', survey.id);

    // Now create some test responses
    const testResponses = [
      {
        answers: {
          [survey.questions[0].id]: survey.questions[0].options[0].id, // 非常に満足
          [survey.questions[1].id]: [survey.questions[1].options[0].id, survey.questions[1].options[1].id], // UI, 機能
          [survey.questions[2].id]: survey.questions[2].options[0].id, // 毎日
          [survey.questions[3].id]: 9,
          [survey.questions[4].id]: '素晴らしいサービスです！UIがとても使いやすく、毎日活用しています。'
        }
      },
      {
        answers: {
          [survey.questions[0].id]: survey.questions[0].options[1].id, // 満足
          [survey.questions[1].id]: [survey.questions[1].options[2].id], // パフォーマンス
          [survey.questions[2].id]: survey.questions[2].options[1].id, // 週に数回
          [survey.questions[3].id]: 7,
          [survey.questions[4].id]: 'もう少し処理速度が速くなると嬉しいです。'
        }
      },
      {
        answers: {
          [survey.questions[0].id]: survey.questions[0].options[2].id, // 普通
          [survey.questions[1].id]: [survey.questions[1].options[3].id, survey.questions[1].options[4].id], // サポート, 価格
          [survey.questions[2].id]: survey.questions[2].options[2].id, // 月に数回
          [survey.questions[3].id]: 5,
          [survey.questions[4].id]: '価格がもう少し安いと利用頻度が上がると思います。'
        }
      },
      {
        answers: {
          [survey.questions[0].id]: survey.questions[0].options[0].id, // 非常に満足
          [survey.questions[1].id]: [survey.questions[1].options[1].id], // 機能
          [survey.questions[2].id]: survey.questions[2].options[0].id, // 毎日
          [survey.questions[3].id]: 10,
          [survey.questions[4].id]: '完璧です！新機能の追加も楽しみにしています。'
        }
      },
      {
        answers: {
          [survey.questions[0].id]: survey.questions[0].options[1].id, // 満足
          [survey.questions[1].id]: [survey.questions[1].options[0].id, survey.questions[1].options[2].id], // UI, パフォーマンス
          [survey.questions[2].id]: survey.questions[2].options[1].id, // 週に数回
          [survey.questions[3].id]: 8,
          [survey.questions[4].id]: null // 空の回答
        }
      }
    ];

    // Submit responses
    console.log('\nCreating test responses...');
    let successCount = 0;
    
    for (let i = 0; i < testResponses.length; i++) {
      try {
        const response = await fetch(`/api/surveys/${survey.id}/public`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testResponses[i]),
        });

        if (response.ok) {
          successCount++;
          console.log(`✓ Response ${i + 1} created`);
        } else {
          console.error(`✗ Failed to create response ${i + 1}`);
        }
      } catch (error) {
        console.error(`✗ Error creating response ${i + 1}:`, error);
      }
    }

    console.log(`\n✅ Survey created with ${successCount} test responses!`);
    console.log(`\n📊 View responses at: ${window.location.origin}/surveys/${survey.id}/responses`);
    console.log(`📝 Edit survey at: ${window.location.origin}/surveys/${survey.id}/edit`);
    console.log(`👁️ Preview survey at: ${window.location.origin}/surveys/${survey.id}/preview`);
    console.log(`📱 Public survey URL: ${window.location.origin}/surveys/${survey.id}/respond`);

    return survey;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run the function
console.log('🚀 Creating test survey...');
createTestSurvey().then(survey => {
  console.log('\n✨ Done! Survey is ready for testing.');
}).catch(error => {
  console.error('\n❌ Failed to create survey:', error);
});