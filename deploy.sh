#!/bin/bash

# =============================================================================
# Demo Node.js + MySQL Application - Deployment Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_status "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_status "Docker Compose is installed"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_warning "Please edit .env file with your configuration before running the application."
            print_warning "Especially update the database passwords and other sensitive values."
        else
            print_error ".env.example file not found. Please create .env file manually."
            exit 1
        fi
    else
        print_status ".env file found"
    fi
}

# Check system resources
check_resources() {
    print_status "Checking system resources..."
    
    # Check available memory
    if command -v free &> /dev/null; then
        TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
        if [ "$TOTAL_MEM" -lt 2048 ]; then
            print_warning "System has less than 2GB RAM (${TOTAL_MEM}MB). Consider using a larger instance."
        else
            print_status "System has sufficient RAM (${TOTAL_MEM}MB)"
        fi
    fi
    
    # Check available disk space
    DISK_SPACE=$(df . | tail -1 | awk '{print $4}')
    if [ "$DISK_SPACE" -lt 1048576 ]; then # 1GB in KB
        print_warning "Less than 1GB disk space available. Consider cleaning up or using more storage."
    else
        print_status "Sufficient disk space available"
    fi
}

# Pull latest images
pull_images() {
    print_status "Pulling latest Docker images..."
    docker compose pull
}

# Build and start containers
start_application() {
    print_status "Building and starting application..."
    docker compose up -d --build
}

# Wait for services to be healthy
wait_for_health() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for database
    print_status "Waiting for MySQL database..."
    timeout 60 bash -c 'until docker exec mysql-db mysqladmin ping -h localhost -uroot -p"$DB_ROOT_PASSWORD" --silent; do sleep 2; done'
    
    # Wait for frontend
    print_status "Waiting for frontend service..."
    timeout 60 bash -c 'until curl -f http://localhost:3000/health >/dev/null 2>&1; do sleep 2; done'
    
    # Wait for nginx
    print_status "Waiting for nginx proxy..."
    timeout 60 bash -c 'until curl -f http://localhost/nginx-health >/dev/null 2>&1; do sleep 2; done'
    
    print_status "All services are healthy!"
}

# Show status
show_status() {
    print_status "Application status:"
    docker compose ps
    
    print_status "Service URLs:"
    echo "  🌐 Main Application: http://localhost:${HTTP_PORT:-80}"
    echo "  📊 Grafana: http://localhost:${GRAFANA_PORT:-3001}"
    echo "  🔍 Prometheus: http://localhost:${PROMETHEUS_PORT:-9090}"
    echo "  📈 cAdvisor: http://localhost:${CADVISOR_PORT:-8081}"
    echo "  ❤️  Health Check: http://localhost:${HTTP_PORT:-80}/health"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    docker compose down --remove-orphans
    docker system prune -f
}

# Main deployment function
deploy() {
    print_status "Starting deployment..."
    
    check_docker
    check_docker_compose
    check_env_file
    check_resources
    
    pull_images
    start_application
    wait_for_health
    show_status
    
    print_status "Deployment completed successfully! 🎉"
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Full deployment (default)"
    echo "  start     - Start existing containers"
    echo "  stop      - Stop containers"
    echo "  restart   - Restart containers"
    echo "  status    - Show container status"
    echo "  logs      - Show container logs"
    echo "  cleanup   - Stop and remove containers, cleanup Docker"
    echo "  help      - Show this help message"
}

# Parse command line arguments
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    start)
        docker compose up -d
        show_status
        ;;
    stop)
        docker compose down
        print_status "Application stopped"
        ;;
    restart)
        docker compose down
        start_application
        wait_for_health
        show_status
        ;;
    status)
        show_status
        ;;
    logs)
        docker compose logs -f
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
