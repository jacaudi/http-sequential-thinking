FROM public.ecr.aws/docker/library/node:24-alpine AS builder

# Set build arguments
ARG VERSION=dev
ARG BUILDTIME=unknown
ARG REVISION=unknown

# Install dependencies for building
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (skip prepare script during CI)
RUN npm ci --ignore-scripts

# Copy source files
COPY . .

# Build the project
RUN npm run build

# Use a smaller base image for the release
FROM public.ecr.aws/docker/library/node:24-alpine AS release

# Install ca-certificates for HTTPS requests
RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copy built files and dependencies from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/web ./web
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment variables
ENV NODE_ENV=production
ENV DOCKER=true
# Set allowed origins for CORS (comma-separated list)
# Example: ENV ALLOWED_ORIGINS=https://mcpinspector.com,https://app.example.com
# Default: http://localhost:3000,http://127.0.0.1:3000

# Add labels
LABEL org.opencontainers.image.title="Sequential Thinking MCP Server"
LABEL org.opencontainers.image.description="MCP server for sequential thinking and problem solving"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILDTIME}"
LABEL org.opencontainers.image.revision="${REVISION}"
LABEL org.opencontainers.image.source="https://github.com/jacaudi/http-sequential-thinking"

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Run the server
CMD ["node", "dist/index.js"]
