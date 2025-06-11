# Feature Flags Implementation Guide

## Overview

This guide shows you how to implement and use the feature flag system for your employee portal. The system provides multiple control mechanisms so you can safely deploy your employee portal without exposing it to users until you're ready.

## 🚀 Quick Start (5 Minutes)

### Option 1: Environment Variables (Simplest)

1. **Copy the environment template:**
   ```bash
   cp .env.example.feature-flags .env.feature-flags
   ```

2. **Add to your main `.env` file:**
   ```bash
   # Employee Portal Feature Flags
   EMPLOYEE_AUTH_ENABLED=true
   EMPLOYEE_PORTAL_ENABLED=true
   EMPLOYEE_USER_MANAGEMENT_ENABLED=false
   EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED=false
   
   # Client-side flags (must match server-side)
   VITE_EMPLOYEE_AUTH_ENABLED=true
   VITE_EMPLOYEE_PORTAL_ENABLED=true
   VITE_EMPLOYEE_USER_MANAGEMENT_ENABLED=false
   VITE_EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED=false
   ```

3. **Restart your application:**
   ```bash
   npm run dev
   ```

4. **Test the employee portal:**
   - Navigate to `/auth` to login
   - Navigate to `/employee` to access the portal
   - User management and customer inquiries will be hidden

### Option 2: Admin UI (Most Flexible)

1. **Enable the basic flags via environment variables first** (see Option 1)

2. **Access the admin panel:**
   - Login as a SuperAdmin user
   - Navigate to `/admin/feature-flags`
   - Toggle flags and configure rollouts

3. **Configure gradual rollout:**
   - Set rollout percentage (e.g., 25% of users)
   - Enable for specific roles (e.g., only "Admin" users)
   - Enable for specific usernames for testing

## 📋 Complete Implementation

### 1. Server-Side Implementation ✅

The feature flag system is implemented in `server/feature-flags.ts` with:
- Environment variable support
- Database persistence (ready for future implementation)
- User/role-specific rollouts
- Percentage-based rollouts

### 2. API Endpoints ✅

**Public Endpoints:**
- `GET /api/feature-flags` - Get flags for current user

**Admin Endpoints (SuperAdmin only):**
- `GET /api/admin/feature-flags` - Get all flags
- `POST /api/admin/feature-flags/:flagName/enable` - Enable a flag
- `POST /api/admin/feature-flags/:flagName/disable` - Disable a flag

### 3. Client-Side Integration ✅

**React Context and Hooks:**
```tsx
import { useFeatureFlag, FeatureFlag } from '@/hooks/use-feature-flags';

// Hook usage
function MyComponent() {
  const isEnabled = useFeatureFlag('employee_portal');
  
  if (!isEnabled) {
    return <div>Feature not available</div>;
  }
  
  return <div>Feature content</div>;
}

// Component usage
function App() {
  return (
    <FeatureFlag flag="employee_portal">
      <EmployeePortalComponent />
    </FeatureFlag>
  );
}
```

### 4. Protected Routes ✅

Employee portal routes are now wrapped with feature flags:
```tsx
<FeatureFlag flag="employee_portal">
  <ProtectedRoute 
    path="/employee" 
    component={EmployeePortal} 
    requiredRoles={["SuperAdmin", "Admin", "User"]} 
  />
</FeatureFlag>
```

## 🎯 Deployment Strategy

### Phase 1: Deploy with Everything Disabled
```bash
# In your .env file
EMPLOYEE_AUTH_ENABLED=false
EMPLOYEE_PORTAL_ENABLED=false
EMPLOYEE_USER_MANAGEMENT_ENABLED=false
EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED=false
```
- Deploy to production
- No users can access employee features
- Code is live but inactive

### Phase 2: Enable for Testing
```bash
# Enable just for you (via admin UI or env vars)
EMPLOYEE_AUTH_ENABLED=true
EMPLOYEE_PORTAL_ENABLED=true
```
- Test login/logout functionality
- Test main employee portal
- Only SuperAdmin users can access `/admin/feature-flags`

### Phase 3: Gradual Rollout
Using the admin UI (`/admin/feature-flags`):
1. **Enable for specific users:**
   - Add your username and test users to "Enabled for Users"
   
