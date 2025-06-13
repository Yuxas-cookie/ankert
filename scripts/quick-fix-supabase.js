#!/usr/bin/env node

/**
 * Quick Fix Script for Supabase Connection Issues
 * This script attempts common fixes for connection problems
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Supabase Quick Fix Script\n');

// Step 1: Check and create .env.local if missing
console.log('1. Checking environment file...');
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('   ❌ .env.local not found! Creating template...');
  const template = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Get these values from:
# https://app.supabase.com/project/YOUR_PROJECT/settings/api
`;
  fs.writeFileSync(envPath, template);
  console.log('   ✅ Created .env.local template');
  console.log('   ⚠️  Please fill in your Supabase credentials!');
  process.exit(1);
} else {
  console.log('   ✅ .env.local exists');
}

// Step 2: Validate environment variables
console.log('\n2. Validating environment variables...');
require('dotenv').config({ path: envPath });

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

let missingVars = [];
for (const varName of required) {
  if (!process.env[varName] || process.env[varName] === `your_${varName.toLowerCase()}_here`) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.log('   ❌ Missing or invalid environment variables:');
  missingVars.forEach(v => console.log(`      - ${v}`));
  console.log('\n   📝 To fix this:');
  console.log('   1. Go to https://app.supabase.com');
  console.log('   2. Select your project');
  console.log('   3. Go to Settings > API');
  console.log('   4. Copy the values and update .env.local');
  process.exit(1);
} else {
  console.log('   ✅ All required variables are set');
}

// Step 3: Test connection
console.log('\n3. Testing Supabase connection...');
const testUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
const testKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

try {
  // Using a simple Node.js script to test
  const testScript = `
    const https = require('https');
    const url = '${testUrl}';
    https.get(url, { 
      headers: { 'apikey': '${testKey}' },
      timeout: 5000 
    }, (res) => {
      console.log(res.statusCode);
    }).on('error', (err) => {
      console.error('ERROR:', err.code || err.message);
    });
  `;
  
  const result = execSync(`node -e "${testScript}"`, { encoding: 'utf8' }).trim();
  
  if (result.startsWith('ERROR:')) {
    throw new Error(result);
  }
  
  const statusCode = parseInt(result);
  if (statusCode === 200) {
    console.log('   ✅ Connection successful!');
  } else if (statusCode === 401) {
    console.log('   ❌ Authentication failed - check your API key');
  } else {
    console.log(`   ⚠️  Unexpected status code: ${statusCode}`);
  }
} catch (error) {
  console.log('   ❌ Connection failed:', error.message);
  
  if (error.message.includes('ENOTFOUND')) {
    console.log('\n   🔍 Possible issues:');
    console.log('   - Supabase project might be paused');
    console.log('   - URL might be incorrect');
    console.log('   - DNS resolution failing');
  } else if (error.message.includes('ETIMEDOUT')) {
    console.log('\n   🔍 Possible issues:');
    console.log('   - Network firewall blocking connection');
    console.log('   - Supabase project is paused');
    console.log('   - Network connectivity issues');
  }
}

// Step 4: Clear caches
console.log('\n4. Clearing caches...');
try {
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('   ✅ Cleared Next.js cache');
  }
  if (fs.existsSync('node_modules/.cache')) {
    execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
    console.log('   ✅ Cleared node_modules cache');
  }
} catch (error) {
  console.log('   ⚠️  Could not clear some caches');
}

// Step 5: Provide next steps
console.log('\n📋 Next Steps:');
console.log('1. If connection failed:');
console.log('   - Visit https://app.supabase.com and check if your project is active');
console.log('   - Click "Restore project" if it\'s paused');
console.log('   - Verify your API keys are correct');
console.log('\n2. Run more detailed tests:');
console.log('   - npm run test:connection');
console.log('   - npm run test:browser');
console.log('\n3. Try restarting the dev server:');
console.log('   - npm run dev');

// Step 6: Open browser test
console.log('\n5. Opening browser test page...');
const browserTestPath = path.join(__dirname, 'test-supabase-browser.html');
if (fs.existsSync(browserTestPath)) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const browserUrl = `file://${browserTestPath}?url=${encodeURIComponent(url)}&key=${encodeURIComponent(key)}`;
  
  try {
    if (process.platform === 'darwin') {
      execSync(`open "${browserUrl}"`);
    } else if (process.platform === 'win32') {
      execSync(`start "${browserUrl}"`);
    } else {
      execSync(`xdg-open "${browserUrl}"`);
    }
    console.log('   ✅ Opened browser test page');
  } catch (error) {
    console.log('   ⚠️  Could not open browser automatically');
    console.log(`   Please open: ${browserTestPath}`);
  }
}

console.log('\n✨ Quick fix script completed!');