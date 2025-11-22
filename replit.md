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
- **Authentication**: Replit Auth (OIDC) with session management
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: Database-backed sessions in production, memory-based in development
- **File Storage**: Supabase for image and document storage

## Key Components

### Authentication System
- **Replit Auth**: OIDC-based authentication supporting Google, GitHub, X (Twitter), Apple, and email/password login
- **Employee Linking**: Users table with optional linkage to employees table for employee portal access
- **Roles**: SuperAdmin, Admin, User with hierarchical permissions (linked to employee records)
- **Session Management**: Express-session with database persistence, environment-conditional secure cookies
- **Protected Routes**: Client-side route protection using useAuth hook and ProtectedRoute wrapper

### Employee Portal Features
- **User Management**: Create, update, and deactivate employee accounts
- **Customer Inquiries**: Manage quote requests and customer communications
- **Analytics Dashboard**: Real-time metrics and performance indicators
- **Contract Management**: DocuSign integration for electronic signatures
- **Inventory Tracking**: Stock levels and warehouse management

### Database Schema
- **users**: Replit Auth user profiles (id, username, displayName, profileImage, email)
- **sessions**: Express session storage for authentication state
- **employees**: Employee records with optional userId linkage for portal access
- **quote_requests**: Customer inquiries and service requests
- **inquiry_assignments**: Assignment of inquiries to employees
- **contracts**: DocuSign contract management
- **inventory_levels**: Stock tracking and warehouse management
- **shipments**: Delivery and logistics tracking
- **analytics tables**: Performance metrics and KPIs

## Data Flow

### Authentication Flow
1. User clicks login and is redirected to Replit Auth (/api/login)
2. Replit Auth OIDC flow authenticates user with chosen provider (Google, GitHub, etc.)
3. Callback endpoint (/api/callback) processes authentication response
4. User profile stored in users table, session created in database
5. Protected routes check /api/auth/user endpoint for authentication status
6. Employee portal access granted if user has linked employee record
7. Role-based access control applied based on employee.role field

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

## Recent Changes

- November 22, 2025: Completed Replit Auth migration
  - **AUTH UPDATE**: Fully migrated from Passport.js to Replit's OpenID Connect authentication
  - Supports multiple login providers: Google, GitHub, X (Twitter), Apple, and email/password
  - Backend Implementation:
    - New OIDC setup in server/replitAuth.ts with production-ready configuration
    - Auth endpoints: /api/login, /api/callback, /api/logout, /api/auth/user
    - Session configuration with environment-conditional secure cookies
    - Database-backed session storage using connect-pg-simple
  - Database Schema Updates:
    - Added users table for Replit Auth profiles
    - Added sessions table for authentication state persistence
    - Modified employees table with optional userId field for account linking
    - Added getEmployeeByUserId() method for efficient lookups
  - Frontend Implementation:
    - Simple useAuth hook with React Query integration
    - ProtectedRoute wrapper for authenticated pages
    - Clean routing without AuthProvider context complexity
    - All employee portal routes properly protected
  - Testing & Validation:
    - Application runs without console errors
    - Auth endpoints respond correctly (401 for unauthenticated users)
    - Session management working in both development and production modes
    - Clean browser console logs confirming successful integration
  
- June 20, 2025: Fixed Google Search Console structured data validation errors
  - **SEO FIX**: Added proper JSON-LD structured data to FAQ section with mainEntity property
  - Fixed "Missing field 'mainEntity'" error for FAQPage schema
  - **SCHEMA FIXES**: Corrected Organization, LocalBusiness, Service, Article, and HowTo schemas
  - **REVIEW FIXES**: Fixed testimonial/review structured data validation issues
  - Enhanced image objects with proper ImageObject type and dimensions
  - Fixed provider references to use complete Organization objects instead of @id references
  - Improved areaServed properties with proper geographic entity types
  - Added proper Review schema with datePublished, itemReviewed, and aggregateRating
  - Removed conflicting microdata attributes in favor of clean JSON-LD implementation
  - Updated all structured data templates to meet Google's validation requirements

- June 14, 2025: Critical security vulnerability patched
  - **SECURITY FIX**: Removed hardcoded JWT tokens and API keys from deployment documentation
  - Replaced exposed Supabase credentials with placeholder instructions in all deployment files
  - Updated render.yaml to use secure environment variable configuration
  - Enhanced .gitignore to prevent future accidental commits of sensitive documentation
  - Added security warnings to all deployment guides

- June 14, 2025: Security hardening and 404 fixes
  - Enhanced .gitignore to protect sensitive data (API keys, database URLs, secrets)
  - Fixed Google Search Console 404 indexing issues
  - Updated sitemap generation to match actual service slugs
  - Added 301 redirects for incorrectly crawled image URLs
  - Fixed robots.txt to prevent image files from being indexed as pages
  - Corrected service URL mapping in sitemap (order-fulfillment → fulfillment)
  - Added server-side redirects for legacy URLs

## Changelog

- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.