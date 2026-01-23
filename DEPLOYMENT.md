# AddaLive Admin Panel - Deployment Guide

## Overview
This guide explains how to deploy the AddaLive Admin Panel to your VPS using GitHub Actions.

## Prerequisites

1. **VPS Server** with:
   - Node.js v20.19.5+ (via NVM)
   - Git installed
   - tmux installed
   - SSH access configured

2. **GitHub Repository** with:
   - Code pushed to `main` branch
   - SSH private key added as secret

## Setup Instructions

### 1. VPS Preparation

SSH into your VPS and create the directory:

```bash
cd ~/zhz
git clone <your-repo-url> adda_admin
cd adda_admin
```

### 2. Environment Variables

Create `.env.local` file on the VPS:

```bash
cd ~/zhz/adda_admin
nano .env.local
```

Add the following:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=AddaLive Admin
```

### 3. GitHub Secrets

Add the following secret to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

- **Name**: `SSH_PRIVATE_KEY`
- **Value**: Your VPS SSH private key

To get your private key:
```bash
cat ~/.ssh/id_rsa
```

### 4. Initial Manual Deploy

Before using GitHub Actions, perform initial setup:

```bash
# On your VPS
cd ~/zhz/adda_admin
npm install
npm run build
tmux new-session -d -s adda-admin 'npm start'
```

Verify it's running:
```bash
tmux attach -t adda-admin  # Ctrl+B then D to detach
curl http://localhost:3004  # Should return HTML
```

## GitHub Actions Workflow

The workflow file `.github/workflows/deploy.yml` will:

1. **Trigger**: Automatically on push to `main` branch
2. **Checkout**: Pull latest code
3. **Deploy**: SSH to VPS and:
   - Pull latest changes
   - Install dependencies
   - Build the Next.js app  
   - Restart the tmux session

## Manual tmux Commands

### Check if session is running
```bash
tmux ls
```

### Attach to session
```bash
tmux attach -t adda-admin
```

### Kill session
```bash
tmux kill-session -t adda-admin
```

### Start new session
```bash
tmux new-session -d -s adda-admin 'npm start'
```

## Testing Deployment

After deployment, test the admin panel:

1. **Local Access** (on VPS):
   ```bash
   curl http://localhost:3004
   ```

2. **Remote Access** (configure nginx):
   ```nginx
   server {
       listen 80;
       server_name admin.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3004;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Access**: Navigate to `http://admin.yourdomain.com`

## Troubleshooting

### Check application logs
```bash
tmux attach -t adda-admin
# View logs in tmux
# Ctrl+B then D to detach
```

### Check if process is running
```bash
tmux ls
ps aux | grep next
```

### Manual restart
```bash
tmux kill-session -t adda-admin
cd ~/zhz/adda_admin
npm start  # Or run in tmux: tmux new-session -d -s adda-admin 'npm start'
```

### Port already in use
```bash
# Find process using port 3004
lsof -i :3004
# Kill it
kill -9 <PID>
```

## Production Considerations

1. **Environment Variables**: Never commit `.env.local` to Git
2. **HTTPS**: Use SSL certificate (Let's Encrypt) with nginx
3. **Firewall**: Configure firewall rules to only allow necessary ports
4. **Monitoring**: Set up monitoring (PM2, uptime monitoring)
5. **Backups**: Regular backups of configuration files

## PM2 Alternative (Recommended for Production)

For better process management, use PM2 instead of tmux:

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start npm --name "adda-admin" -- start

# Auto-restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs adda-admin

# Restart
pm2 restart adda-admin
```

Update the GitHub Actions workflow to use PM2:
```yaml
pm2 restart adda-admin || pm2 start npm --name "adda-admin" -- start
```

## Support

For issues:
1. Check GitHub Actions logs
2. Check tmux/PM2 logs  
3. Verify environment variables
4. Ensure backend is running on port 8000
