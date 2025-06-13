#!/bin/bash

# Supabase configuration
SUPABASE_URL="https://ffsalcmgbzrpkdertels.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sbp_573a52caa62fd2d713b3c417d0e1699a4311d847"

# Function to execute SQL via Supabase REST API
execute_sql() {
    local sql_file="$1"
    local sql_content=$(cat "$sql_file")
    
    echo "🚀 Executing migration: $(basename "$sql_file")"
    
    # Use Supabase REST API to execute SQL
    response=$(curl -X POST \
        "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"sql\": $(echo "$sql_content" | jq -R -s .)}" \
        2>/dev/null)
    
    if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
        echo "❌ Error executing migration: $(basename "$sql_file")"
        echo "$response" | jq '.error'
        return 1
    else
        echo "✅ Successfully executed migration: $(basename "$sql_file")"
        return 0
    fi
}

# Main execution
echo "🔄 Starting database migrations..."
echo

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required but not installed. Please install jq first."
    exit 1
fi

# Migration files in order
migrations=(
    "supabase/migrations/00001_comprehensive_schema.sql"
    "supabase/migrations/00002_initial_data.sql"
    "supabase/migrations/00003_rls_policies.sql"
    "supabase/migrations/00004_storage_setup.sql"
)

# Execute migrations in order
for migration in "${migrations[@]}"; do
    if [[ -f "$migration" ]]; then
        if ! execute_sql "$migration"; then
            echo "💥 Migration process failed. Stopping execution."
            exit 1
        fi
        echo
    else
        echo "❌ Migration file not found: $migration"
        exit 1
    fi
done

echo "🎉 All migrations completed successfully!"