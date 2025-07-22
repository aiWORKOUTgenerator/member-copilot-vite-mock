# Multi-stage Dockerfile for AI Service Feature-First Architecture
# Part of Phase 4: Production Configuration

# ===== BUILD STAGE =====
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY types/ ./types/ 2>/dev/null || true

# Build the application
RUN npm run build

# ===== RUNTIME STAGE =====
FROM node:18-alpine AS runtime

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S aiservice -u 1001

# Set working directory
WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy built application from builder stage
COPY --from=builder --chown=aiservice:nodejs /app/dist ./dist
COPY --from=builder --chown=aiservice:nodejs /app/node_modules ./node_modules

# Copy configuration files
COPY --chown=aiservice:nodejs config/ ./config/
COPY --chown=aiservice:nodejs scripts/production/ ./scripts/

# Create necessary directories
RUN mkdir -p /app/logs /app/tmp /app/cache && \
    chown -R aiservice:nodejs /app/logs /app/tmp /app/cache

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info
ENV CACHE_DIR=/app/cache
ENV LOG_DIR=/app/logs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Switch to non-root user
USER aiservice

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]

# ===== DEVELOPMENT STAGE =====
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Install all dependencies including dev dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs tmp cache

# Set environment
ENV NODE_ENV=development
ENV PORT=3000
ENV LOG_LEVEL=debug

# Expose port and debug port
EXPOSE 3000 9229

# Start with nodemon for development
CMD ["npm", "run", "dev"]

# ===== TESTING STAGE =====
FROM builder AS testing

# Install testing dependencies
RUN npm ci

# Copy test files
COPY __tests__/ ./__tests__/
COPY jest.config.js ./
COPY .eslintrc.js ./

# Run tests
RUN npm run test:ci
RUN npm run lint
RUN npm run type-check

# Generate coverage reports
RUN npm run test:coverage

# ===== PRODUCTION STAGE (Final) =====
FROM runtime AS production

# Add labels for metadata
LABEL maintainer="AI Service Team"
LABEL version="1.0.0"
LABEL description="AI Service Feature-First Architecture"
LABEL org.opencontainers.image.source="https://github.com/your-org/ai-service"

# Final security hardening
RUN apk add --no-cache --upgrade \
    && rm -rf /var/cache/apk/*

# Set final environment variables
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV UV_THREADPOOL_SIZE=4

# Verify the build
RUN node --version && npm --version 