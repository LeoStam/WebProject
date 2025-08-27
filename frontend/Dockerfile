# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.js ./
COPY index.html ./

# Install dependencies
RUN npm install

# Copy source files
COPY src/ ./src/
COPY public/ ./public/

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/

# Copy built files from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]