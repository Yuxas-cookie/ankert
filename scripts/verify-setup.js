#!/usr/bin/env node

/**
 * Supabaseプロジェクト設定確認スクリプト
 * Created: 2025-06-11
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 設定
const CONFIG = {
  SUPABASE_URL: 'https://ffsalcmgbzrpkdertels.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmc2FsY21nYnpycGtkZXJ0ZWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTE5MTksImV4cCI6MjA2NTIyNzkxOX0.xyIFOhBnVE1qs_lH2hCB6AtLOhkPQ37FzhW9tMxP9PU',
  SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmc2FsY21nYnpycGtkZXJ0ZWxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTY1MTkxOSwiZXhwIjoyMDY1MjI3OTE5fQ.yRnboR32yxkrm8IhxAHpBBUBhoppTFfPLqMCcDRMOso'
};

// カラー出力
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP リクエスト実行
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// 1. Supabase接続確認
async function checkSupabaseConnection() {
  log('\n🔍 1. Supabase接続確認', 'blue');
  
  try {
    const result = await makeRequest(`${CONFIG.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': CONFIG.ANON_KEY,
        'Authorization': `Bearer ${CONFIG.ANON_KEY}`
      }
    });

    if (result.status === 200 && result.data.swagger) {
      log('✅ Supabase接続成功', 'green');
      return true;
    } else {
      log('❌ Supabase接続失敗', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Supabase接続エラー: ${error.message}`, 'red');
    return false;
  }
}

// 2. テーブル存在確認
async function checkTables() {
  log('\n📊 2. テーブル存在確認', 'blue');
  
  const expectedTables = [
    'profiles', 'teams', 'roles', 'team_members', 'team_invitations',
    'surveys', 'questions', 'question_options', 'responses', 'answers',
    'file_uploads', 'audit_logs', 'performance_metrics', 'realtime_sessions',
    'notifications', 'analytics_events'
  ];

  let allTablesExist = true;

  for (const table of expectedTables) {
    try {
      const result = await makeRequest(`${CONFIG.SUPABASE_URL}/rest/v1/${table}?select=*&limit=0`, {
        headers: {
          'apikey': CONFIG.SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${CONFIG.SERVICE_ROLE_KEY}`
        }
      });

      if (result.status === 200) {
        log(`✅ ${table}`, 'green');
      } else {
        log(`❌ ${table} - Status: ${result.status}`, 'red');
        allTablesExist = false;
      }
    } catch (error) {
      log(`❌ ${table} - Error: ${error.message}`, 'red');
      allTablesExist = false;
    }
  }

  return allTablesExist;
}

// 3. 役割データ確認
async function checkRoles() {
  log('\n👥 3. システム役割確認', 'blue');
  
  try {
    const result = await makeRequest(`${CONFIG.SUPABASE_URL}/rest/v1/roles?is_system_role=eq.true&select=*`, {
      headers: {
        'apikey': CONFIG.SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${CONFIG.SERVICE_ROLE_KEY}`
      }
    });

    if (result.status === 200 && Array.isArray(result.data)) {
      const roles = result.data;
      const expectedRoles = ['owner', 'admin', 'editor', 'viewer', 'respondent'];
      
      log(`📋 検出された役割: ${roles.length}個`, 'cyan');
      
      let allRolesExist = true;
      for (const expectedRole of expectedRoles) {
        const roleExists = roles.some(role => role.name === expectedRole);
        if (roleExists) {
          log(`✅ ${expectedRole}`, 'green');
        } else {
          log(`❌ ${expectedRole}`, 'red');
          allRolesExist = false;
        }
      }
      
      return allRolesExist;
    } else {
      log('❌ 役割データの取得に失敗', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 役割確認エラー: ${error.message}`, 'red');
    return false;
  }
}

// 4. ファイル存在確認
function checkFiles() {
  log('\n📁 4. 設定ファイル確認', 'blue');
  
  const expectedFiles = [
    '.env.local',
    '.env.example',
    'supabase/migrations/00001_comprehensive_schema.sql',
    'supabase/migrations/00002_initial_data.sql',
    'supabase/migrations/00003_rls_policies.sql',
    'supabase/migrations/00004_storage_setup.sql',
    'types/database-new.ts',
    'lib/supabase/client.ts',
    'lib/supabase/server.ts'
  ];

  let allFilesExist = true;

  for (const filePath of expectedFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      log(`✅ ${filePath}`, 'green');
    } else {
      log(`❌ ${filePath}`, 'red');
      allFilesExist = false;
    }
  }

  return allFilesExist;
}

// 5. 環境変数確認
function checkEnvironmentVariables() {
  log('\n🔧 5. 環境変数確認', 'blue');
  
  // .env.local ファイルを読み込み
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local ファイルが存在しません', 'red');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const expectedVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  let allVarsExist = true;

  for (const varName of expectedVars) {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      log(`✅ ${varName}`, 'green');
    } else {
      log(`❌ ${varName}`, 'red');
      allVarsExist = false;
    }
  }

  return allVarsExist;
}

// メイン実行
async function main() {
  log('🚀 Supabaseプロジェクト設定確認スクリプト', 'magenta');
  log('============================================', 'magenta');

  const results = {
    connection: await checkSupabaseConnection(),
    tables: await checkTables(),
    roles: await checkRoles(),
    files: checkFiles(),
    environment: checkEnvironmentVariables()
  };

  // 結果サマリー
  log('\n📊 確認結果サマリー', 'blue');
  log('==================', 'blue');

  const allChecks = Object.values(results);
  const passedChecks = allChecks.filter(Boolean).length;
  const totalChecks = allChecks.length;

  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${status} ${check}`, color);
  });

  log(`\n📈 総合結果: ${passedChecks}/${totalChecks} (${Math.round(passedChecks/totalChecks*100)}%)`, 
      passedChecks === totalChecks ? 'green' : 'yellow');

  if (passedChecks === totalChecks) {
    log('\n🎉 すべての確認が完了しました！', 'green');
    log('アプリケーションを起動できます:', 'green');
    log('npm run dev', 'cyan');
  } else {
    log('\n⚠️  いくつかの問題が検出されました', 'yellow');
    log('マイグレーションを実行してから再度確認してください', 'yellow');
    
    if (!results.tables || !results.roles) {
      log('\n📝 次のステップ:', 'blue');
      log('1. Supabase SQL Editorを開く', 'cyan');
      log('2. マイグレーションファイルを順番に実行:', 'cyan');
      log('   - 00001_comprehensive_schema.sql', 'cyan');
      log('   - 00002_initial_data.sql', 'cyan');
      log('   - 00003_rls_policies.sql', 'cyan');
      log('   - 00004_storage_setup.sql', 'cyan');
      log('3. このスクリプトを再実行', 'cyan');
    }
  }

  process.exit(passedChecks === totalChecks ? 0 : 1);
}

// 実行
main().catch(error => {
  log(`❌ スクリプト実行エラー: ${error.message}`, 'red');
  process.exit(1);
});