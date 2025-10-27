# Docker Setup for 3D Portfolio

This document explains how to dockerize and run your 3D Portfolio application.

## Quick Start (Recommended)

The easiest way to run the dockerized application:

```bash
./build-and-run.sh
```

This script will:
1. Install dependencies locally
2. Build the application
3. Create a lightweight Docker image
4. Run the container on port 3000

## Available Docker Configurations

### 1. Lightweight Production (Recommended)
Uses pre-built files with Nginx - most memory efficient:
```bash
npm run build
docker build -f Dockerfile.lightweight -t 3d-portfolio-lightweight .
docker run -d -p 3000:80 --name 3d-portfolio-app 3d-portfolio-lightweight
```

### 2. Development Mode
For development with hot reload:
```bash
docker build -f Dockerfile.dev -t 3d-portfolio-dev .
docker run -d -p 5173:5173 -v $(pwd):/app -v /app/node_modules --name 3d-portfolio-dev-container 3d-portfolio-dev
```

### 3. Docker Compose
Multiple deployment options:
```bash
# Development
docker-compose up portfolio-dev

# Simple production
docker-compose up portfolio-simple

# Full production with Nginx
docker-compose up portfolio-prod
```

## Memory Considerations

The full Docker builds may fail on systems with limited memory due to the large dependency tree (Three.js, React Three Fiber, etc.). The lightweight approach (Dockerfile.lightweight) is recommended as it:

- Builds the application locally first
- Only copies the built files to Docker
- Uses minimal memory during Docker build
- Results in a smaller final image

## Troubleshooting

### Build Fails with Memory Error
Use the lightweight approach:
```bash
npm run build
docker build -f Dockerfile.lightweight -t 3d-portfolio .
```

### Port Already in Use
Change the port mapping:
```bash
docker run -d -p 8080:80 --name 3d-portfolio-app 3d-portfolio-lightweight
```

### Container Management
```bash
# View running containers
docker ps

# Stop container
docker stop 3d-portfolio-app

# Remove container
docker rm 3d-portfolio-app

# View logs
docker logs 3d-portfolio-app
```

## Files Created

- `Dockerfile` - Multi-stage production build with Nginx
- `Dockerfile.dev` - Development build with hot reload
- `Dockerfile.simple` - Simple production build with serve
- `Dockerfile.lightweight` - Lightweight production build (recommended)
- `docker-compose.yml` - Multi-service configuration
- `nginx.conf` - Nginx configuration for production
- `.dockerignore` - Files to exclude from Docker context
- `build-and-run.sh` - Quick setup script
