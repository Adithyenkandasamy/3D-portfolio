# Use Node.js 18 Alpine as base image for smaller size
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Set memory limit for Node.js
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy package files
COPY package*.json ./

# Install dependencies with optimized settings
RUN npm install --legacy-peer-deps --no-audit --no-fund --production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
