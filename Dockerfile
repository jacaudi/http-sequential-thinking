FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy all source files
COPY . .

# Install dependencies and build the project
RUN npm install
RUN npm run build

# Use a smaller base image for the release
FROM node:22-alpine AS release

WORKDIR /app

# Copy built files and package definitions from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json . 

ENV NODE_ENV=production
ENV DOCKER=true
# Set allowed origins for CORS (comma-separated list)
# Example: ENV ALLOWED_ORIGINS=https://mcpinspector.com,https://app.example.com
# Default: http://localhost:3000,http://127.0.0.1:3000

# Install production dependencies
RUN npm ci --ignore-scripts --omit=dev

# Expose the port the app runs on
EXPOSE 3000

# Run the server
ENTRYPOINT ["node", "dist/index.js"]
