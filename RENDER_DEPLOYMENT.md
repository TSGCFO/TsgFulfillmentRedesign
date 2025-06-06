# Render Deployment Guide

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare your configuration values

## Database Setup

### 1. Create PostgreSQL Database
1. In Render Dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - Name: `tsg-fulfillment-db`
   - Database Name: `tsg_fulfillment`
   - User: `tsg_user`
   - Plan: Choose based on your needs (Start with Starter)

### 2. Note Database Connection Details
After creation, save these from the database info page:
- **Internal Database URL** (for connecting from your web service)
- **External Database URL** (for external connections)

## Web Service Setup

### 1. Create Web Service
1. In Render Dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `tsg-fulfillment`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose based on your needs (Start with Starter)

### 2. Environment Variables
Add these environment variables in Render:

```bash
# Required Variables
NODE_ENV=production
PORT=5000
DATABASE_URL=[Use Internal Database URL from your PostgreSQL service]
SESSION_SECRET=[Generate a secure random string]

# Supabase Configuration (from your current setup)
SUPABASE_URL=https://ahnneaclpkspcdtoqzkp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobm5lYWNscGtzcGNkdG9xemtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzgzNDcsImV4cCI6MjA2MDMxNDM0N30.3xfgsXV391EQynu_1PaSldkDiMf12-ygoRKsdQo5SnQ
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobm5lYWNscGtzcGNkdG9xemtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDczODM0NywiZXhwIjoyMDYwMzE0MzQ3fQ.8chAkrs9jswOSCsTgSnSoClm3EUy_qjnhqbQDzuA8KU
```

### 3. Build Settings
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: Latest LTS (automatically detected)

## Database Migration

### After First Deployment
1. Connect to your Render PostgreSQL database
2. Run database migration:
   ```bash
   npm run db:push
   ```

## File Structure for Deployment

The application is already configured with:
- ✅ Production build scripts
- ✅ Database configuration for PostgreSQL
- ✅ Environment-based storage selection
- ✅ Supabase integration for images
- ✅ Session management

## Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create Database** (as described above)

3. **Create Web Service** (as described above)

4. **Configure Environment Variables**

5. **Deploy**: Render will automatically build and deploy

6. **Run Database Migration**: After first successful deployment

## Post-Deployment

### Health Check
- Your application will be available at: `https://[your-service-name].onrender.com`
- Test the quote form and user authentication
- Verify database connectivity

### Monitoring
- Monitor logs in Render Dashboard
- Set up health checks if needed
- Configure custom domain if required

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify DATABASE_URL format
3. **Environment Variables**: Ensure all required variables are set
4. **Port Issues**: Application listens on PORT environment variable

### Database Issues
- Use Render's built-in database logs
- Check connection string format
- Verify PostgreSQL service is running

## Notes

- **Storage**: Images remain in Supabase storage
- **Database**: Application data in Render PostgreSQL
- **Sessions**: Stored in database (not memory)
- **Environment**: Automatically switches to DatabaseStorage in production