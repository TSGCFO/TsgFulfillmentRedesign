# Employee Portal Quick Reference

## Project Structure

```
employee-portal/
├── server/
│   ├── routes/
│   │   └── employee-portal.routes.ts
│   ├── services/
│   │   └── employee-portal/
│   │       ├── hubspot.service.ts
│   │       └── docusign.service.ts
│   ├── middleware/
│   │   └── employee-auth.ts
│   └── db/
│       └── migrations/
│           └── 001_employee_portal.sql
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   └── EmployeePortal.tsx
│   │   └── components/
│   │       └── employee-portal/
│   │           ├── EmployeePortalLayout.tsx
│   │           ├── QuoteInquiries.tsx
│   │           ├── Contracts.tsx
│   │           ├── Materials.tsx
│   │           ├── Vendors.tsx
│   │           └── PurchaseOrders.tsx
│   └── shared/
│       └── schema/
│           └── employee-portal.ts
└── docs/
    └── employee-portal/
```

## Key URLs

- **Portal Access**: `https://www.tsgfulfillment.com/employee`
- **API Base**: `https://www.tsgfulfillment.com/api/employee`
- **DocuSign Webhook**: `https://www.tsgfulfillment.com/api/employee/docusign/webhook`
- **HubSpot Webhook**: `https://www.tsgfulfillment.com/api/employee/hubspot/webhook`

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Authentication
SESSION_SECRET=your-32-character-secret-key

# HubSpot
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx
HUBSPOT_PIPELINE_ID=default
HUBSPOT_PORTAL_ID=12345678

# DocuSign
DOCUSIGN_INTEGRATION_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_USER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_ACCOUNT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOCUSIGN_RSA_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Quick Commands

```bash
# Development
npm run dev                    # Start dev server
npm run db:push               # Run migrations
npm run seed:employee-portal  # Seed test data

# Testing
npm run test:unit            # Run unit tests
npm run test:integration     # Run integration tests
npm run test:e2e            # Run E2E tests

# Production
npm run build               # Build for production
npm run start              # Start production server
```

## API Endpoints

### Authentication Required
All endpoints require session authentication.

### Quote Inquiries
```
GET    /quote-inquiries         # List all inquiries
POST   /quote-inquiries         # Create new inquiry
PUT    /quote-inquiries/:id     # Update inquiry
POST   /quote-inquiries/:id/assign  # Assign to sales member
```

### Contracts
```
GET    /contracts              # List all contracts
POST   /docusign/webhook       # DocuSign webhook endpoint
```

### Materials & Inventory
```
GET    /materials              # List all materials
POST   /materials              # Create new material
POST   /materials/:id/usage    # Record material usage
GET    /materials/reorder-needed  # Get low stock items
```

### Vendors
```
GET    /vendors                # List all vendors
POST   /vendors                # Create new vendor
```

### Purchase Orders
```
GET    /purchase-orders        # List all orders
POST   /purchase-orders        # Create new order
POST   /purchase-orders/:id/approve  # Approve order
```

### Sync Operations
```
POST   /sync/hubspot          # Manual HubSpot sync
```

## Database Tables

1. `sales_team_members` - Sales team directory
2. `quote_inquiries` - Quote request tracking
3. `contracts` - DocuSign contract storage
4. `quote_versions` - Quote history
5. `materials` - Material catalog
6. `vendors` - Vendor directory
7. `material_inventory` - Current stock levels
8. `material_prices` - Vendor pricing
9. `material_usage` - Usage tracking
10. `purchase_orders` - Purchase orders
11. `purchase_order_items` - Order line items
12. `hubspot_sync_log` - Sync history

## User Roles & Permissions

| Role | Key Permissions |
|------|----------------|
| `admin` | Full access to all features |
| `manager` | Manage teams, approve orders |
| `employee` | View/edit assigned items |
| `viewer` | Read-only access |

## Common Tasks

### Add New User
```sql
-- 1. Create user account
INSERT INTO users (email, password_hash, role) 
VALUES ('user@tsg.com', '$2b$12$...', 'employee');

-- 2. Add to sales team
INSERT INTO sales_team_members (user_id, full_name, email)
VALUES (LASTVAL(), 'John Doe', 'user@tsg.com');
```

### Create Quote Inquiry
```typescript
const inquiry = await fetch('/api/employee/quote-inquiries', {
  method: 'POST',
  body: JSON.stringify({
    quoteRequestId: 123,
    priority: 'high',
    notes: 'Urgent customer'
  })
});
```

### Record Material Usage
```typescript
await fetch('/api/employee/materials/1/usage', {
  method: 'POST',
  body: JSON.stringify({
    quantityUsed: 10,
    usedFor: 'Order #12345',
    usageDate: '2024-01-01'
  })
});
```

## Troubleshooting

### Common Issues

1. **Login Issues**
   - Check session cookie
   - Verify user role
   - Check SESSION_SECRET

2. **HubSpot Sync Fails**
   - Verify access token
   - Check rate limits
   - Review sync logs

3. **DocuSign Webhook Not Received**
   - Verify SSL certificate
   - Check webhook URL
   - Test with webhook.site

4. **Database Errors**
   - Check migrations ran
   - Verify foreign keys
   - Review constraints

### Debug Mode

```bash
# Enable debug logging
DEBUG=employee-portal:* npm run dev

# HubSpot debug
HUBSPOT_DEBUG=true npm run dev

# DocuSign debug
DOCUSIGN_DEBUG=true npm run dev
```

### Log Locations

- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Audit logs: `logs/audit.log`
- Sync logs: Database table `hubspot_sync_log`

## Support Contacts

- **Technical Issues**: dev-team@tsgfulfillment.com
- **HubSpot Support**: https://help.hubspot.com
- **DocuSign Support**: https://support.docusign.com
- **Database Admin**: dba@tsgfulfillment.com