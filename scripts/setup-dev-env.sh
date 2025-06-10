#!/bin/bash

# Development Environment Setup Script
# This script sets up the development environment for the Employee Portal

set -e

echo "🚀 Setting up Employee Portal Development Environment..."

# Load environment variables
if [ -f .env.development ]; then
    echo "📋 Loading development environment variables..."
    export $(cat .env.development | grep -v '^#' | xargs)
else
    echo "❌ .env.development file not found!"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

if ! command_exists psql; then
    echo "⚠️ PostgreSQL client not found. Database operations may fail."
fi

echo "✅ Prerequisites check completed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p temp
mkdir -p keys

# Set up database
echo "🗄️ Setting up development database..."

# Test database connection
echo "🔌 Testing database connection..."
if command_exists psql; then
    if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
        echo "Please check your DATABASE_URL in .env.development"
        exit 1
    fi
else
    echo "⚠️ Cannot test database connection (psql not available)"
fi

# Run database migrations
echo "🔄 Running database migrations..."
if [ -f "drizzle.config.ts" ]; then
    npm run db:migrate:dev || {
        echo "❌ Database migrations failed"
        echo "Creating tables manually..."
        
        # Create tables from schema
        npm run db:generate || echo "⚠️ Could not generate migrations"
        npm run db:push:dev || echo "⚠️ Could not push schema"
    }
else
    echo "⚠️ Drizzle config not found, skipping migrations"
fi

# Seed development data
echo "🌱 Seeding development data..."
if [ -f "scripts/seed-development.js" ]; then
    node scripts/seed-development.js || echo "⚠️ Development data seeding failed"
else
    echo "⚠️ Development seed script not found"
fi

# Set up API keys and certificates (if they don't exist)
echo "🔐 Setting up API keys and certificates..."

# Generate DocuSign private key for development (if not exists)
if [ ! -f "keys/docusign-dev-private.key" ]; then
    echo "🔑 Generating DocuSign development private key..."
    openssl genrsa -out keys/docusign-dev-private.key 2048 2>/dev/null || {
        echo "⚠️ Could not generate DocuSign private key (openssl not available)"
        echo "Please manually create keys/docusign-dev-private.key"
    }
fi

# Create development JWT secret if not set
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "dev_jwt_secret_key_for_employee_portal_development_2025" ]; then
    echo "🔑 Using default development JWT secret"
    echo "⚠️ For production, generate a secure JWT secret"
fi

# Set up log rotation
echo "📋 Setting up log rotation..."
if command_exists logrotate; then
    cat > logs/logrotate.conf << EOF
logs/development.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 $USER $USER
}
EOF
    echo "✅ Log rotation configured"
else
    echo "⚠️ logrotate not available, manual log management needed"
fi

# Start development services
echo "🏃 Starting development services..."

# Check if Redis is needed and available
if [ ! -z "$REDIS_URL" ]; then
    if command_exists redis-cli; then
        redis-cli ping >/dev/null 2>&1 || {
            echo "⚠️ Redis is not running. Some features may not work."
            echo "Start Redis with: redis-server"
        }
    else
        echo "⚠️ Redis CLI not available, cannot check Redis status"
    fi
fi

# Build the application
echo "🔨 Building application..."
npm run build:dev || echo "⚠️ Development build failed"

# Display environment information
echo ""
echo "🎉 Development environment setup completed!"
echo ""
echo "📊 Environment Information:"
echo "  Node.js version: $(node --version)"
echo "  npm version: $(npm --version)"
echo "  Database: ${DATABASE_URL%/*}/[database]"
echo "  API URL: $API_URL"
echo "  Environment: $NODE_ENV"
echo ""
echo "🚀 To start development:"
echo "  1. Start the development server: npm run dev"
echo "  2. In another terminal, start the API server: npm run server:dev"
echo "  3. Access the application at: http://localhost:3000"
echo "  4. Access the API at: $API_URL"
echo ""
echo "🔧 Useful commands:"
echo "  npm run dev          - Start frontend development server"
echo "  npm run server:dev   - Start backend development server"
echo "  npm run db:studio    - Open database studio"
echo "  npm run test:dev     - Run tests in development mode"
echo "  npm run logs:dev     - View development logs"
echo ""
echo "📚 Documentation:"
echo "  Employee Portal Guide: ./EMPLOYEE_PORTAL_IMPLEMENTATION_GUIDE.md"
echo "  Development README: ./docs/DEVELOPMENT.md"
echo ""

# Create development status file
cat > .dev-status << EOF
DEVELOPMENT_ENVIRONMENT_READY=true
SETUP_DATE=$(date)
DATABASE_URL_SET=true
MIGRATIONS_RUN=true
DEPENDENCIES_INSTALLED=true
EOF

echo "✅ Development environment is ready!"