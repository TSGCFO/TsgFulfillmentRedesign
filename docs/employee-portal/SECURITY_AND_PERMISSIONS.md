# Security and Permissions Documentation

## Overview

The Employee Portal implements a multi-layered security approach with role-based access control (RBAC), secure session management, and comprehensive audit logging.

## Authentication Architecture

### Session-Based Authentication

The portal uses Express sessions with the following configuration:

```javascript
{
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    sameSite: 'strict'
  },
  store: new PostgresStore({
    pool: pgPool,
    tableName: 'user_sessions'
  })
}
```

### Login Flow

1. User submits credentials to `/api/auth/login`
2. Credentials validated against database
3. User role and permissions loaded
4. Session created with user data
5. Secure cookie sent to browser
6. Subsequent requests include session cookie

## Role-Based Access Control (RBAC)

### User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `admin` | System administrators | Full access to all features |
| `manager` | Sales/Operations managers | Manage teams, approve orders |
| `employee` | Regular employees | View and update assigned tasks |
| `viewer` | Read-only access | View reports and data only |

### Permission Matrix

| Feature | Admin | Manager | Employee | Viewer |
|---------|-------|---------|----------|--------|
| **Quote Inquiries** |
| View all inquiries | ✓ | ✓ | ✗ | ✓ |
| View assigned inquiries | ✓ | ✓ | ✓ | ✓ |
| Create inquiry | ✓ | ✓ | ✓ | ✗ |
| Edit any inquiry | ✓ | ✓ | ✗ | ✗ |
| Edit assigned inquiry | ✓ | ✓ | ✓ | ✗ |
| Assign inquiry | ✓ | ✓ | ✗ | ✗ |
| Delete inquiry | ✓ | ✗ | ✗ | ✗ |
| **Contracts** |
| View contracts | ✓ | ✓ | ✓ | ✓ |
| Download contracts | ✓ | ✓ | ✓ | ✗ |
| Delete contracts | ✓ | ✗ | ✗ | ✗ |
| **Materials & Inventory** |
| View inventory | ✓ | ✓ | ✓ | ✓ |
| Update inventory | ✓ | ✓ | ✗ | ✗ |
| Create materials | ✓ | ✓ | ✗ | ✗ |
| Record usage | ✓ | ✓ | ✓ | ✗ |
| **Purchase Orders** |
| View all orders | ✓ | ✓ | ✗ | ✓ |
| Create orders | ✓ | ✓ | ✓ | ✗ |
| Approve orders | ✓ | ✓ | ✗ | ✗ |
| Cancel orders | ✓ | ✓ | ✗ | ✗ |
| **Reports** |
| View reports | ✓ | ✓ | ✓ | ✓ |
| Generate reports | ✓ | ✓ | ✗ | ✗ |
| Export data | ✓ | ✓ | ✗ | ✗ |
| **Settings** |
| Manage users | ✓ | ✗ | ✗ | ✗ |
| System settings | ✓ | ✗ | ✗ | ✗ |
| Integration config | ✓ | ✗ | ✗ | ✗ |

### Permission Implementation

```typescript
// Permission definitions
const PERMISSIONS = {
  // Quote Inquiries
  VIEW_ALL_INQUIRIES: 'view_all_inquiries',
  EDIT_INQUIRIES: 'edit_inquiries',
  ASSIGN_INQUIRIES: 'assign_inquiries',
  DELETE_INQUIRIES: 'delete_inquiries',
  
  // Contracts
  VIEW_CONTRACTS: 'view_contracts',
  MANAGE_CONTRACTS: 'manage_contracts',
  
  // Inventory
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // Purchase Orders
  CREATE_PURCHASE_ORDERS: 'create_purchase_orders',
  APPROVE_PURCHASE_ORDERS: 'approve_purchase_orders',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  GENERATE_REPORTS: 'generate_reports',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_USERS: 'manage_users'
};

// Role to permissions mapping
const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.VIEW_ALL_INQUIRIES,
    PERMISSIONS.EDIT_INQUIRIES,
    PERMISSIONS.ASSIGN_INQUIRIES,
    PERMISSIONS.VIEW_CONTRACTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.CREATE_PURCHASE_ORDERS,
    PERMISSIONS.APPROVE_PURCHASE_ORDERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORTS
  ],
  employee: [
    PERMISSIONS.EDIT_INQUIRIES,
    PERMISSIONS.VIEW_CONTRACTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_PURCHASE_ORDERS,
    PERMISSIONS.VIEW_REPORTS
  ],
  viewer: [
    PERMISSIONS.VIEW_ALL_INQUIRIES,
    PERMISSIONS.VIEW_CONTRACTS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_REPORTS
  ]
};
```

## API Security

### Request Authentication

All API endpoints require authentication:

```typescript
app.use('/api/employee', requireEmployeeAuth);
```

### Permission Checks

Sensitive operations require specific permissions:

