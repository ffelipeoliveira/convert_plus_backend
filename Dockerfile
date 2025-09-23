# Use a base image with Node.js and LibreOffice
FROM node:18-slim

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create necessary folders
RUN mkdir -p uploads converted

# Expose the port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
