# 🔐 Secrets Management & GitHub Security Guide

## 🚨 Emergency Response: Secret Exposed

If you've accidentally committed secrets to your repository, follow these steps **immediately**:

### 1. **Immediate Actions** ⚡

```bash
# 1. Rotate the exposed credentials IMMEDIATELY
# - Change MongoDB Atlas user password
# - Generate new JWT secret
# - Regenerate AWS access keys
# - Update any other exposed secrets

# 2. Update your production environment with new secrets
# - Update EC2 environment variables
# - Update Amplify environment variables
# - Update any CI/CD secrets
```

### 2. **Clean Git History** 🧹

We've already run git filter-repo to clean the history, but here's how to do it manually:

```bash
# Create backup branch first
git branch backup-before-cleanup

# Option 1: Using git filter-repo (recommended)
pip install git-filter-repo

# Create a file with secrets to replace
echo "your-actual-secret" > secrets-to-remove.txt
echo "mongodb+srv://<ACTUAL-USER>:<ACTUAL-PASS>@<CLUSTER>" >> secrets-to-remove.txt

# Run filter-repo to replace secrets with ***REMOVED***
git filter-repo --replace-text secrets-to-remove.txt --force

# Re-add origin (filter-repo removes it)
git remote add origin https://github.com/Asim736/Online-Book-Exchange-Platform.git

# Option 2: Using BFG Repo-Cleaner (alternative)
# Download bfg.jar from https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --replace-text secrets-to-remove.txt
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

### 3. **Force Push Clean History** ⬆️

```bash
# WARNING: This rewrites history - coordinate with team members
git push --force-with-lease origin main

# Push backup branch too
git push origin backup-before-cleanup
```

---

## 📋 GitHub Security Alerts Resolution

### Step-by-Step Alert Resolution

1. **Go to Repository Security Tab**
   ```
   https://github.com/Asim736/Online-Book-Exchange-Platform/security
   ```

2. **Navigate to Secret Scanning**
   - Click "Security" tab in your repository
   - Click "Secret scanning" in the left sidebar
   - You'll see a list of detected secrets

3. **For Each Alert:**

   **If it's a FALSE POSITIVE (placeholder/example):**
   - Click on the alert
   - Click "Resolve alert" button
   - Select "False positive" 
   - Add comment: "This is a placeholder value, not a real credential"
   - Click "Resolve alert"

   **If it's a REAL SECRET:**
   - Click on the alert
   - Click "Resolve alert" button
   - Select "Revoked" if you've rotated the credential
   - Select "Used in tests" if it's a test credential
   - Add comment explaining the action taken
   - Click "Resolve alert"

4. **Verify All Alerts Resolved**
   - The security tab should show "No secrets detected"
   - All alerts should show as "Resolved"

---

## 🛡️ Prevention: Secure Development Practices

### 1. **Environment Variables Setup**

**Local Development:**
```bash
# server/.env (NEVER commit this file)
MONGODB_URI=mongodb+srv://<YOUR-USER>:<YOUR-PASS>@<YOUR-CLUSTER>.mongodb.net/bookexchange
JWT_SECRET=your-actual-super-secure-64-character-jwt-secret-here-12345
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=actual-secret-key
```

**Production (AWS EC2):**
```bash
# Set environment variables on EC2
export MONGODB_URI="mongodb+srv://<PROD-USER>:<PROD-PASS>@<YOUR-CLUSTER>.mongodb.net/bookexchange"
export JWT_SECRET="production-jwt-secret-64-characters-minimum-length-required"
export NODE_ENV="production"

# Or use AWS Systems Manager Parameter Store
aws ssm put-parameter --name "/bookexchange/mongodb-uri" --value "mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/db" --type "SecureString"
aws ssm put-parameter --name "/bookexchange/jwt-secret" --value "your-jwt-secret" --type "SecureString"
```

### 2. **Proper .gitignore Configuration**

Our `.gitignore` already includes:
```gitignore
# Environment variables (CRITICAL: Never commit these)
.env
.env.*
!.env.example
server/.env
client/.env
.env.local
.env.development
.env.production
```

### 3. **Safe Example Files**

**server/.env.example:**
```bash
# Database
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/bookexchange

# JWT Secret (generate 64+ character random string)
JWT_SECRET=<JWT_SECRET>

# AWS Credentials (if using AWS services)
AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
```

---

## 🔧 Secret Generation Commands

### Generate Secure JWT Secret
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Using online generator (use with caution)
# https://generate-secret.vercel.app/64
```

### Generate MongoDB Atlas Connection
```bash
# 1. Go to MongoDB Atlas Dashboard
# 2. Click "Connect" on your cluster
# 3. Choose "Connect your application"
# 4. Copy the connection string
# 5. Replace <username> and <password> with your credentials
```

---

## 🎯 GitHub Secret Scanning Best Practices

### 1. **Enable Security Features**
- Go to Settings → Security & analysis
- Enable "Dependency graph"
- Enable "Dependabot alerts"
- Enable "Dependabot security updates"
- Enable "Secret scanning" (if available)

### 2. **Regular Security Audits**
```bash
# Run security audit on dependencies
npm audit
npm audit fix

# Check for secrets in your codebase
git log --grep="password\\|secret\\|key" --oneline
grep -r "password\\|secret\\|key\\|token" . --exclude-dir=node_modules
```

### 3. **Team Security Guidelines**
- Never commit `.env` files
- Use placeholder values in documentation
- Rotate secrets if accidentally exposed
- Use environment variables for all secrets
- Review PRs for potential secret exposure

---

## 🔄 Secret Rotation Checklist

### When to Rotate Secrets:
- ✅ Secret was accidentally committed
- ✅ Team member leaves with access
- ✅ Regular rotation schedule (quarterly)
- ✅ Security breach or suspicious activity
- ✅ Moving from development to production

### Rotation Steps:

**1. MongoDB Atlas:**
- Generate new user with same permissions
- Update connection string
- Test connection
- Delete old user

**2. JWT Secret:**
- Generate new 64+ character secret
- Update environment variables
- Restart application
- Users will need to re-login

**3. AWS Credentials:**
- Create new access key pair
- Update environment variables
- Test AWS functionality
- Delete old access key

---

## 📞 Emergency Contacts & Resources

### If Secrets Are Exposed:
1. **Rotate credentials immediately**
2. **Clean git history** (using this guide)
3. **Force push clean history**
4. **Update all environments**
5. **Monitor for suspicious activity**

### Useful Resources:
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [MongoDB Atlas Security](https://docs.atlas.mongodb.com/security/)
- [AWS Security Best Practices](https://aws.amazon.com/security/security-resources/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

## ✅ Security Checklist

### Before Each Deployment:
- [ ] No `.env` files in git history
- [ ] All secrets use environment variables
- [ ] `.gitignore` properly configured
- [ ] Security scanning enabled
- [ ] Dependencies up to date
- [ ] Secrets rotated if needed

### Monthly Security Review:
- [ ] Check GitHub security alerts
- [ ] Review access permissions
- [ ] Audit dependencies
- [ ] Rotate long-lived secrets
- [ ] Review git commit history

---

**🚨 Remember: Security is everyone's responsibility. When in doubt, rotate the secret and clean the history.**

**Last Updated:** October 18, 2025  
**Version:** 1.0  
**Status:** ✅ Active Guide