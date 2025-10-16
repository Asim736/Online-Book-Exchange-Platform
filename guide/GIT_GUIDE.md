# 📚 Complete Git Guide for MERN Project

## 🎯 **What is Git?**

Git is a version control system that tracks changes in your files and helps you collaborate with others. GitHub is a cloud-based hosting service for Git repositories.

## 🔧 **Git Installation & Setup**

### Install Git
- **Windows**: Download from [git-scm.com](https://git-scm.com/download/win)
- **Mac**: `brew install git` or download from git-scm.com
- **Linux**: `sudo apt install git` (Ubuntu) or `sudo yum install git` (CentOS)

### First-Time Setup
```bash
# Set your name and email (required)
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"

# Optional: Set default branch name to 'main'
git config --global init.defaultBranch main

# Optional: Set default editor
git config --global core.editor "code --wait"  # For VS Code
```

### Verify Installation
```bash
git --version
git config --list
```

## 🚀 **Basic Git Commands**

### Repository Initialization
```bash
# Create a new Git repository
git init

# Clone an existing repository
git clone https://github.com/username/repository-name.git

# Check repository status
git status
```

### Adding and Committing Changes
```bash
# Add specific files
git add filename.js
git add src/components/

# Add all files
git add .

# Add all files with specific extension
git add *.js

# Check what's staged
git status

# Commit changes
git commit -m "Your commit message"

# Add and commit in one command
git commit -am "Your commit message"
```

### Viewing History
```bash
# View commit history
git log

# View compact history
git log --oneline

# View history with graph
git log --graph --oneline --all

# View changes in last commit
git show

# View changes between commits
git diff
```

## 🌿 **Branch Management**

### Working with Branches
```bash
# List all branches
git branch

# Create new branch
git branch feature-name

# Switch to branch
git checkout feature-name

# Create and switch to new branch
git checkout -b feature-name

# Rename current branch
git branch -m new-branch-name

# Delete branch
git branch -d branch-name
```

### Merging Branches
```bash
# Switch to main branch
git checkout main

# Merge feature branch into main
git merge feature-name

# Delete merged branch
git branch -d feature-name
```

## 🌐 **Working with GitHub**

### Remote Repository Operations
```bash
# Add remote repository
git remote add origin https://github.com/username/repository-name.git

# View remote repositories
git remote -v

# Change remote URL
git remote set-url origin https://github.com/username/new-repository.git

# Remove remote
git remote remove origin
```

### Push and Pull Operations
```bash
# Push to GitHub (first time)
git push -u origin main

# Push subsequent changes
git push

# Push specific branch
git push origin branch-name

# Pull latest changes
git pull

# Pull from specific branch
git pull origin main

# Fetch changes without merging
git fetch
```

## 📝 **For Your MERN Book Exchange Project**

### Initial Upload to GitHub

1. **Navigate to your project directory**:
```bash
cd "c:\Users\Asim SB\Documents\FinalDeliverables\final start\Final Year Project (BC 200205775)"
```

2. **Initialize Git repository**:
```bash
git init
```

3. **Add all files**:
```bash
git add .
```

4. **Check what will be committed**:
```bash
git status
```

5. **Make initial commit**:
```bash
git commit -m "Initial commit: Complete MERN Book Exchange Platform

Features:
- User authentication and authorization
- Book listing and search functionality  
- Real-time messaging system
- Request and exchange management
- Mobile-responsive design
- AWS deployment ready
- Custom dropdown components
- Image upload functionality"
```

6. **Add GitHub repository as remote**:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
```

7. **Push to GitHub**:
```bash
git push -u origin main
```

### Daily Development Workflow

```bash
# 1. Start working - pull latest changes
git pull

# 2. Create feature branch
git checkout -b feature/new-functionality

# 3. Make your changes, then add them
git add .

# 4. Commit changes
git commit -m "Add new functionality: describe what you added"

# 5. Push feature branch
git push -u origin feature/new-functionality

# 6. On GitHub: Create Pull Request to merge into main
# 7. After merge, switch back to main and pull
git checkout main
git pull

# 8. Delete the feature branch
git branch -d feature/new-functionality
```

## 🔄 **Common Git Scenarios**

### Undo Changes
```bash
# Undo changes in working directory (before git add)
git checkout -- filename.js

# Unstage files (after git add, before git commit)
git reset HEAD filename.js

# Undo last commit (keep changes in working directory)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert a specific commit (creates new commit)
git revert commit-hash
```

### Fix Common Mistakes
```bash
# Change last commit message
git commit --amend -m "New commit message"

# Add files to last commit
git add forgotten-file.js
git commit --amend --no-edit

# Remove file from Git but keep locally
git rm --cached filename.js

# Remove file from Git and locally
git rm filename.js
```

### Resolve Merge Conflicts
```bash
# When merge conflict occurs:
# 1. Open conflicted files in editor
# 2. Look for conflict markers: <<<<<<<, =======, >>>>>>>
# 3. Choose what to keep, remove conflict markers
# 4. Add resolved files
git add conflicted-file.js

# 5. Complete the merge
git commit -m "Resolve merge conflict"
```

## 📁 **Working with .gitignore**

Your project already has `.gitignore` files, but here's what they do:

```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.production

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
```

### Add to .gitignore
```bash
# Add new patterns to .gitignore
echo "new-folder/" >> .gitignore
echo "*.tmp" >> .gitignore

# Remove already tracked files that should be ignored
git rm --cached filename
git commit -m "Remove filename from tracking"
```

## 🏷️ **Tags and Releases**

```bash
# Create annotated tag
git tag -a v1.0.0 -m "First release"

# List tags
git tag

# Push tags to GitHub
git push origin --tags

# Create tag for specific commit
git tag -a v1.0.1 commit-hash -m "Bug fix release"

# Delete tag locally
git tag -d v1.0.0

# Delete tag on GitHub
git push origin --delete v1.0.0
```

## 🔍 **Useful Git Aliases**

Add these to make Git commands shorter:

```bash
# Add aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'

# Now you can use:
git st          # instead of git status
git co main     # instead of git checkout main
git br          # instead of git branch
```

## 🚨 **Emergency Commands**

### If you mess up badly:
```bash
# Save current work in stash
git stash

# Go back to last known good state
git reset --hard HEAD

# Or go back to specific commit
git reset --hard commit-hash

# Get stashed work back
git stash pop
```

### If you accidentally committed sensitive data:
```bash
# Remove file from last commit
git rm --cached sensitive-file.txt
git commit --amend --no-edit

# For older commits, you'll need to rewrite history:
# WARNING: Only do this if you haven't pushed to GitHub yet!
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch sensitive-file.txt' \
--prune-empty --tag-name-filter cat -- --all
```

## 📊 **Git Best Practices for Your Project**

### Commit Message Conventions
```bash
# Good commit messages:
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve dropdown overflow on mobile"
git commit -m "docs: update README with installation steps"
git commit -m "style: improve button hover effects"
git commit -m "refactor: reorganize component structure"

# Types: feat, fix, docs, style, refactor, test, chore
```

### Branch Naming Conventions
```bash
# Feature branches
git checkout -b feature/user-authentication
git checkout -b feature/book-upload-form

# Bug fix branches  
git checkout -b fix/dropdown-mobile-issue
git checkout -b fix/login-validation

# Documentation branches
git checkout -b docs/api-documentation
git checkout -b docs/deployment-guide
```

### Before Each Commit
```bash
# 1. Check status
git status

# 2. Review changes
git diff

# 3. Add files selectively if needed
git add src/components/
git add README.md

# 4. Commit with descriptive message
git commit -m "feat: implement real-time messaging system"
```

## 🎓 **Learning Resources**

- **Interactive Tutorial**: [learngitbranching.js.org](https://learngitbranching.js.org/)
- **GitHub Learning Lab**: [lab.github.com](https://lab.github.com/)
- **Git Handbook**: [guides.github.com/introduction/git-handbook](https://guides.github.com/introduction/git-handbook/)
- **Atlassian Git Tutorials**: [atlassian.com/git/tutorials](https://www.atlassian.com/git/tutorials)

## ⚡ **Quick Reference Card**

| Command | What it does |
|---------|--------------|
| `git init` | Initialize new repository |
| `git clone <url>` | Copy repository from GitHub |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Save changes with message |
| `git push` | Upload changes to GitHub |
| `git pull` | Download changes from GitHub |
| `git status` | Check current status |
| `git log` | View commit history |
| `git branch` | List branches |
| `git checkout <branch>` | Switch branches |
| `git merge <branch>` | Merge branch into current |

---

## 🎯 **For Your MERN Project Success**

1. **Always commit working code** - Don't commit broken features
2. **Use meaningful commit messages** - Future you will thank you
3. **Create branches for features** - Keep main branch stable  
4. **Pull before you push** - Avoid conflicts
5. **Review changes before committing** - Use `git diff` and `git status`
6. **Keep commits small and focused** - One feature/fix per commit
7. **Use .gitignore properly** - Never commit sensitive data or dependencies

**Your MERN Book Exchange project is now ready for professional Git workflow! 🚀**