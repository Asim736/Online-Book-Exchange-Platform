# deploy.sh - Deployment script for EC2
#!/bin/bash

# Variables
APP_DIR="/var/www/bookexchange"
SERVER_DIR="$APP_DIR/server"
GITHUB_REPO="https://github.com/Arslanj9/BookExchange_MERN.git"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process...${NC}"

# Navigate to app directory
cd $APP_DIR

# Pull latest changes from GitHub
echo -e "${YELLOW}Pulling latest changes from GitHub...${NC}"
git pull origin main

# Install server dependencies
echo -e "${YELLOW}Installing server dependencies...${NC}"
cd $SERVER_DIR
npm install --production

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found in server directory${NC}"
    echo -e "${YELLOW}Please create .env file with required environment variables${NC}"
    exit 1
fi

# Restart the application with PM2
echo -e "${YELLOW}Restarting application with PM2...${NC}"
pm2 restart bookexchange-server || pm2 start index.js --name bookexchange-server

# Save PM2 configuration
pm2 save
pm2 startup

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Application is running on PM2${NC}"

# Show PM2 status
pm2 status