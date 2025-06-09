# Delaying Deployment of the Analytics Page

## Purpose
The analytics section of the application is still under development and is not intended to be deployed in all environments. To prevent unfinished features from being exposed, the analytics pages, API endpoints and database seeding are disabled unless explicitly enabled through configuration.

## Implementation
A feature flag is used to control whether analytics functionality is available. Two environment variables must be set to `true` for analytics to be enabled:

- `ANALYTICS_ENABLED` for the server
- `VITE_ANALYTICS_ENABLED` for the client

If these variables are not set or are `false`, analytics pages are hidden from the UI and the server does not seed or expose analytics routes.

## Changes in commit `9965ef4e`
Commit `9965ef4e4774eb771667be06112c5fdbc9c47d97` introduced the feature flag and conditional logic. Key updates include:

- Added `.env.example` defining `ANALYTICS_ENABLED`, `VITE_ANALYTICS_ENABLED`, and a placeholder `DATABASE_URL`.
- Updated `client/src/App.tsx` so analytics routes are only registered when `VITE_ANALYTICS_ENABLED` is `true`.
- Updated `client/src/components/Navbar.tsx` to show or hide the Analytics link based on the same client flag.
- Modified `server/index.ts` to read `ANALYTICS_ENABLED` and pass it to `registerRoutes`. Analytics data seeding now only occurs when this flag is enabled.
- Updated `server/routes.ts` so analytics API endpoints are registered only when the flag is `true`.

## Configuration
1. Copy `.env.example` to `.env` and set the values for your environment.
2. Ensure both `ANALYTICS_ENABLED` and `VITE_ANALYTICS_ENABLED` are set to `true` in environments where you want analytics enabled.
3. Deploy the application normally. When the flags are `false`, analytics pages and endpoints are omitted.