```typescript
router.post('/purchase-orders/:id/approve', 
  requirePermission('approve_purchase_orders'),
  async (req, res) => {
    // Handler code
  }
);
```

### Input Validation

All inputs are validated using Zod schemas:

```typescript
const createQuoteInquiry = async (req, res) => {
  try {
    const validatedData = insertQuoteInquirySchema.parse(req.body);
    // Process validated data
  } catch (error) {
    return res.status(400).json({ error: 'Invalid input data' });
  }
};
```

### Rate Limiting

API endpoints are protected with rate limiting:

```typescript
const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/employee', rateLimiter);
```

## Data Security

### Database Security

1. **Connection Security**
   - SSL/TLS required for database connections
   - Connection pooling with secure credentials
   - Prepared statements to prevent SQL injection

2. **Data Encryption**
   - Sensitive data encrypted at rest
   - Password hashing using bcrypt (12 rounds)
   - API keys and tokens encrypted in database

3. **Access Control**
   - Row-level security (RLS) for multi-tenant data
   - Database user with minimal required privileges
   - Separate read-only user for reporting

### File Storage Security

1. **Supabase Storage**
   - Private buckets for contracts
   - Signed URLs with expiration
   - Access control via RLS policies

2. **Upload Validation**
   - File type validation
   - Size limits (10MB default)
   - Virus scanning (if configured)

## Integration Security

### HubSpot Integration

1. **Authentication**
   - OAuth 2.0 with private app
   - Access tokens stored encrypted
   - Automatic token refresh

2. **Data Sync**
   - One-way hashing for ID mapping
   - Minimal data exposure
   - Audit logging for all operations

### DocuSign Integration

1. **Authentication**
   - JWT authentication with RSA keys
   - Private key stored securely
   - Token caching with TTL

2. **Webhook Security**
   - HMAC signature validation
   - SSL/TLS required
   - IP whitelist (optional)

## Audit Logging

### What is Logged

1. **Authentication Events**
   - Login attempts (success/failure)
   - Logout events
   - Session timeouts
   - Password changes

2. **Data Operations**
   - Create/Read/Update/Delete actions
   - User performing action
   - Timestamp and IP address
   - Before/after values for updates

3. **Integration Events**
   - API calls to external services
   - Webhook receipts
   - Sync operations
   - Error conditions

### Log Structure

```json
{
  "timestamp": "2024-01-01T10:00:00Z",
  "level": "info",
  "event": "data_update",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "role": "employee"
  },
  "action": {
    "type": "update",
    "resource": "quote_inquiry",
    "resourceId": 456,
    "changes": {
      "status": {
        "from": "new",
        "to": "contacted"
      }
    }
  },
  "metadata": {
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "abc123"
  }
}
```

## Security Headers

The application sets the following security headers:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.hubspot.com", "https://demo.docusign.net"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## CORS Configuration

```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://www.tsgfulfillment.com'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

## Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use environment variables
   - Add `.env` to `.gitignore`
   - Rotate compromised credentials

2. **Validate all inputs**
   - Use Zod schemas
   - Sanitize user input
   - Validate file uploads

3. **Handle errors securely**
   - Don't expose stack traces
   - Log errors internally
   - Return generic error messages

4. **Keep dependencies updated**
   - Regular security audits
   - Update vulnerable packages
   - Use `npm audit` regularly

### For Administrators

1. **User Management**
   - Regular access reviews
   - Disable inactive accounts
   - Enforce strong passwords

2. **Monitoring**
   - Review audit logs daily
   - Set up security alerts
   - Monitor failed login attempts

3. **Backup and Recovery**
   - Regular automated backups
   - Test restore procedures
   - Secure backup storage

4. **Incident Response**
   - Document security procedures
   - Maintain incident log
   - Regular security drills

## Compliance Considerations

### Data Privacy

1. **Personal Data Handling**
   - Minimal data collection
   - Purpose limitation
   - Data retention policies
   - Right to deletion

2. **Data Protection**
   - Encryption in transit and at rest
   - Access controls
   - Regular security assessments
   - Data breach procedures

### Regulatory Compliance

1. **SOC 2 Type II**
   - Security controls
   - Availability monitoring
   - Processing integrity
   - Confidentiality measures

2. **GDPR (if applicable)**
   - Privacy by design
   - Data portability
   - Consent management
   - DPA agreements

## Security Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Database connections use SSL
- [ ] Session secret is strong (32+ characters)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Input validation on all endpoints
- [ ] Error handling doesn't leak information
- [ ] Audit logging enabled

### Post-Deployment

- [ ] Monitor security logs
- [ ] Set up intrusion detection
- [ ] Configure backup automation
- [ ] Document incident response
- [ ] Schedule security reviews
- [ ] Plan penetration testing
- [ ] Monitor dependency vulnerabilities
- [ ] Review access permissions
- [ ] Test disaster recovery
- [ ] Update security documentation