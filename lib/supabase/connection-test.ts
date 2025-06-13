/**
 * Supabase Connection Test Utilities
 * These functions help diagnose connection issues in the browser
 */

import { createClient } from '@supabase/supabase-js';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
  error?: any;
}

/**
 * Test basic Supabase connection
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return {
        success: false,
        message: 'Missing Supabase credentials',
        details: {
          url: !!url,
          key: !!key
        }
      };
    }

    // Create a test client
    const supabase = createClient(url, key);

    // Test a simple query
    const { error } = await supabase.from('users').select('count()').limit(1);

    if (error) {
      return {
        success: false,
        message: 'Database query failed',
        error: error
      };
    }

    return {
      success: true,
      message: 'Connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      error: error
    };
  }
}

/**
 * Test Supabase Auth service
 */
export async function testSupabaseAuth(): Promise<ConnectionTestResult> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return {
        success: false,
        message: 'Missing Supabase credentials'
      };
    }

    const supabase = createClient(url, key);
    
    // Get current session (should be null if not logged in)
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return {
        success: false,
        message: 'Auth service error',
        error: error
      };
    }

    return {
      success: true,
      message: 'Auth service is working',
      details: {
        hasSession: !!session
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Auth test failed',
      error: error
    };
  }
}

/**
 * Test Supabase Storage service
 */
export async function testSupabaseStorage(): Promise<ConnectionTestResult> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return {
        success: false,
        message: 'Missing Supabase credentials'
      };
    }

    const supabase = createClient(url, key);
    
    // List buckets (might be empty but should not error)
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      return {
        success: false,
        message: 'Storage service error',
        error: error
      };
    }

    return {
      success: true,
      message: 'Storage service is working',
      details: {
        bucketCount: data?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Storage test failed',
      error: error
    };
  }
}

/**
 * Run all connection tests
 */
export async function runAllConnectionTests() {
  console.log('Running Supabase connection tests...');
  
  const tests = [
    { name: 'Basic Connection', fn: testSupabaseConnection },
    { name: 'Auth Service', fn: testSupabaseAuth },
    { name: 'Storage Service', fn: testSupabaseStorage }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`Testing ${test.name}...`);
    const result = await test.fn();
    results.push({
      name: test.name,
      ...result
    });
    
    if (result.success) {
      console.log(`✅ ${test.name}: ${result.message}`);
    } else {
      console.error(`❌ ${test.name}: ${result.message}`, result.error);
    }
  }

  return results;
}

/**
 * Get diagnostic information
 */
export function getSupabaseDiagnostics() {
  return {
    env: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    urlInfo: process.env.NEXT_PUBLIC_SUPABASE_URL ? {
      protocol: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).protocol,
      host: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host,
      isLocalhost: process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost')
    } : null,
    browser: {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
      online: typeof window !== 'undefined' ? window.navigator.onLine : 'N/A'
    }
  };
}