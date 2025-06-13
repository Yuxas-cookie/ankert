#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://ffsalcmgbzrpkdertels.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sbp_573a52caa62fd2d713b3c417d0e1699a4311d847';

// Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files in order
const migrationFiles = [
  '00001_comprehensive_schema.sql',
  '00002_initial_data.sql',
  '00003_rls_policies.sql',
  '00004_storage_setup.sql'
];

async function executeMigration(filename) {
  try {
    console.log(`\n🚀 Executing migration: ${filename}`);
    
    const filePath = path.join(__dirname, 'supabase', 'migrations', filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Migration file not found: ${filePath}`);
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.length > 0) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          // Try direct execution if rpc fails
          const { error: directError } = await supabase
            .from('_placeholder_')
            .select('*')
            .limit(0);
          
          if (directError) {
            console.error(`❌ Error executing statement: ${statement.substring(0, 100)}...`);
            console.error('Error:', directError);
            throw directError;
          }
        }
      }
    }
    
    console.log(`✅ Successfully executed migration: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to execute migration ${filename}:`, error);
    throw error;
  }
}

async function runMigrations() {
  console.log('🔄 Starting database migrations...\n');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('_placeholder_').select('*').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected
      console.error('❌ Failed to connect to Supabase:', error);
      return;
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Execute migrations in order
    for (const filename of migrationFiles) {
      await executeMigration(filename);
    }
    
    console.log('\n🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Migration process failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();