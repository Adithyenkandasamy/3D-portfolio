#!/bin/bash

echo "Building 3D Portfolio Application..."

# Build the application locally first
echo "Step 1: Installing dependencies..."
npm install --legacy-peer-deps

echo "Step 2: Building the application..."
npm run build

echo "Step 3: Building lightweight Docker image..."
docker build -f Dockerfile.lightweight -t 3d-portfolio-lightweight .

echo "Step 4: Running the container in foreground mode..."
echo "Press Ctrl+C to stop the application and container"
echo "✅ Application will be available at http://localhost:3000"
echo ""
docker run --rm -p 3000:80 --name 3d-portfolio-app 3d-portfolio-lightweight
