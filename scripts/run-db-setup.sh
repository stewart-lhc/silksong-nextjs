#!/bin/bash

# Database Setup Script for Unix/Linux/macOS
# Provides easy database management for the Silksong project

set -e  # Exit on any error

echo "🚀 Database Setup Script"
echo "======================="

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found ($(node --version))"

# Check environment file
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found"
    echo "Please create .env.local with required Supabase credentials:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    exit 1
fi

echo "✅ Environment file found"

# Parse command line arguments
COMMAND=${1:-"interactive"}
SKIP_CHECK=${2:-"false"}

case $COMMAND in
    "status")
        echo ""
        echo "🔍 Running database status check..."
        node scripts/db-admin.js status
        ;;
    
    "setup")
        if [ "$SKIP_CHECK" != "true" ]; then
            echo ""
            echo "🔍 Running pre-setup status check..."
            node scripts/db-admin.js status
            
            echo ""
            read -p "Continue with setup? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Setup cancelled"
                exit 0
            fi
        fi
        
        echo ""
        echo "🏗️  Running full database setup..."
        node scripts/db-admin.js setup
        ;;
        
    "repair")
        echo ""
        echo "🔧 Running database repair..."
        node scripts/db-admin.js repair
        ;;
        
    "backup")
        echo ""
        echo "💾 Creating database backup..."
        node scripts/db-admin.js backup
        ;;
        
    "monitor")
        echo ""
        echo "📊 Showing database monitoring dashboard..."
        node scripts/db-admin.js monitor
        ;;
        
    "interactive")
        echo ""
        echo "Starting interactive mode..."
        node scripts/db-admin.js
        ;;
        
    "help")
        echo ""
        echo "Available commands:"
        echo "  ./run-db-setup.sh status     - Check database health"
        echo "  ./run-db-setup.sh setup      - Run full database setup"
        echo "  ./run-db-setup.sh repair     - Repair database issues"
        echo "  ./run-db-setup.sh backup     - Create database backup"
        echo "  ./run-db-setup.sh monitor    - Show monitoring dashboard"
        echo "  ./run-db-setup.sh interactive - Start interactive mode (default)"
        echo "  ./run-db-setup.sh help       - Show this help"
        echo ""
        echo "Examples:"
        echo "  ./run-db-setup.sh                    # Interactive mode"
        echo "  ./run-db-setup.sh setup true         # Setup without confirmation"
        echo "  ./run-db-setup.sh status             # Just check status"
        ;;
        
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "Use './run-db-setup.sh help' to see available commands"
        exit 1
        ;;
esac

echo ""
echo "✨ Operation completed!"