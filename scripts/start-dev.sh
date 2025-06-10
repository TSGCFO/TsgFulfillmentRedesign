#!/bin/bash

# Development Server Start Script
# Starts both frontend and backend development servers

set -e

echo "🚀 Starting TSG Fulfillment Employee Portal Development Environment..."

# Load development environment variables
if [ -f .env.development ]; then
    echo "📋 Loading development environment variables..."
    export $(cat .env.development | grep -v '^#' | xargs)
else
    echo "❌ .env.development file not found!"
    echo "Please run ./scripts/setup-dev-env.sh first"
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🔪 Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    fi
}

# Check and handle port conflicts
FRONTEND_PORT=3000
BACKEND_PORT=${PORT:-3001}

echo "🔍 Checking ports..."

if check_port $FRONTEND_PORT; then
    echo "⚠️ Port $FRONTEND_PORT is already in use"
    read -p "Kill existing process? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port $FRONTEND_PORT
    else
        echo "❌ Cannot start frontend on port $FRONTEND_PORT"
        exit 1
    fi
fi

if check_port $BACKEND_PORT; then
    echo "⚠️ Port $BACKEND_PORT is already in use"
    read -p "Kill existing process? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port $BACKEND_PORT
    else
        echo "❌ Cannot start backend on port $BACKEND_PORT"
        exit 1
    fi
fi

# Create log directory if it doesn't exist
mkdir -p logs

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    
    # Kill background processes
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on our ports
    kill_port $FRONTEND_PORT
    kill_port $BACKEND_PORT
    
    echo "✅ Development servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🖥️ Starting backend server on port $BACKEND_PORT..."
npm run server:dev > logs/backend-dev.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend server failed to start"
    echo "Check logs/backend-dev.log for errors"
    exit 1
fi

echo "✅ Backend server started (PID: $BACKEND_PID)"

# Start frontend server
echo "🌐 Starting frontend server on port $FRONTEND_PORT..."
npm run dev > logs/frontend-dev.log 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend server failed to start"
    echo "Check logs/frontend-dev.log for errors"
    cleanup
    exit 1
fi

echo "✅ Frontend server started (PID: $FRONTEND_PID)"

# Display startup information
echo ""
echo "🎉 Development environment is running!"
echo ""
echo "📱 Application URLs:"
echo "  Frontend: http://localhost:$FRONTEND_PORT"
echo "  Backend API: http://localhost:$BACKEND_PORT/api"
echo "  Employee Portal: http://localhost:$FRONTEND_PORT/employee/login"
echo ""
echo "👥 Test Users:"
echo "  admin / password123"
echo "  sales_manager / password123"
echo "  sales_rep1 / password123"
echo "  sales_rep2 / password123"
echo "  inventory_manager / password123"
echo ""
echo "📋 Development Commands:"
echo "  View backend logs: tail -f logs/backend-dev.log"
echo "  View frontend logs: tail -f logs/frontend-dev.log"
echo "  Database studio: npm run db:studio"
echo "  Run tests: npm run test:dev"
echo ""
echo "⏹️ Press Ctrl+C to stop both servers"
echo ""

# Wait for processes and monitor them
while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend server crashed!"
        echo "Check logs/backend-dev.log for errors"
        cleanup
        exit 1
    fi
    
    # Check if frontend is still running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend server crashed!"
        echo "Check logs/frontend-dev.log for errors"
        cleanup
        exit 1
    fi
    
    # Wait before next check
    sleep 5
done