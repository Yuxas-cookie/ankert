#!/bin/bash

# Supabase configuration
SUPABASE_URL="https://ffsalcmgbzrpkdertels.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sbp_573a52caa62fd2d713b3c417d0e1699a4311d847"

echo "🔄 Testing Supabase connection..."

# Test basic connection
response=$(curl -s -X GET \
    "${SUPABASE_URL}/rest/v1/" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

if echo "$response" | grep -q "swagger"; then
    echo "✅ Successfully connected to Supabase"
else
    echo "❌ Failed to connect to Supabase"
    echo "Response: $response"
    exit 1
fi

echo
echo "📋 Available migration files:"
for file in supabase/migrations/*.sql; do
    if [[ -f "$file" ]]; then
        echo "  - $(basename "$file")"
    fi
done

echo
echo "⚠️  Note: Direct SQL execution through REST API requires special setup."
echo "🔗 Please use one of these methods to execute migrations:"
echo
echo "1. 🌐 Supabase Dashboard SQL Editor:"
echo "   https://ffsalcmgbzrpkdertels.supabase.co/project/ffsalcmgbzrpkdertels/sql/new"
echo
echo "2. 🛠️  Install Supabase CLI and run locally:"
echo "   brew install supabase/tap/supabase"
echo "   supabase link --project-ref ffsalcmgbzrpkdertels"
echo "   supabase db push"
echo
echo "3. 📂 Copy migration files manually:"
echo "   Each migration file is ready to copy and paste into the SQL editor"