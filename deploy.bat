@echo off
REM =============================================================================
REM Demo Node.js + MySQL Application - Deployment Script for Windows
REM =============================================================================

setlocal enabledelayedexpansion

REM Colors for output
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Check if Docker is installed
:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not installed. Please install Docker Desktop first."
    exit /b 1
)
call :print_status "Docker is installed"
goto :eof

REM Check if Docker Compose is available
:check_docker_compose
docker compose version >nul 2>&1
if errorlevel 1 (
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        call :print_error "Docker Compose is not available. Please install Docker Compose first."
        exit /b 1
    )
)
call :print_status "Docker Compose is available"
goto :eof

REM Check if .env file exists
:check_env_file
if not exist .env (
    call :print_warning ".env file not found. Creating from .env.example..."
    if exist .env.example (
        copy .env.example .env >nul
        call :print_warning "Please edit .env file with your configuration before running the application."
        call :print_warning "Especially update the database passwords and other sensitive values."
    ) else (
        call :print_error ".env.example file not found. Please create .env file manually."
        exit /b 1
    )
) else (
    call :print_status ".env file found"
)
goto :eof

REM Pull latest images
:pull_images
call :print_status "Pulling latest Docker images..."
docker compose pull
goto :eof

REM Build and start containers
:start_application
call :print_status "Building and starting application..."
docker compose up -d --build
goto :eof

REM Wait for services to be healthy
:wait_for_health
call :print_status "Waiting for services to be healthy..."

REM Wait for database
call :print_status "Waiting for MySQL database..."
timeout /t 30 /nobreak >nul

REM Wait for frontend
call :print_status "Waiting for frontend service..."
timeout /t 20 /nobreak >nul

call :print_status "All services should be starting up!"
goto :eof

REM Show status
:show_status
call :print_status "Application status:"
docker compose ps

call :print_status "Service URLs:"
echo   🌐 Main Application: http://localhost:80
echo   📊 Grafana: http://localhost:3001
echo   🔍 Prometheus: http://localhost:9090
echo   📈 cAdvisor: http://localhost:8081
echo   ❤️  Health Check: http://localhost:80/health
goto :eof

REM Cleanup function
:cleanup
call :print_status "Cleaning up..."
docker compose down --remove-orphans
docker system prune -f
goto :eof

REM Main deployment function
:deploy
call :print_status "Starting deployment..."

call :check_docker
call :check_docker_compose
call :check_env_file

call :pull_images
call :start_application
call :wait_for_health
call :show_status

call :print_status "Deployment completed successfully! 🎉"
goto :eof

REM Show usage
:show_usage
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   deploy    - Full deployment (default)
echo   start     - Start existing containers
echo   stop      - Stop containers
echo   restart   - Restart containers
echo   status    - Show container status
echo   logs      - Show container logs
echo   cleanup   - Stop and remove containers, cleanup Docker
echo   help      - Show this help message
goto :eof

REM Parse command line arguments
set "command=%~1"
if "%command%"=="" set "command=deploy"

if "%command%"=="deploy" (
    call :deploy
) else if "%command%"=="start" (
    docker compose up -d
    call :show_status
) else if "%command%"=="stop" (
    docker compose down
    call :print_status "Application stopped"
) else if "%command%"=="restart" (
    docker compose down
    call :start_application
    call :wait_for_health
    call :show_status
) else if "%command%"=="status" (
    call :show_status
) else if "%command%"=="logs" (
    docker compose logs -f
) else if "%command%"=="cleanup" (
    call :cleanup
) else if "%command%"=="help" (
    call :show_usage
) else (
    call :print_error "Unknown command: %command%"
    call :show_usage
    exit /b 1
)

endlocal
