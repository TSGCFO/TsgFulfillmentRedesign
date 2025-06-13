import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedAnalyticsData } from "./seed-data";
import {
  featureFlagMiddleware,
  featureFlagErrorHandler
} from "./middleware/feature-flags";
import featureFlagRoutes from "./routes/feature-flags";
import {
  initializeFeatureFlags,
  validateServerEnvironment,
  startFeatureFlagMonitoring
} from "./utils/feature-flags";

// Environment variable validation
function validateEnvironment() {
  const requiredVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'DOCUSIGN_INTEGRATION_KEY',
    'DOCUSIGN_USER_ID',
    'DOCUSIGN_ACCOUNT_ID',
    'DOCUSIGN_PRIVATE_KEY'
  ];

  const optionalVars = [
    'HUBSPOT_ACCESS_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease set these environment variables before starting the server.');
    process.exit(1);
  }

  console.log('✅ Required environment variables validated');
  
  const missingOptional = optionalVars.filter(varName => !process.env[varName]);
  if (missingOptional.length > 0) {
    console.warn('⚠️  Optional environment variables not set:');
    missingOptional.forEach(varName => console.warn(`   - ${varName}`));
    console.warn('   Some features may be unavailable.\n');
  }

  // Validate feature flag environment
  const ffValidation = validateServerEnvironment();
  if (!ffValidation.valid) {
    console.warn('⚠️  Feature flag environment validation warnings:');
    ffValidation.errors.forEach(error => console.warn(`   - ${error}`));
  }
}

// Validate environment before starting
validateEnvironment();

const analyticsEnabled = process.env.ANALYTICS_ENABLED === "true";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize feature flag middleware early in the stack
app.use(featureFlagMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize feature flag system
  try {
    await initializeFeatureFlags({
      enableLogging: process.env.NODE_ENV === 'development',
      debug: process.env.NODE_ENV === 'development',
      strict: process.env.NODE_ENV === 'production'
    });
    log('✅ Feature flag system initialized');
  } catch (error) {
    log(`❌ Feature flag initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('Feature flag system is required in production');
      process.exit(1);
    }
  }

  const server = await registerRoutes(app, analyticsEnabled);

  // Add feature flag routes
  app.use('/api/feature-flags', featureFlagRoutes);

  // Feature flag error handler (should be before general error handler)
  app.use(featureFlagErrorHandler);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  if (analyticsEnabled) {
    try {
      await seedAnalyticsData();
    } catch (error) {
      log(`Error seeding analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Start feature flag monitoring in production
  let featureFlagMonitor: NodeJS.Timeout | null = null;
  if (process.env.NODE_ENV === 'production') {
    try {
      featureFlagMonitor = startFeatureFlagMonitoring(300000); // 5 minutes
      log('✅ Feature flag monitoring started');
    } catch (error) {
      log(`⚠️  Feature flag monitoring failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Use PORT environment variable for production (Render) or default to 5000
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log('🚀 Server started with feature flag system enabled');
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully');
    if (featureFlagMonitor) {
      clearInterval(featureFlagMonitor);
      log('Feature flag monitoring stopped');
    }
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });
})();
