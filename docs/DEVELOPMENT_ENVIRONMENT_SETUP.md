# Development Environment Setup Guide

This guide will help you set up the development environment for the TSG Fulfillment Employee Portal project using the separate development database.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Git**
- **PostgreSQL client** (optional, for database management)
- **Redis** (optional, for caching)

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd TsgFulfillmentRedesign

# Install dependencies
npm install
```

### 2. Run Automated Setup

```bash
# Run the automated development environment setup
npm run setup:dev
```

This script will:
- ✅ Check prerequisites
- 📋 Load environment variables
- 🗄️ Test database connection
- 🔄 Run database migrations
- 🌱 Seed development data
- 🔐 Set up API keys and certificates
- 📋 Configure logging

### 3. Start Development Servers

```bash
# Start both frontend and backend servers
npm run start:dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Employee Portal**: http://localhost:3000/employee/login

## Manual Setup (Alternative)

If you prefer to set up manually or the automated script fails:

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env.development
```

Edit `.env.development` with your settings:

```bash
# Database Configuration
DATABASE_URL=postgresql://rpm_auto_user:x0nth4SNq4DqSzyRtI839S9IE5WE5TG6@dpg-d0dtgaidbo4c739abnv0-a.ohio-postgres.render.com/feature_dev

# Server Configuration
PORT=3001
NODE_ENV=development

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Add other configuration as needed...
```

### 2. Database Setup

```bash
# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate:dev

# Push schema to database
npm run db:push:dev

# Seed development data
npm run db:seed:dev
```

### 3. Start Development Servers

Start frontend and backend separately:

```bash
# Terminal 1: Start backend
npm run server:dev

# Terminal 2: Start frontend  
npm run dev
```

## Development Database Information

**Database Details:**
- **Host**: dpg-d0dtgaidbo4c739abnv0-a.ohio-postgres.render.com
- **Database**: feature_dev
- **Username**: rpm_auto_user
- **Environment**: Development/Testing only

**Connection String:**
```
postgresql://rpm_auto_user:x0nth4SNq4DqSzyRtI839S9IE5WE5TG6@dpg-d0dtgaidbo4c739abnv0-a.ohio-postgres.render.com/feature_dev
```

## Test Users

The development environment comes with pre-seeded test users:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `password123` | admin | Full system access |
| `sales_manager` | `password123` | sales_manager | Sales team management |
| `sales_rep1` | `password123` | sales_rep | Sales representative |
| `sales_rep2` | `password123` | sales_rep | Sales representative |
| `inventory_manager` | `password123` | inventory_manager | Inventory management |

## Available Scripts

### Development
```bash
npm run dev                 # Start frontend development server
npm run server:dev          # Start backend development server
npm run start:dev           # Start both servers with monitoring
npm run setup:dev           # Setup development environment
```

### Database
```bash
npm run db:generate         # Generate database migrations
npm run db:migrate:dev      # Run migrations (development)
npm run db:push:dev         # Push schema to development database
npm run db:studio           # Open database studio
npm run db:seed:dev         # Seed development data
```

### Testing
```bash
npm run test:dev            # Run tests in development mode
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage
npm run test:api            # Run API tests only
npm run test:integration    # Run integration tests only
npm run test:unit           # Run unit tests only
```

### End-to-End Testing
```bash
npm run e2e                 # Run E2E tests
npm run e2e:headed          # Run E2E tests with visible browser
npm run e2e:ui              # Run E2E tests with UI
npm run e2e:debug           # Debug E2E tests
```

### Utilities
```bash
npm run logs:dev            # View development logs
npm run logs:backend        # View backend logs
npm run logs:frontend       # View frontend logs
npm run clean               # Clean build artifacts
npm run clean:dev           # Clean development artifacts
```

## Project Structure

```
TsgFulfillmentRedesign/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and libraries
├── server/                 # Backend Express application
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   └── __tests__/         # Backend tests
├── shared/                 # Shared code between frontend/backend
│   └── schema.ts          # Database schema
├── scripts/               # Development and deployment scripts
├── tests/                 # Test configuration and utilities
├── e2e/                   # End-to-end tests
└── migrations/            # Database migrations
```

## Development Workflow

### 1. Daily Development

```bash
# Start development environment
npm run start:dev

