#!/bin/bash

# T2.Micro Deployment Script for Demo Node.js App
# Usage: ./deploy-t2micro.sh

echo "🚀 Starting T2.Micro Optimized Deployment..."

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Use the micro-optimized configuration
echo "📦 Deploying with T2.Micro optimized configuration..."
docker-compose -f docker-compose.micro.yml up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check container status
echo "🔍 Checking container status..."
docker-compose -f docker-compose.micro.yml ps

# Show resource usage
echo "📊 Memory usage:"
docker stats --no-stream

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application: http://localhost"
echo "📊 Health check: http://localhost/health"
echo ""
echo "💡 T2.Micro Optimizations Applied:"
echo "   - Removed monitoring stack (Prometheus, Grafana, cAdvisor)"
echo "   - Reduced memory limits: Frontend 256M, MySQL 512M"
echo "   - Optimized MySQL with smaller buffer pools"
echo "   - Reduced DB connection pool to 3 connections"
echo "   - Lower default API pagination (20 users per page)"
echo ""
echo "🔧 To run with monitoring (requires t2.medium+):"
echo "   docker-compose up -d --build"
