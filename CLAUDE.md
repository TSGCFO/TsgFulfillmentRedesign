# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (port 5000)
- `npm run build` - Build for production (client + server bundle)
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes using Drizzle

## Architecture Overview

This is a fullstack TypeScript application with a React frontend and Express backend:

### Frontend (client/)
- **Framework**: React 18 with Vite bundling
- **Routing**: Wouter for client-side routing with lazy loading
- **UI**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **State**: TanStack Query for server state management
- **SEO**: React Helmet for meta management, canonical URLs, and redirects

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Development**: Uses Vite dev server proxy in development
- **Production**: Serves static frontend assets

### Shared (shared/)
- **Schema**: Centralized Drizzle schema definitions with Zod validation
- **Types**: Type-safe database models and API contracts

## Key Configuration

- **Path Aliases**: `@/*` maps to `client/src/*`, `@shared/*` maps to `shared/*`
- **Database**: Configured via `DATABASE_URL` environment variable
- **Development Port**: Always serves on port 5000 (both API and frontend)
- **TypeScript**: Configured for strict mode with ESNext modules

## Database Schema

The application includes several key entities:
- **users**: Authentication and roles
- **quoteRequests**: Lead management system
- **Analytics tables**: inventoryLevels, shipments, orderStatistics, clientKpis
- **dashboardSettings**: Customizable dashboard configurations

## Development Notes

- Frontend uses lazy loading for all page components
- SEO-optimized with automatic canonical URL management
- Cookie consent system integrated
- Analytics and reporting dashboard functionality
- Comprehensive UI component library in `components/ui/`
- Custom hooks for intersection observer, mobile detection, and SEO