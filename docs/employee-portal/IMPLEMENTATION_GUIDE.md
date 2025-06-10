# Employee Portal Implementation Guide

## Implementation Timeline

**Total Duration**: 14 working days
**Team Size**: 2-3 developers

## Phase 1: Database Setup (Days 1-2)

### Day 1: Database Schema Creation

#### Task 1.1: Create Migration File (30 minutes)
**Developer**: Backend Developer

1. Open terminal in project root directory
2. Execute command:
   ```bash
   mkdir -p server/db/migrations
   touch server/db/migrations/001_employee_portal.sql
   ```
3. Open the file `server/db/migrations/001_employee_portal.sql`
4. Copy the complete schema from `docs/employee-portal/database/SCHEMA.sql`
5. Save the file

#### Task 1.2: Create Drizzle Schema Files (45 minutes)
**Developer**: Backend Developer

1. Execute command:
   ```bash
   touch shared/schema/employee-portal.ts
   ```
2. Open `shared/schema/employee-portal.ts`
3. Copy the complete Drizzle schema from `docs/employee-portal/database/DRIZZLE_SCHEMA.ts`
4. Save the file

#### Task 1.3: Update Schema Index (10 minutes)
**Developer**: Backend Developer

1. Open file `shared/schema/index.ts`
2. Add at the end of the file:
   ```typescript
   export * from "./employee-portal";
   ```
3. Save the file

#### Task 1.4: Run Database Migration (15 minutes)
**Developer**: Backend Developer

1. Open terminal in project root
2. Execute command:
   ```bash
   npm run db:push
   ```
3. Verify success message appears
4. If error occurs, STOP and debug before proceeding

### Day 2: Verify Database and Create Test Data

#### Task 2.1: Verify Database Tables (30 minutes)
**Developer**: Backend Developer

