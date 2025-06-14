# TSG Fulfillment Employee Portal

## Overview

TSG Fulfillment is a comprehensive employee portal application built with React frontend and Express backend, designed for fulfillment service management. The application provides employee authentication, customer inquiry management, analytics dashboard, and integrations with DocuSign and HubSpot for streamlined business operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with shadcn/ui theme system
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: React Router for client-side navigation
- **Testing**: Vitest with React Testing Library and Playwright for E2E

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session management
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: Database-backed sessions in production, memory-based in development
- **File Storage**: Supabase for image and document storage

## Key Components

### Authentication System
- **Employee Authentication**: Username/password based login with role-based access control
- **Roles**: SuperAdmin, Admin, User with hierarchical permissions
- **Session Management**: Express-session with database persistence in production
- **Password Security**: Scrypt hashing for new passwords, bcrypt compatibility for migrated data

### Employee Portal Features
- **User Management**: Create, update, and deactivate employee accounts
- **Customer Inquiries**: Manage quote requests and customer communications
- **Analytics Dashboard**: Real-time metrics and performance indicators
- **Contract Management**: DocuSign integration for electronic signatures
- **Inventory Tracking**: Stock levels and warehouse management

### Database Schema
- **employees**: User authentication and profile information
- **quote_requests**: Customer inquiries and service requests
- **inquiry_assignments**: Assignment of inquiries to employees
- **contracts**: DocuSign contract management
- **inventory_levels**: Stock tracking and warehouse management
- **shipments**: Delivery and logistics tracking
- **analytics tables**: Performance metrics and KPIs

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Passport.js validates against employee database
3. Session created and stored in database
4. Protected routes check authentication middleware
5. Role-based access control applied to resources

### Customer Inquiry Process
1. Quote requests submitted through public form
2. Inquiries automatically assigned to available employees
3. HubSpot integration creates corresponding deals/contacts
4. Status tracking through inquiry lifecycle
5. Contract generation through DocuSign integration

### Analytics Pipeline
1. Real-time data collection from various modules
2. Aggregation of metrics in dedicated analytics tables
3. Dashboard queries optimized for performance
4. Data visualization through React components

## External Dependencies

### Required Integrations
- **PostgreSQL Database**: Primary data storage with SSL connection
- **Supabase**: File storage and CDN for images/documents
- **DocuSign API**: Electronic signature and contract management
- **HubSpot API**: CRM integration for customer relationship management

### Third-Party Services
- **Render**: Production hosting and database services
- **Supabase Storage**: CDN-backed file storage with global distribution
- **DocuSign**: JWT-based authentication for document signing
- **HubSpot**: OAuth token-based API access for CRM operations

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **Vite**: Development server and build optimization
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Production Environment
- **Hosting**: Render web service with auto-scaling
- **Database**: Render PostgreSQL with SSL encryption
- **Build Process**: Vite production build with code splitting
- **Environment Variables**: Secure configuration through Render dashboard
- **Health Monitoring**: Built-in health check endpoints

### Development Workflow
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Development database with local migrations
- **Testing**: Automated test suite with CI/CD integration
- **Code Quality**: TypeScript strict mode with ESLint configuration

### Feature Flags
- **Employee Portal**: Configurable feature enablement
- **Analytics**: Optional analytics collection and dashboards
- **Integrations**: Toggleable third-party service connections
- **UI Features**: Progressive enhancement with feature flags

## Changelog

- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.