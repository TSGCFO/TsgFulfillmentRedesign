#!/bin/bash

# TSG Fulfillment MCP Server Startup Script
# This script starts Claude Code as an MCP server with project-specific configuration

set -e

# Configuration
PROJECT_NAME="TSG Fulfillment"
DEFAULT_PORT=3000
LOG_FILE="$HOME/.claude/mcp-server.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Claude Code is installed
    if ! command -v claude &> /dev/null; then
        error "Claude Code is not installed or not in PATH"
        exit 1
    fi
    
    # Check Claude Code version
    CLAUDE_VERSION=$(claude --version 2>/dev/null || echo "unknown")
    log "Claude Code version: $CLAUDE_VERSION"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        warn "package.json not found. Are you in the correct project directory?"
    fi
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
}

# Start MCP server
start_server() {
    local mode=${1:-"development"}
    local port=${2:-$DEFAULT_PORT}
    
    log "Starting Claude Code MCP Server for $PROJECT_NAME"
    log "Mode: $mode"
    log "Port: $port"
    
    # Export environment variables
    export PROJECT_NAME="$PROJECT_NAME"
    export NODE_ENV="$mode"
    export MCP_SERVER_PORT="$port"
    
    # Start server based on mode
    case $mode in
        "production")
            log "Starting in production mode (read-only)"
            claude mcp serve --read-only --port "$port" 2>&1 | tee -a "$LOG_FILE"
            ;;
        "development")
            log "Starting in development mode"
            claude mcp serve --port "$port" --verbose 2>&1 | tee -a "$LOG_FILE"
            ;;
        "readonly")
            log "Starting in read-only mode"
            claude mcp serve --read-only --port "$port" 2>&1 | tee -a "$LOG_FILE"
            ;;
        *)
            error "Unknown mode: $mode. Use 'development', 'production', or 'readonly'"
            exit 1
            ;;
    esac
}

# Show usage
show_usage() {
    echo "Usage: $0 [MODE] [PORT]"
    echo ""
    echo "MODE:"
    echo "  development  - Full access with verbose logging (default)"
    echo "  production   - Read-only access"
    echo "  readonly     - Read-only access"
    echo ""
    echo "PORT:"
    echo "  Port number (default: 3000)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Start in development mode on port 3000"
    echo "  $0 production         # Start in production mode on port 3000"
    echo "  $0 development 8080   # Start in development mode on port 8080"
}

# Signal handlers
cleanup() {
    log "Shutting down MCP server..."
    # Kill any background processes if needed
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main script
main() {
    local mode=${1:-"development"}
    local port=${2:-$DEFAULT_PORT}
    
    # Show help if requested
    if [[ "$1" == "-h" || "$1" == "--help" ]]; then
        show_usage
        exit 0
    fi
    
    log "TSG Fulfillment MCP Server Startup Script"
    log "========================================="
    
    check_prerequisites
    start_server "$mode" "$port"
}

# Run main function with all arguments
main "$@"