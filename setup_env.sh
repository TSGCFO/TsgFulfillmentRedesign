#!/usr/bin/env bash
# File: setup_env.sh
# Usage:  source ./setup_env.sh      (← MUST be *sourced*, not executed)

# 1. Write the .env file ------------------------------------------------------
cat > .env <<'EOF'
SESSION_SECRET="cIJccfCt7cVWJ7+O4J+OOHHNIkbSUaMsKwuyHRngOPLyBOdGYayOl/KP9ZosRWO4+HAj4vuboEvzrf7hqaHHrA=="
PGPORT="5432"
SUPABASE_URL="https://ahnneaclpkspcdtoqzkp.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobm5lYWNscGtzcGNkdG9xemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzgzNDcsImV4cCI6MjA2MDMxNDM0N30.3xfgsXV391EQynu_1PaSldkDiMf12-ygoRKsdQo5SnQ"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobm5lYWNscGtzcGNkdG9xemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDczODM0NywiZXhwIjoyMDYwMzE0MzQ3fQ.8chAkrs9jswOSCsTgSnSoClm3EUy_qjnhqbQDzuA8KU"
DOCUSIGN_ACCOUNT_ID="b3517833-f642-4e3f-93d7-143e5ee7fb13"
DOCUSIGN_INTEGRATION_KEY="dea51199-a1e0-4948-afca-c39274320387"
DOCUSIGN_USER_ID="2632ef99-599f-4026-ba1e-dd68cd1c3f3e"
HUBSPOT_ACCESS_TOKEN="pat-na1-94c33667-4bf2-4f37-bfa6-2c90181b972d"
PGHOST="dpg-d0dtgaidbo4c739abnv0-a"
PGDATABASE="tsg_fulfillment"
PGUSER="rpm_auto_user"
PGPASSWORD="x0nth4SNq4DqSzyRtI839S9IE5WE5TG6"
DOCUSIGN_PRIVATE_KEY="MIIEpAIBAAKCAQEAtdiaCAPxSPsqSqhy31kgWUIYsxQRDghPoJjiJR96RDzGR/EY greQ2IIrlrCgKwC65C7D1droE+mbtkpBSHtInVOrSS2yPdbDO9abS4j4sR7HomJd w/3s+/iuDnmK1MyZZggDLg89t/XGHzdubwJChH+pLnP5OqAlFeHhc/EOujFZ4MDX j2XSgn66PFitLk+q3PNu7UegeLZfFsrVKhnkoApyAmAnKU83c3wwyjmsAGUC26e+ d+zpqjsMTleodMjj2UkIm6ETSocqnE/UDYSH/yEQ7JSU02esH8F8kvTkmwlu1xZK XR7GTFRlXWLGoYS+l4IQJVyq8VGZCsZWtM26iwIDAQABAoIBAAWuAksnuF53YExJ DDyK80yD8WlSfT6mOjCfSElEn7G+UA1wWADB0ZAq22+ZIE5WT8T764+81b3/8Fd4 5Ka48h+jPMx4S0LM0J9DV3M8LXseJaZZMEJ6nHlDWjSznEw1AIakHkWdq93J4CLz PQG+iV0aeQzek+j5W03yKmAeuckSQZmsPogX0ahsESo+Invfx9u1X2W/Lhq3DJoO xCoozit1HIgkm5dh7qgG5X+9cf0XweULSbGufR3F+thCxI5PLVfcM3GhxPoBV6v6 EFGheybltzjY+KQ/3CwlzjY8nzN63Vl43TXWgjtNH45OKXkdx5Y3KqhNgsi1psB/ raD/SK0CgYEA75mSirmbY+qrGhqiExYN7vrRMKQOnziQdLbIW/+pMtWx8zxu5SOW 799V9D4p1xh4CkhFedHcZGZEs+nNO9Q9ssOP+jSMv2RBS1x8+6anWRW2gIcwAYtW TZ0Mp0yXhoPii/Z4vSERyAWrWcoQyLl2WqFo5cX7NkWoPy5irujpaX8CgYEAwksH d2foVYV40FL6ynbeKfvZRR2r8nj4YHqwUAAXO6UPlGuv2C+s+I7j3PKrPhHln2gB 30inKSITyuWMfdZ3CtIGPXY6i4rcGp/GiGst/eR7sn3yzrUG2EJDU6alVvVt8Y8h D9o7v6hODi6PK7UYTYSSUdujlY3MdwjpNQxOPPUCgYEAzhql0w18XMPFsWvNlWt4 SuWYwyWsqkwm/y8oRPM0YdUvARQwNI2bzfWo47QBm9Shlf67POJImljaqoTpFZkq BbdyB4HivNSJ0kDaBkNCW0BxQDiKFBn/AD6jXtpk0cJrQ4ieLdrfh9dQoalPLMtU wvtr15Op1/KtmsPVAa668hMCgYBU+OddC26K6IK76W6RWYc0KVcOaTmoI8vMthui AUgn57p2mNog3Ejzs9pn6SGHVeBs5NncwzOIQ8UQOXBGIKOTceMUwj48hRBZ/IKh au6EWYbXu0mTqYxCzEgRr5IkA9Z/jK9S9Yin+32XqjknTl5AmLg9YKecYpWHgbgs YSNeeQKBgQCwvA90quTRoymP17d01k4y44RTuNe15Fkm+pjDYJmyKMR3ejZHCCvf eeEImxhintq13/iNAXmU7sgW3RDP4tFrnd85lymwfTaZYFLG6acy8nvgXk5bOyc3 JjAIC3/Au2bFa5ViJ/rIMWD46KIEP+9xMrYrO6YnLrm7msCNFBWHoA=="
EMPLOYEE_AUTH_ENABLED="true"
VITE_EMPLOYEE_AUTH_ENABLED="true"
EMPLOYEE_PORTAL_ENABLED="true"
VITE_EMPLOYEE_PORTAL_ENABLED="true"
EMPLOYEE_USER_MANAGEMENT_ENABLED="true"
VITE_EMPLOYEE_USER_MANAGEMENT_ENABLED="true"
VITE_EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED="true"
EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED="true"
DATABASE_URL="postgresql://rpm_auto_user:x0nth4SNq4DqSzyRtI839S9IE5WE5TG6@dpg-d0dtgaidbo4c739abnv0-a.ohio-postgres.render.com/tsg_fulfillment"
EOF

# 2. Export everything in the .env file --------------------------------------
# set -a tells Bash to export every variable it encounters
set -a
# shellcheck disable=SC1091
source .env
set +a

echo "✅ .env created and variables exported into the current shell."
echo "   (Remember: if you open a NEW terminal, just run 'source ./.env' to bring them in again.)"