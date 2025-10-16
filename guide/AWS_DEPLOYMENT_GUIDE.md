# 🚀 AWS Deployment Guide - Book Exchange MERN Application

## Architecture Overview

**Frontend**: AWS Amplify (React Application)  
**Backend**: AWS EC2 (Node.js/Express API)  
**Database**: MongoDB Atlas (Cloud Database)  
**Domain**: Route 53 (Optional)  
**SSL**: AWS Certificate Manager (Optional)  

## 📋 Prerequisites

- AWS Account with appropriate permissions
- Domain name (optional but recommended)
- MongoDB Atlas account
- GitHub repository with your code

## Part 1: 🎯 Backend Deployment on AWS EC2

### Step 1: Launch EC2 Instance

1. **Login to AWS Console** → EC2 Dashboard
2. **Launch Instance**:
   - **AMI**: Amazon Linux 2
   - **Instance Type**: t3.micro (Free Tier) or t3.small
   - **Key Pair**: Create or select existing
   - **Security Group**: Allow HTTP(80), HTTPS(443), SSH(22), Custom(5001)

3. **Using CloudFormation** (Recommended):
   ```bash
   aws cloudformation create-stack \
     --stack-name bookexchange-infrastructure \
     --template-body file://aws/cloudformation-template.yml \
     --parameters ParameterKey=KeyName,ParameterValue=your-key-pair \
     --capabilities CAPABILITY_IAM
   ```

### Step 2: Connect to EC2 Instance

```bash
# Connect via SSH
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip

# Or use AWS Session Manager (if configured)
aws ssm start-session --target your-instance-id
```

### Step 3: Setup Server Environment

```bash
# Run the installation script
curl -O https://raw.githubusercontent.com/yourusername/your-repo-name/main/aws/install.sh
chmod +x install.sh
./install.sh

# Clone your repository
cd /var/www/bookexchange
git clone https://github.com/yourusername/your-repo-name.git .
```

### Step 4: Configure Environment Variables

```bash
# Create production environment file
cd /var/www/bookexchange/server
nano .env
```

Add the following variables:
```env
# MongoDB Atlas Connection
MONGODB_URI=***REMOVED***@cluster.mongodb.net/bookexchange?retryWrites=true&w=majority

# JWT Secret (generate a strong secret)
JWT_SECRET=***REMOVED***

# Server Configuration
PORT=5001
NODE_ENV=production

# CORS Origins (your Amplify frontend URL)
CORS_ORIGINS=https://your-amplify-app.amplifyapp.com,https://your-domain.com
```

### Step 5: Install Dependencies and Start Application

```bash
# Install server dependencies
cd /var/www/bookexchange/server
npm install --production

# Copy PM2 ecosystem configuration
cp ../aws/ecosystem.config.js .

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Configure Nginx (optional but recommended)
sudo cp ../aws/nginx.conf /etc/nginx/conf.d/bookexchange.conf
sudo systemctl restart nginx
```

### Step 6: Test Backend API

```bash
# Test the API
curl http://your-ec2-public-ip:5001/api/test

# Check PM2 status
pm2 status
pm2 logs bookexchange-server
```

## Part 2: 🎨 Frontend Deployment on AWS Amplify

### Step 1: Prepare Frontend for Deployment

1. **Update environment configuration**:
   ```bash
   # In client/.env.production
   VITE_API_URL=http://your-ec2-public-ip:5001/api
   # Or with domain: https://api.your-domain.com/api
   ```

2. **Update constants.js**:
   ```javascript
   export const API_BASE_URL = import.meta.env.VITE_API_URL || 
     'http://your-ec2-public-ip:5001/api';
   ```

3. **Test build locally**:
   ```bash
   cd client
   npm run build
   npm run preview
   ```

### Step 2: Deploy to AWS Amplify

#### Option A: AWS Console (Recommended for beginners)

1. **Login to AWS Console** → AWS Amplify
2. **Create New App** → Host web app
3. **Connect Repository**:
   - Choose GitHub
   - Select your repository
   - Choose main branch
4. **Configure Build Settings**:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: `18`
5. **Environment Variables**:
   - Add `VITE_API_URL` with your EC2 API URL
6. **Deploy**

#### Option B: Amplify CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in your project
cd client
amplify init

# Add hosting
amplify add hosting
# Choose: Amazon CloudFront and S3

# Deploy
amplify publish
```

### Step 3: Configure Custom Domain (Optional)

1. **In Amplify Console**:
   - Go to App settings → Domain management
   - Add domain
   - Follow DNS configuration steps

2. **SSL Certificate**:
   - Amplify automatically provides SSL certificates
   - EC2 needs manual SSL setup (Let's Encrypt or ACM)

## Part 3: 🔧 Production Optimizations

### Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Cluster**:
   - Sign up at mongodb.com/atlas
   - Create new cluster
   - Configure network access (add EC2 IP)
   - Create database user

2. **Configure Connection**:
   ```javascript
   // Update MONGODB_URI in server .env
   MONGODB_URI=***REMOVED***@cluster.mongodb.net/bookexchange
   ```

### SSL Certificate for EC2 (Optional)

```bash
# Install Certbot for Let's Encrypt
sudo yum install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Monitoring and Logging

```bash
# CloudWatch logs (if IAM role configured)
sudo yum install -y awslogs
sudo systemctl start awslogsd
sudo systemctl enable awslogsd

# PM2 Monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 📊 Deployment Checklist

### ✅ Pre-Deployment
- [ ] Code pushed to GitHub repository
- [ ] MongoDB Atlas cluster created and configured
- [ ] Domain name purchased (optional)
- [ ] AWS account with billing configured

### ✅ Backend (EC2)
- [ ] EC2 instance launched with security groups
- [ ] Node.js and dependencies installed
- [ ] Environment variables configured
- [ ] Application running with PM2
- [ ] Nginx configured (optional)
- [ ] SSL certificate installed (optional)

### ✅ Frontend (Amplify)
- [ ] Repository connected to Amplify
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL working (automatic with Amplify)

### ✅ Integration Testing
- [ ] API endpoints accessible from frontend
- [ ] CORS configured correctly
- [ ] Authentication flow working
- [ ] File upload functionality working
- [ ] Mobile responsiveness verified

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   ```javascript
   // Ensure CORS_ORIGINS includes your Amplify domain
   CORS_ORIGINS=https://main.d1234567890.amplifyapp.com
   ```

2. **API Connection Issues**:
   ```javascript
   // Check API_BASE_URL in constants.js
   export const API_BASE_URL = 'http://your-ec2-public-ip:5001/api';
   ```

3. **PM2 Process Issues**:
   ```bash
   pm2 restart bookexchange-server
   pm2 logs bookexchange-server --lines 50
   ```

4. **Database Connection**:
   ```bash
   # Check MongoDB Atlas IP whitelist
   # Verify connection string in .env
   ```

## 💰 Cost Estimation

- **EC2 t3.micro**: ~$8-10/month
- **Amplify**: ~$1-5/month (depending on traffic)
- **MongoDB Atlas**: Free tier (512MB) or $9/month (2GB)
- **Domain**: $10-15/year
- **Total**: ~$15-30/month

## 🔄 Automated Deployment

For future updates:

```bash
# On EC2, create update script
cd /var/www/bookexchange
./aws/deploy.sh
```

For frontend updates, Amplify automatically rebuilds on git push.

---

**Your MERN application is now ready for AWS deployment!** 🎉

Follow this guide step by step, and you'll have a production-ready application running on AWS infrastructure.