1. Connect to PostgreSQL database
2. Run verification query:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE '%employee%' 
   OR table_name IN ('sales_team_members', 'quote_inquiries', 'contracts', 
                     'materials', 'vendors', 'purchase_orders');
   ```
3. Verify all 12 tables exist
4. Document any missing tables

#### Task 2.2: Create Seed Script (45 minutes)
**Developer**: Backend Developer

1. Execute command:
   ```bash
   mkdir -p server/scripts
   touch server/scripts/seed-employee-portal.ts
   ```
2. Copy seed script from `docs/employee-portal/database/SEED_SCRIPT.ts`
3. Execute seed script:
   ```bash
   npx tsx server/scripts/seed-employee-portal.ts
   ```
4. Verify data inserted successfully

## Phase 2: Backend API Development (Days 3-5)

### Day 3: Install Dependencies and Create Services

#### Task 3.1: Install Required Packages (20 minutes)
**Developer**: Backend Developer

1. Open terminal in project root
2. Execute command:
   ```bash
   npm install @hubspot/api-client docusign-esign jsonwebtoken
   npm install --save-dev @types/jsonwebtoken
   ```
3. Verify package.json updated
4. Commit changes

#### Task 3.2: Create Service Directory Structure (10 minutes)
**Developer**: Backend Developer

1. Execute commands:
   ```bash
   mkdir -p server/services/employee-portal
   touch server/services/employee-portal/hubspot.service.ts
   touch server/services/employee-portal/docusign.service.ts
   ```

#### Task 3.3: Implement HubSpot Service (90 minutes)
**Developer**: Backend Developer

1. Open `server/services/employee-portal/hubspot.service.ts`
2. Copy complete service code from `docs/employee-portal/services/HUBSPOT_SERVICE.ts`
3. Save file
4. Verify no TypeScript errors

#### Task 3.4: Implement DocuSign Service (90 minutes)
**Developer**: Backend Developer

1. Open `server/services/employee-portal/docusign.service.ts`
2. Copy complete service code from `docs/employee-portal/services/DOCUSIGN_SERVICE.ts`
3. Save file
4. Verify no TypeScript errors

### Day 4: Create API Routes

#### Task 4.1: Create Routes File (30 minutes)
**Developer**: Backend Developer

1. Execute command:
   ```bash
   touch server/routes/employee-portal.routes.ts
   ```
2. Copy routes code from `docs/employee-portal/routes/EMPLOYEE_PORTAL_ROUTES.ts`
3. Save file

#### Task 4.2: Register Routes in Main Application (15 minutes)
**Developer**: Backend Developer

1. Open `server/routes.ts`
2. Add import at top:
   ```typescript
   import employeePortalRoutes from "./routes/employee-portal.routes";
   ```
3. Inside `registerRoutes` function, add after health check:
   ```typescript
   // Employee Portal Routes
   app.use("/api/employee", employeePortalRoutes);
   ```
4. Save file

#### Task 4.3: Test API Endpoints (60 minutes)
**Developer**: Backend Developer

1. Start development server:
   ```bash
   npm run dev
   ```
2. Test each endpoint using Postman or similar tool
3. Document any errors
4. Create test collection for future use

### Day 5: Create Authentication Middleware

#### Task 5.1: Create Auth Middleware (45 minutes)
**Developer**: Backend Developer

1. Execute command:
   ```bash
   mkdir -p server/middleware
   touch server/middleware/employee-auth.ts
   ```
2. Copy middleware code from `docs/employee-portal/middleware/EMPLOYEE_AUTH.ts`
3. Save file

#### Task 5.2: Update Routes with Auth (30 minutes)
**Developer**: Backend Developer

1. Open `server/routes/employee-portal.routes.ts`
2. Replace auth import with:
   ```typescript
   import { requireEmployeeAuth, requirePermission } from "../middleware/employee-auth";
   ```
3. Update all route middleware
4. Add permission checks to sensitive routes
5. Save and test

## Phase 3: Frontend Development (Days 6-9)

### Day 6: Create Layout and Navigation

#### Task 6.1: Create Component Structure (20 minutes)
**Developer**: Frontend Developer

1. Execute commands:
   ```bash
   mkdir -p client/src/components/employee-portal
   mkdir -p client/src/pages/employee
   ```

#### Task 6.2: Create Layout Component (60 minutes)
**Developer**: Frontend Developer

1. Create file:
   ```bash
   touch client/src/components/employee-portal/EmployeePortalLayout.tsx
   ```
2. Copy layout code from `docs/employee-portal/components/LAYOUT.tsx`
3. Save file
4. Verify no TypeScript errors

#### Task 6.3: Create Main Portal Page (45 minutes)
**Developer**: Frontend Developer

1. Create file:
   ```bash
   touch client/src/pages/EmployeePortal.tsx
   ```
2. Copy main page code from `docs/employee-portal/pages/EMPLOYEE_PORTAL.tsx`
3. Save file

### Day 7: Create Quote Management Interface

#### Task 7.1: Create Quote Inquiries Component (90 minutes)
**Developer**: Frontend Developer

1. Create file:
   ```bash
   touch client/src/components/employee-portal/QuoteInquiries.tsx
   ```
2. Copy component code from `docs/employee-portal/components/QUOTE_INQUIRIES.tsx`
3. Save file
4. Test component rendering

#### Task 7.2: Create Quote Detail Modal (60 minutes)
**Developer**: Frontend Developer

1. Create file:
   ```bash
   touch client/src/components/employee-portal/QuoteDetailModal.tsx
   ```
2. Implement quote detail view
3. Add edit functionality
4. Test modal operations

### Day 8: Create Contract Management Interface

#### Task 8.1: Create Contracts Component (90 minutes)
**Developer**: Frontend Developer

1. Create file:
   ```bash
   touch client/src/components/employee-portal/Contracts.tsx
   ```
2. Copy component code from `docs/employee-portal/components/CONTRACTS.tsx`
3. Implement contract list view
4. Add search and filter functionality

#### Task 8.2: Create Contract Viewer (60 minutes)
**Developer**: Frontend Developer

1. Create file:
   ```bash
   touch client/src/components/employee-portal/ContractViewer.tsx
   ```
2. Implement PDF viewer using Supabase URLs
3. Add download functionality
4. Test with sample contracts

### Day 9: Create Inventory Management Interface

#### Task 9.1: Create Materials Component (90 minutes)
**Developer**: Frontend Developer

1. Create file:
   ```bash
   touch client/src/components/employee-portal/Materials.tsx
   ```
2. Copy component code from `docs/employee-portal/components/MATERIALS.tsx`
3. Implement material list with inventory levels
4. Add low-stock indicators

#### Task 9.2: Create Vendors Component (60 minutes)
**Developer**: Frontend Developer

1. Create file:
   ```bash
   touch client/src/components/employee-portal/Vendors.tsx
   ```
2. Implement vendor management interface
3. Add vendor creation form
4. Test CRUD operations

## Phase 4: Integration Setup (Days 10-11)

### Day 10: Configure HubSpot Integration

#### Task 10.1: Setup HubSpot Private App (60 minutes)
**Developer**: Backend Developer

1. Log into HubSpot account
2. Navigate to Settings > Integrations > Private Apps
3. Create new private app named "TSG Employee Portal"
4. Grant required scopes:
   - crm.objects.contacts.read
   - crm.objects.contacts.write
   - crm.objects.deals.read
   - crm.objects.deals.write
   - crm.objects.owners.read
5. Copy access token to `.env` file

#### Task 10.2: Test HubSpot Sync (45 minutes)
**Developer**: Backend Developer

1. Create test inquiry in portal
2. Verify deal created in HubSpot
3. Update deal in HubSpot
4. Verify update reflected in portal
5. Document any sync issues

### Day 11: Configure DocuSign Integration

#### Task 11.1: Setup DocuSign Integration (90 minutes)
**Developer**: Backend Developer

1. Log into DocuSign Developer account
2. Create new integration
3. Generate RSA keypair
4. Configure redirect URI:
   ```
   https://www.tsgfulfillment.com/api/employee/docusign/callback
   ```
5. Add webhook URL:
   ```
   https://www.tsgfulfillment.com/api/employee/docusign/webhook
   ```
6. Copy credentials to `.env` file

#### Task 11.2: Configure Supabase Storage (30 minutes)
**Developer**: Backend Developer

1. Log into Supabase dashboard
2. Create new bucket named "contracts"
3. Set bucket to private
4. Configure RLS policies:
   ```sql
   CREATE POLICY "Employee Portal Access" ON storage.objects
   FOR ALL USING (bucket_id = 'contracts');
   ```

## Phase 5: Testing and Security (Days 12-13)

### Day 12: Security Implementation

#### Task 12.1: Implement Session Security (60 minutes)
**Developer**: Backend Developer

1. Update session configuration
2. Enable secure cookies for production
3. Implement CSRF protection
4. Test authentication flow

#### Task 12.2: API Rate Limiting (45 minutes)
**Developer**: Backend Developer

1. Install rate limiting package:
   ```bash
   npm install express-rate-limit
   ```
2. Configure rate limits for API endpoints
3. Test rate limiting behavior
4. Document limits for API users

### Day 13: End-to-End Testing

#### Task 13.1: Create E2E Test Suite (120 minutes)
**Developer**: QA/Frontend Developer

1. Create test file:
   ```bash
   touch e2e/employee-portal.spec.ts
   ```
2. Implement tests for:
   - Login flow
   - Quote inquiry management
   - Contract viewing
   - Inventory operations
3. Run full test suite
4. Document any failures

#### Task 13.2: Performance Testing (60 minutes)
**Developer**: Backend Developer

1. Test API response times
2. Verify database query performance
3. Check frontend load times
4. Optimize any slow operations

## Phase 6: Deployment (Day 14)

### Day 14: Production Deployment

#### Task 14.1: Pre-Deployment Checklist (60 minutes)
**Developer**: DevOps/Backend Developer

1. Verify all environment variables set
2. Run production build:
   ```bash
   npm run build
   ```
3. Test build locally
4. Review security checklist
5. Backup current production

#### Task 14.2: Deploy to Production (90 minutes)
**Developer**: DevOps/Backend Developer

1. Deploy database migrations
2. Deploy application code
3. Verify all services running
4. Test critical paths
5. Monitor logs for errors

#### Task 14.3: Post-Deployment Verification (60 minutes)
**Developer**: All Team

1. Test login at `/employee`
2. Verify quote inquiries load
3. Test HubSpot sync
4. Test DocuSign webhook
5. Verify file uploads work
6. Check all navigation
7. Create sample purchase order
8. Generate test report

## Critical Success Factors

1. **Never skip database migration verification**
2. **Test each API endpoint before frontend integration**
3. **Verify all environment variables before deployment**
4. **Maintain detailed logs of integration setup**
5. **Document any deviations from this guide**

## Rollback Plan

If critical issues occur:
1. Revert to previous deployment
2. Restore database backup
3. Disable employee portal route
4. Notify team of rollback
5. Debug in staging environment