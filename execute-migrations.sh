#!/bin/bash

# Load environment variables
source .env.local

# Supabase configuration from environment
SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

echo "🔄 Testing Supabase connection..."

# Test basic connection
response=$(curl -s -X GET \
    "${SUPABASE_URL}/rest/v1/" \
    -H "apikey: ${SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}")

if echo "$response" | grep -q "swagger\|openapi"; then
    echo "✅ Successfully connected to Supabase"
else
    echo "❌ Failed to connect to Supabase"
    echo "Response: $response"
    exit 1
fi

echo
echo "📋 Available migration files:"
migration_files=(
    "supabase/migrations/00001_comprehensive_schema.sql"
    "supabase/migrations/00002_initial_data.sql"
    "supabase/migrations/00003_rls_policies.sql"  
    "supabase/migrations/00004_storage_setup.sql"
    "supabase/migrations/00005_debug_trigger.sql"
    "supabase/migrations/00006_fix_user_trigger.sql"
    "supabase/migrations/00007_fix_missing_tables.sql"
    "supabase/migrations/00008_improve_user_creation.sql"
)

for file in "${migration_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "  ✅ $(basename "$file")"
    else
        echo "  ❌ $(basename "$file") - File not found"
    fi
done

echo
echo "⚠️  IMPORTANT: SQL migrations need to be executed through Supabase Dashboard"
echo
echo "🔗 Manual execution steps:"
echo "1. Go to: ${SUPABASE_URL/https:\/\//https://app.supabase.com/project/}sql/new"
echo "2. Copy and paste each migration file content in order:"
echo

for i in "${!migration_files[@]}"; do
    file="${migration_files[$i]}"
    if [[ -f "$file" ]]; then
        echo "   Step $((i+1)): $(basename "$file")"
        echo "   File location: $file"
        echo
    fi
done

echo "📄 Would you like me to display the content of each migration file? [y/N]"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    for file in "${migration_files[@]}"; do
        if [[ -f "$file" ]]; then
            echo
            echo "================== $(basename "$file") =================="
            cat "$file"
            echo
            echo "============================================================"
            echo
        fi
    done
fi