#!/usr/bin/env bash
# File: setup_env.sh
# Usage:  source ./setup_env.sh      (← MUST be *sourced*, not executed)

# 1. Write the .env file ------------------------------------------------------
cat > .env <<'EOF'
SESSION_SECRET="cIJccfCt7cVWJ7+O4J+OOHHNIkbSUaMsKwuyHRngOPLyBOdGYayOl/KP9ZosRWO4+HAj4vuboEvzrf7hqaHHrA=="
DATABASE_URL="postgresql://neondb_owner:npg_Nh8dvaTjJe9E@ep-blue-silence-a50z7o4j.us-east-2.aws.neon.tech/neondb?sslmode=require"
PGDATABASE="neondb"
PGHOST="ep-blue-silence-a50z7o4j.us-east-2.aws.neon.tech"
PGPORT="5432"
PGUSER="neondb_owner"
PGPASSWORD="npg_Nh8dvaTjJe9E"
SUPABASE_URL="https://ahnneaclpkspcdtoqzkp.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobm5lYWNscGtzcGNkdG9xemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzgzNDcsImV4cCI6MjA2MDMxNDM0N30.3xfgsXV391EQynu_1PaSldkDiMf12-ygoRKsdQo5SnQ"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobm5lYWNscGtzcGNkdG9xemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDczODM0NywiZXhwIjoyMDYwMzE0MzQ3fQ.8chAkrs9jswOSCsTgSnSoClm3EUy_qjnhqbQDzuA8KU"
EOF

# 2. Export everything in the .env file --------------------------------------
# set -a tells Bash to export every variable it encounters
set -a
# shellcheck disable=SC1091
source .env
set +a

echo "✅ .env created and variables exported into the current shell."
echo "   (Remember: if you open a NEW terminal, just run 'source ./.env' to bring them in again.)"