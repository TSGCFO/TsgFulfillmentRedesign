# Render Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup ✅
- [x] PostgreSQL database created on Render
- [x] Database name: `rpm_auto_db`
- [x] Database user: `rpm_auto_db_user`
- [x] Connection URL configured

### 2. Code Preparation ✅
- [x] Environment-based storage selection implemented
- [x] Production health check endpoints added
- [x] PORT environment variable support added
- [x] Database migration commands configured
- [x] Supabase integration maintained for images

## Deployment Steps

### Step 1: Create Web Service
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `tsg-fulfillment`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 2: Configure Environment Variables
Add these in your Render Web Service settings:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://rpm_auto_db_user:3rtvd9rkVV39XShKhq5nq8LUk@dpg-ctjhul56l47c73f2l1v0-a.ohio-postgres.render.com:5432/rpm_auto_db
SESSION_SECRET=[Generate 64-character random string]
SUPABASE_URL=https://ahnneaclpkspcdtoqzkp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobm5lYWNscGtzcGNkdG9xemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzgzNDcsImV4cCI6MjA2MDMxNDM0N30.3xfgsXV391EQynu_1PaSldkDiMf12-ygoRKsdQo5SnQ
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobm5lYWNscGtzcGNkdG9xemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDczODM0NywiZXhwIjoyMDYwMzE0MzQ3fQ.8chAkrs9jswOSCsTgSnSoClm3EUy_qjnhqbQDzuA8KU
```

### Step 3: Deploy
1. Push your code to GitHub
2. Render will automatically build and deploy
3. Monitor the build logs for any issues

### Step 4: Post-Deployment
1. Run database migrations: `npm run db:push`
2. Test the application functionality
3. Verify Supabase integration for images

## Testing Checklist

### After Deployment
- [ ] Application loads successfully
- [ ] Health check endpoint responds: `/health`
- [ ] Quote form submission works
- [ ] User authentication functions
- [ ] Analytics dashboard displays (if enabled)
- [ ] Images load from Supabase storage
- [ ] Database connections are stable

## Important Notes

- **Database**: PostgreSQL on Render
- **Images**: Supabase storage (unchanged)
- **Sessions**: Database-backed in production
- **Environment**: Automatically switches to DatabaseStorage in production

## Support

For deployment issues:
1. Check Render build logs
2. Verify environment variables
3. Test database connectivity
4. Check application logs in Render dashboard