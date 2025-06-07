#!/bin/bash

# Setup script for Take Home Challenge
# This script ensures all dependencies are installed and the project is ready for development

set -e

echo "🔧 Setting up Take Home Challenge Project"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${2}${1}${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_status "❌ Node.js is not installed. Please install Node.js 18+ first." "$RED"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_status "❌ Node.js version 18+ required. Current version: $(node --version)" "$RED"
    exit 1
fi

print_status "✅ Node.js $(node --version) is installed" "$GREEN"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_status "📦 Installing pnpm..." "$YELLOW"
    npm install -g pnpm
fi

print_status "✅ pnpm $(pnpm --version) is available" "$GREEN"

# Install dependencies
print_status "📦 Installing project dependencies..." "$YELLOW"
pnpm install

# Check if Docker is available
if command -v docker &> /dev/null; then
    print_status "✅ Docker is available" "$GREEN"

    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        print_status "✅ Docker Compose is available" "$GREEN"
    else
        print_status "⚠️  Docker Compose not found - Docker deployment won't work" "$YELLOW"
    fi
else
    print_status "⚠️  Docker not found - Docker deployment won't work" "$YELLOW"
fi

# Make scripts executable
print_status "🔧 Making scripts executable..." "$YELLOW"
chmod +x start.sh

# Run type checking
print_status "🔍 Running type check..." "$YELLOW"
if pnpm type-check; then
    print_status "✅ Type check passed" "$GREEN"
else
    print_status "⚠️  Type check has issues - but continuing..." "$YELLOW"
fi

# Run linting
print_status "🔍 Running linter..." "$YELLOW"
if pnpm lint; then
    print_status "✅ Linting passed" "$GREEN"
else
    print_status "⚠️  Linting has issues - but continuing..." "$YELLOW"
fi

echo ""
print_status "🎉 Project setup complete!" "$GREEN"
echo "========================================"
print_status "📋 Next steps:" "$BLUE"
echo ""
echo "1. Start your backend service (on port 12001)"
echo "2. Run the application:"
echo "   • Docker: ./start.sh"
echo "   • Local:  pnpm dev"
echo ""
echo "3. Access the application:"
echo "   • Frontend: http://localhost:5173"
echo "   • Backend:  http://localhost:12001"
echo ""
print_status "📖 See README.md for detailed instructions" "$BLUE"
