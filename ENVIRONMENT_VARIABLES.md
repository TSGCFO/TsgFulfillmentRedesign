# Environment Variables Documentation

This document describes all environment variables used in the TSG Fulfillment Redesign project.

## 📋 **Required Environment Variables**

### **Database Configuration**

#### `DATABASE_URL` (Required)
- **Type:** String
- **Description:** PostgreSQL connection string
- **Example:** `postgresql://username:password@localhost:5432/database_name`
- **Used in:** `server/db.ts`
- **Notes:** Must be set or the application will throw an error on startup

### **Server Configuration**

#### `NODE_ENV` (Optional)
- **Type:** String
- **Default:** `development`
- **Values:** `development` | `production` | `test`
- **Description:** Determines the runtime environment
- **Used in:** 
  - `server/index.ts` - Controls Vite setup and SSL settings
  - `server/db.ts` - Controls database SSL configuration

#### `PORT` (Optional)
- **Type:** Number
- **Default:** `5000`
- **Description:** Port number for the server to listen on
- **Used in:** `server/index.ts`
- **Notes:** Render and other hosting platforms typically provide this automatically

## 🔧 **Feature Flags**

#### `ANALYTICS_ENABLED` (Optional)
- **Type:** String
- **Values:** `"true"` | `"false"`
- **Default:** `"false"`
- **Description:** Server-side flag to enable/disable analytics endpoints
- **Used in:** 
  - `server/index.ts` - Controls analytics data seeding
  - `server/routes.ts` - Controls analytics route registration

#### `VITE_ANALYTICS_ENABLED` (Optional)
- **Type:** String
- **Values:** `"true"` | `"false"`
- **Default:** `"false"`
- **Description:** Client-side flag to enable/disable analytics features
- **Used in:** `client/src/App.tsx` - Controls analytics route rendering

## 📊 **Analytics Configuration**

#### `VITE_GA_MEASUREMENT_ID` (Optional)
- **Type:** String
- **Default:** `"G-GSWN00Z35Q"`
- **Description:** Google Analytics 4 Measurement ID
- **Used in:** `client/src/lib/analytics.ts`
- **Example:** `G-XXXXXXXXXX`
- **Notes:** If not provided, will use the default fallback ID

## 🗄️ **External Services**

#### `VITE_SUPABASE_URL` (Optional)
- **Type:** String
- **Description:** Supabase project URL
- **Used in:** Potentially in Supabase client configuration
- **Example:** `https://your-project.supabase.co`

#### `VITE_SUPABASE_ANON_KEY` (Optional)
- **Type:** String
- **Description:** Supabase anonymous/public key
- **Used in:** Potentially in Supabase client configuration
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 📁 **Environment File Examples**

### `.env.development`
```bash
# Database
DATABASE_URL="postgresql://localhost:5432/tsg_fulfillment_dev"

# Server
NODE_ENV="development"
PORT=5000

# Features
ANALYTICS_ENABLED="true"
VITE_ANALYTICS_ENABLED="true"

# Analytics
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# External Services (if used)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### `.env.production`
```bash
# Database (provided by hosting service)
DATABASE_URL="postgresql://prod-host:5432/tsg_fulfillment_prod"

# Server
NODE_ENV="production"
PORT=5000

# Features
ANALYTICS_ENABLED="true"
VITE_ANALYTICS_ENABLED="true"

# Analytics
VITE_GA_MEASUREMENT_ID="G-GSWN00Z35Q"

# External Services (if used)
VITE_SUPABASE_URL="https://your-prod-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-prod-anon-key"
```

### `.env.test`
```bash
# Database
DATABASE_URL="postgresql://localhost:5432/tsg_fulfillment_test"

# Server
NODE_ENV="test"
PORT=5001

# Features (typically disabled in tests)
ANALYTICS_ENABLED="false"
VITE_ANALYTICS_ENABLED="false"

# Analytics (not needed for tests)
# VITE_GA_MEASUREMENT_ID=""
```

## 🔒 **Security Notes**

1. **Never commit `.env` files to version control**
2. **Use different keys for development and production**
3. **Rotate keys regularly**
4. **Use hosting platform's environment variable management for production**

## 🚀 **Platform-Specific Setup**

### **Render.com**
1. Go to your service dashboard
2. Navigate to "Environment" tab
3. Add each environment variable
4. Redeploy the service

### **Vercel**
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add variables for each environment (Development/Preview/Production)

### **Local Development**
1. Copy `.env.example` to `.env`
2. Update values as needed
3. Restart your development server

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Database connection fails**
   - Check `DATABASE_URL` format
   - Ensure database is running and accessible

2. **Analytics not working**
   - Verify `VITE_ANALYTICS_ENABLED="true"`
   - Check `VITE_GA_MEASUREMENT_ID` is correct

3. **Server won't start**
   - Ensure `DATABASE_URL` is set
   - Check for typos in variable names

4. **Environment variables not loading**
   - Restart development server after changes
   - Check file is named `.env` (not `.env.txt`)
   - Ensure no spaces around `=` sign