2. **Enable for specific roles:**
   - Start with "SuperAdmin" role
   - Then add "Admin" role
   - Finally add "User" role

3. **Percentage rollout:**
   - Start with 10% of users
   - Increase to 25%, 50%, 75%, 100%

### Phase 4: Enable Additional Features
```bash
# Enable user management
EMPLOYEE_USER_MANAGEMENT_ENABLED=true

# Enable customer inquiries
EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED=true
```

## 🔧 Advanced Configuration

### Environment Variables

**Server-side flags (processed by Node.js):**
- `EMPLOYEE_PORTAL_ENABLED` - Main portal access
- `EMPLOYEE_AUTH_ENABLED` - Authentication routes
- `EMPLOYEE_USER_MANAGEMENT_ENABLED` - User management
- `EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED` - Customer inquiries

**Client-side flags (processed by Vite):**
- `VITE_EMPLOYEE_PORTAL_ENABLED` - Main portal access
- `VITE_EMPLOYEE_AUTH_ENABLED` - Authentication routes
- `VITE_EMPLOYEE_USER_MANAGEMENT_ENABLED` - User management
- `VITE_EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED` - Customer inquiries

### Admin UI Features

Access via `/admin/feature-flags` (SuperAdmin only):

1. **Toggle flags on/off**
2. **Rollout percentage** - Enable for X% of authenticated users
3. **Role-based access** - Always enable for specific roles
4. **User-based access** - Always enable for specific usernames
5. **Real-time updates** - Changes take effect immediately

### API Usage Examples

**Enable a flag for 25% of users:**
```bash
curl -X POST http://localhost:5000/api/admin/feature-flags/employee_portal/enable \
  -H "Content-Type: application/json" \
  -d '{"rolloutPercentage": 25}'
```

**Enable a flag for specific roles:**
```bash
curl -X POST http://localhost:5000/api/admin/feature-flags/employee_portal/enable \
  -H "Content-Type: application/json" \
  -d '{"roles": ["SuperAdmin", "Admin"]}'
```

**Disable a flag:**
```bash
curl -X POST http://localhost:5000/api/admin/feature-flags/employee_portal/disable
```

## 🛡️ Security Notes

1. **Feature flag admin UI** requires SuperAdmin role
2. **API endpoints** are protected with authentication
3. **Client-side flags** are fetched based on user context
4. **Environment variables** are validated on server startup

## 🚨 Emergency Controls

### Instant Disable via Environment
If something goes wrong, instantly disable via environment variables:
```bash
# Set in your hosting platform (Render, Vercel, etc.)
EMPLOYEE_PORTAL_ENABLED=false
EMPLOYEE_AUTH_ENABLED=false
```

### Admin UI Emergency Disable
1. Login as SuperAdmin
2. Go to `/admin/feature-flags`
3. Toggle off the problematic feature
4. Changes take effect immediately

## 📊 Monitoring

### Check Current Flag Status
```bash
# Get flags for current user
curl http://localhost:5000/api/feature-flags

# Get all flags (SuperAdmin only)
curl http://localhost:5000/api/admin/feature-flags
```

### Flag Status in Logs
The system logs feature flag operations:
```
Feature flag 'employee_portal' updated: {enabled: true, rolloutPercentage: 25}
```

## 🔄 Future Enhancements

The system is designed to support:
1. **Database persistence** - Store flags in database for persistence
2. **A/B testing** - Split traffic between different implementations  
3. **Time-based flags** - Auto-enable/disable at specific times
4. **Dependency flags** - Flags that depend on other flags
5. **Analytics integration** - Track flag performance and usage

## 🆘 Troubleshooting

### Feature Not Showing Up
1. Check environment variables are set correctly
2. Verify both server and client variables match
3. Check user has required role
4. Verify feature flag is enabled in admin UI

### Admin UI Not Accessible
1. Ensure user has SuperAdmin role
2. Check authentication is working
3. Verify `/admin/feature-flags` route is enabled

### Flags Not Updating
1. Check server logs for errors
2. Verify API endpoints are working
3. Clear browser cache and refresh
4. Check network requests in browser dev tools

## 📞 Support

If you need help with feature flags:
1. Check this guide first
2. Review the error logs
3. Test with environment variables first (simpler)
4. Use the admin UI for advanced configurations