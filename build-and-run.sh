#!/bin/bash

echo "Building 3D Portfolio Application..."

# Build the application locally first
echo "Step 1: Installing dependencies..."
npm install --legacy-peer-deps

echo "Step 2: Building the application..."
npm run build

echo "Step 3: Building lightweight Docker image..."
docker build -f Dockerfile.lightweight -t 3d-portfolio-lightweight .

echo "Step 4: Running the container..."
docker run -d -p 3000:80 --name 3d-portfolio-app 3d-portfolio-lightweight

echo "✅ Application is now running at http://localhost:3000"
echo ""
echo "To stop the container: docker stop 3d-portfolio-app"
echo "To remove the container: docker rm 3d-portfolio-app"
echo "To view logs: docker logs 3d-portfolio-app"
