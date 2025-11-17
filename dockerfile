FROM node:18-alpine

# Install required packages
RUN apk add --no-cache \
    bash \
    curl \
    wget \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Copy application code
COPY . .

# Make scripts executable
RUN sed -i 's/\r$//' wait-for-it.sh && \
    chmod +x wait-for-it.sh

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

EXPOSE 3000

# Graceful shutdown
STOPSIGNAL SIGTERM

# Start application with wait-for-it script
CMD ["./wait-for-it.sh", "db:3306", "--timeout=60", "--", "npm", "start"]