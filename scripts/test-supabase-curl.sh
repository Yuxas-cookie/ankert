#!/bin/bash

# Supabase Connection Test using curl
# This script tests Supabase connectivity using curl commands

echo "=== Supabase Connection Test (curl) ==="
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Missing environment variables!"
    echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    exit 1
fi

echo "1. Environment Check:"
echo "   URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "   Key: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
echo ""

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo "Testing: $description"
    echo "Endpoint: $NEXT_PUBLIC_SUPABASE_URL$endpoint"
    
    response=$(curl -s -w "\n%{http_code}" \
        -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
        "$NEXT_PUBLIC_SUPABASE_URL$endpoint" 2>&1)
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "000" ]; then
        echo "❌ Connection failed (no response)"
        echo "   Error: $body"
    elif [ "$http_code" = "200" ] || [ "$http_code" = "201" ] || [ "$http_code" = "204" ]; then
        echo "✅ Success (HTTP $http_code)"
    else
        echo "⚠️  HTTP $http_code"
        echo "   Response: $body"
    fi
    echo ""
}

# Test various endpoints
echo "2. API Endpoint Tests:"
echo ""

test_endpoint "/rest/v1/" "REST API Base"
test_endpoint "/auth/v1/health" "Auth Service Health"
test_endpoint "/rest/v1/users?select=count" "Database Query (users table)"
test_endpoint "/storage/v1/bucket" "Storage Service"

# Test with verbose output for debugging
echo "3. Detailed Connection Test (verbose):"
echo ""
curl -v \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" 2>&1 | grep -E "(Connected to|HTTP/|< )"

echo ""
echo "4. DNS Resolution Test:"
nslookup $(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|https://||' | sed 's|/.*||') 2>&1

echo ""
echo "5. Quick Fixes to Try:"
echo "   - Visit https://app.supabase.com and check if your project is active"
echo "   - Restart your project if it's paused"
echo "   - Regenerate API keys if needed"
echo "   - Check firewall/proxy settings"
echo "   - Try from a different network"