# Use official Node.js 18 image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./

# 2. Install dependencies (INCLUDING dev dependencies for now)
RUN npm install --include=dev


# Copy application source
COPY . .

# 5. Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]