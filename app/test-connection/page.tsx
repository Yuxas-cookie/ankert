'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  runAllConnectionTests, 
  getSupabaseDiagnostics,
  type ConnectionTestResult 
} from '@/lib/supabase/connection-test';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TestResult extends ConnectionTestResult {
  name: string;
}

export default function TestConnectionPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get diagnostics on mount
    setDiagnostics(getSupabaseDiagnostics());
  }, []);

  const runTests = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      const testResults = await runAllConnectionTests();
      setResults(testResults);
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Supabase Connection Test</h1>
          <p className="text-muted-foreground">
            Diagnose and fix Supabase connection issues
          </p>
        </div>

        {/* Environment Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Status</h2>
          {diagnostics && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {diagnostics.env.url ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span>Supabase URL: {diagnostics.env.url ? 'Configured' : 'Missing'}</span>
              </div>
              <div className="flex items-center gap-2">
                {diagnostics.env.anonKey ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span>Anon Key: {diagnostics.env.anonKey ? 'Configured' : 'Missing'}</span>
              </div>
              {diagnostics.urlInfo && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    <strong>URL Info:</strong><br />
                    Protocol: {diagnostics.urlInfo.protocol}<br />
                    Host: {diagnostics.urlInfo.host}<br />
                    Is Localhost: {diagnostics.urlInfo.isLocalhost ? 'Yes' : 'No'}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Test Button */}
        <div className="flex justify-center">
          <Button 
            onClick={runTests} 
            disabled={loading}
            size="lg"
            className="gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Connection Tests'
            )}
          </Button>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            {results.map((result, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{result.name}</h3>
                    <p className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.message}
                    </p>
                    {result.details && (
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                    {result.error && (
                      <div className="mt-2 p-3 bg-red-50 dark:bg-red-950 rounded">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Error: {result.error.message || JSON.stringify(result.error)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Troubleshooting Tips */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Troubleshooting Tips
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded">
              <p className="font-semibold text-sm mb-1">If connection fails:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Check if your Supabase project is active (not paused)</li>
                <li>Verify your API keys in the Supabase dashboard</li>
                <li>Ensure your .env.local file has the correct values</li>
                <li>Try running: <code className="bg-muted px-1 rounded">npm run fix:supabase</code></li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
              <p className="font-semibold text-sm mb-1">Quick Actions:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>
                  <a 
                    href="https://app.supabase.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Open Supabase Dashboard
                  </a>
                </li>
                <li>Run: <code className="bg-muted px-1 rounded">npm run test:curl</code> for detailed network test</li>
                <li>Clear cache: <code className="bg-muted px-1 rounded">rm -rf .next && npm run dev</code></li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}