# Make your changes to code

# Run tests frequently
npm run test:watch

# View logs if needed
npm run logs:backend
```

### 2. Database Changes

```bash
# After modifying shared/schema.ts
npm run db:generate        # Generate migration
npm run db:migrate:dev     # Apply migration
```

### 3. Testing New Features

```bash
# Run full test suite
npm run test:all

# Test in browser
# Visit: http://localhost:3000/employee/login
```

### 4. API Development

```bash
# Test API endpoints
curl http://localhost:3001/api/employee/auth/login

# View API logs
npm run logs:backend
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check if database URL is correct
echo $DATABASE_URL

# Test connection manually
psql "postgresql://rpm_auto_user:x0nth4SNq4DqSzyRtI839S9IE5WE5TG6@dpg-d0dtgaidbo4c739abnv0-a.ohio-postgres.render.com/feature_dev" -c "SELECT 1;"
```

#### 2. Port Already in Use
```bash
# Kill processes on ports 3000 and 3001
npx kill-port 3000 3001

# Or manually find and kill
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

#### 3. Missing Environment Variables
```bash
# Verify environment file exists
ls -la .env.development

# Check if variables are loaded
npm run server:dev
# Look for error messages about missing variables
```

#### 4. Migration Errors
```bash
# Reset migrations (be careful!)
rm -rf migrations/
npm run db:generate
npm run db:push:dev
npm run db:seed:dev
```

#### 5. Test Failures
```bash
# Clear test database and reseed
npm run db:push:test
npm run test:integration
```

### Getting Help

1. **Check logs first**:
   ```bash
   npm run logs:backend
   npm run logs:frontend
   ```

2. **Verify environment setup**:
   ```bash
   cat .env.development
   npm run check
   ```

3. **Database studio for DB issues**:
   ```bash
   npm run db:studio
   ```

4. **Reset development environment**:
   ```bash
   npm run clean:dev
   npm run setup:dev
   ```

## Environment-Specific Notes

### Development Environment
- Uses development database: `feature_dev`
- Enables detailed logging and debugging
- Hot reload for frontend and backend
- Relaxed security settings for easier development

### Test Environment
- Uses same database but with isolated test data
- Faster execution with minimal logging
- Automated cleanup after tests
- Stricter timeout settings

### Production Environment
- Uses production database (separate)
- Optimized builds and caching
- Enhanced security settings
- Comprehensive logging and monitoring

## Security Considerations

### Development Security
- Development database credentials are shared for team access
- JWT secrets are simplified for development
- API keys may be mock/sandbox versions
- Debug endpoints may be enabled

### Important Notes
- **Never commit real API keys** to version control
- **Use development/sandbox accounts** for external services
- **Keep production and development environments separate**
- **Regularly rotate development credentials** if compromised

## Performance Tips

### Development Performance
- Use `npm run test:watch` for rapid test feedback
- Enable query logging to debug slow database operations
- Use `npm run db:studio` for visual database management
- Monitor logs for performance warnings

### Database Optimization
- Development database has connection pooling configured
- Test runs use fewer database connections
- Indexes are automatically created during migrations

## Next Steps

After successful setup:

1. **Explore the Employee Portal**: http://localhost:3000/employee/login
2. **Review the API documentation**: Check `EMPLOYEE_PORTAL_IMPLEMENTATION_GUIDE.md`
3. **Run the test suite**: `npm run test:all`
4. **Check code quality**: `npm run check`
5. **Start developing**: Make changes and see them live!

## Additional Resources

- [Employee Portal Implementation Guide](./EMPLOYEE_PORTAL_IMPLEMENTATION_GUIDE.md)
- [Testing Documentation](../tests/README.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_CHECKLIST.md)