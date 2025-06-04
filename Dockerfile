# Use Node.js 23 Alpine as base image
FROM node:23-alpine AS base

# For Alpine-based images
RUN apk add --no-cache \
    build-base \
    python3 \
    linux-headers \
    eudev-dev \
    libusb-dev

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 80

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "80"]

