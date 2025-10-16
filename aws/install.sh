# AWS EC2 Deployment Scripts

# install.sh - Run this script on your EC2 instance
#!/bin/bash

# Update system packages
sudo yum update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Git
sudo yum install -y git

# Create application directory
sudo mkdir -p /var/www/bookexchange
sudo chown ec2-user:ec2-user /var/www/bookexchange

# Install Nginx (optional - for reverse proxy)
sudo amazon-linux-extras install nginx1 -y
sudo systemctl enable nginx
sudo systemctl start nginx

echo "Basic setup complete. Clone your repository to /var/www/bookexchange"