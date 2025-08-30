@echo off
echo 🚀 Database Setup Script for Windows
echo ================================

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found

echo Checking environment file...
if not exist ".env.local" (
    echo ❌ .env.local file not found
    echo Please create .env.local with required Supabase credentials
    echo Required variables:
    echo   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    echo   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    pause
    exit /b 1
)

echo ✅ Environment file found

echo.
echo Running database status check...
node scripts/db-admin.js status

echo.
echo Press any key to continue with full setup...
pause >nul

echo.
echo Running full database setup...
node scripts/db-admin.js setup

echo.
echo Setup complete! Press any key to exit...
pause >nul