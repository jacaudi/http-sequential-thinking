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
# COPY --from=builder /app/package-lock.json . # This file doesn't exist in the project

ENV NODE_ENV=production

# Install production dependencies
RUN npm ci --omit=dev

# Expose the port the app runs on
EXPOSE 3000

# Run the server
ENTRYPOINT ["node", "dist/index.js"]
