# Take Home Challenge

A modern Vue.js frontend application built with TypeScript and Pinia

## Architecture

- **Frontend**: Vue 3 + TypeScript + Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS + Element Plus
- **Containerization**: Docker + Docker Compose

## Prerequisites

Before running this application, make sure you have:

- **Docker** and **Docker Compose** installed
- **Backend service** running on port 12001

## Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Backend service** running on port 12001 (backend repository)

### Setup and Run

1. **First time setup**
   ```bash
   git clone git@github.com:coskuntekin/take-home-challenge.git
   cd take-home-challange
   ./setup.sh
   ```

2. **Start your backend service** (in backend repository)
   ```bash
   docker-compose up -d
   ```

3. **Start the frontend**
   ```bash
   ./start.sh
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:12001

### Alternative - Local Development
```bash
pnpm install
pnpm dev
```

### Docker Compose
The `docker-compose.yml` configures:

- **Frontend service** on port 5173
- **Network** for service communication
- **Volume mounts** for development hot reload

## Configuration Files

- **`vite.config.ts`** - Vite build configuration
- **`tsconfig.json`** - TypeScript configuration
- **`eslint.config.js`** - ESLint configuration

## Environment Variables

The application uses the following environment variables:

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:12001)

## Testing

This project includes comprehensive tests covering unit, integration, and E2E scenarios using **Vitest** and **Vue Test Utils**.

### Test Types

- **Unit Tests**: Test individual components, stores, services, and utilities in isolation
- **Integration Tests**: Test component interactions with stores and routing
- **E2E Flow Tests**: Test complete user workflows and application behavior

### Running Tests

```bash
# Run all tests once
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests with UI interface
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```
