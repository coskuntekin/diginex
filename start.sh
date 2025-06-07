#!/bin/bash

set -e

echo "🚀 Starting Take Home Challenge Frontend Application..."
echo "========================================"

if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "🔍 Checking if backend service is available..."
response=$(curl -s -w "%{http_code}" http://localhost:12001/users 2>/dev/null || echo "000")
http_code="${response: -3}"

if [[ "$http_code" == "000" ]]; then
    echo "⚠️  Warning: Backend service is not running on port 12001"
    echo "   Please start your backend service first before running the frontend."
    echo "   The frontend will still start but API calls will fail."
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting. Please start your backend service first."
        exit 1
    fi
elif [[ "$http_code" == "401" ]] || [[ "$http_code" == "200" ]]; then
    echo "✅ Backend service is running on http://localhost:12001"
    echo "   (Received HTTP $http_code - service is responding correctly)"
else
    echo "⚠️  Backend service responded with HTTP $http_code"
    echo "   This might indicate an issue, but continuing anyway..."
fi

echo "🛑 Stopping existing containers..."
docker-compose down || true

echo "🏗️ Building and starting frontend container..."
docker-compose up --build -d

echo "⏳ Waiting for frontend to be ready..."
echo "   This may take a few minutes on first run..."

for i in {1..30}; do
    if curl -f http://localhost:5173 > /dev/null 2>&1; then
        break
    fi
    echo "   Still waiting... ($i/30)"
    sleep 10
done

echo "🔍 Checking service status..."
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:5173"
else
    echo "⚠️ Frontend might still be starting up. Check logs with: docker-compose logs -f frontend"
fi

echo ""
echo "🎉 Frontend Application Started!"
echo "========================================"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:12001 (external service)"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose logs -f frontend"
echo "   Stop: docker-compose down"
echo "   Restart: docker-compose restart frontend"
echo ""
echo "📋 Note: Make sure your backend service is running separately"
echo "   and accessible on http://localhost:12001"
