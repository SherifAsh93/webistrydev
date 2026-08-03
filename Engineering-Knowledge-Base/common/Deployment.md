# Deployment

How projects are deployed, configured, and maintained in production.

---

## Deployment Targets

| Project | Host | Method | Process Manager |
|---------|------|--------|----------------|
| Ahmed-Elakad | VPS (Ubuntu) + Nginx | Manual deploy | PM2 |
| Montelle | Vercel | Auto-deploy (git push) | Vercel |
| zahrtelkhlig | Vercel | Auto-deploy (git push) | Vercel |
| webistrydev | VPS (Ubuntu) + Nginx | Manual deploy | PM2 |
| elghaly-vr | Vercel | Auto-deploy (git push) | Vercel |

---

## Vercel Deployment

### Auto-deploy setup
```bash
# Link project to Vercel
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### vercel.json (if needed)
```json
{
  "buildCommand": "prisma generate && prisma db push --accept-data-loss && node prisma/seed.cjs && next build",
  "framework": "nextjs"
}
```

### Required Vercel Environment Variables
```
DATABASE_URL             = postgresql://...@neon.tech/neondb
POSTGRES_PRISMA_URL      = postgresql://...@neon.tech/neondb?pgbouncer=true
POSTGRES_URL_NON_POOLING = postgresql://...@neon.tech/neondb
SESSION_SECRET           = [32+ character random string]
ADMIN_PASSWORD           = [admin login password]
GITHUB_TOKEN             = [PAT with repo scope — for image uploads]
GITHUB_REPO              = [repo name — e.g., Montelle-Couture]
NEXT_PUBLIC_SITE_URL     = https://montelle-couture.vercel.app
NODE_ENV                 = production
```

### Neon Database URLs Explained
- `DATABASE_URL` — Standard connection (used everywhere)
- `POSTGRES_PRISMA_URL` — Pooled via PgBouncer (Vercel provides this from integration)
- `POSTGRES_URL_NON_POOLING` — Direct (required for migrations)

Most projects use only `DATABASE_URL`. Add pooled/non-pooling variants only if Vercel auto-provides them from the Neon integration.

---

## VPS Deployment (PM2 + Nginx)

### PM2 Setup
```bash
# Start application
pm2 start npm --name "ahmed-elakad" -- start
pm2 start npm --name "webistrydev" -- run start

# Save process list to survive reboots
pm2 save
pm2 startup  # generates systemd command — run it as sudo

# Restart after deploy
pm2 restart ahmed-elakad
pm2 restart webistrydev

# View logs
pm2 logs ahmed-elakad --lines 50

# List all processes
pm2 list
```

### Nginx Configuration (per site)
```nginx
# /etc/nginx/sites-available/ahmedelakad.com
server {
    listen 80;
    server_name ahmedelakad.com www.ahmedelakad.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ahmedelakad.com www.ahmedelakad.com;
    
    ssl_certificate /etc/letsencrypt/live/ahmedelakad.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ahmedelakad.com/privkey.pem;
    
    # Media files served directly by Nginx (not via Node.js)
    location /media/ {
        alias /home/sherif/data/ahmed-elakad/images/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    location /voices/ {
        alias /home/sherif/data/ahmed-elakad/voices/;
    }
    
    # All other requests → Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d example.com -d www.example.com
# Auto-renews via systemd timer (check with: certbot renew --dry-run)
```

### Deploy Script (VPS projects)
```bash
#!/bin/bash
# deploy.sh
cd /home/sherif/sites/[project-name]
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart [project-name]
echo "Deploy complete"
```

---

## Build Commands Reference

### Simple (no DB)
```bash
npm run build
# package.json: "build": "next build"
```

### With Prisma (ecommerce)
```bash
# package.json:
"build": "prisma generate && prisma db push --accept-data-loss && next build"

# With seeding:
"build": "prisma generate && prisma db push --accept-data-loss && node prisma/seed.cjs && next build"
```

**Warning about `--accept-data-loss`:**
- Automatically accepts column drops, type changes, required field additions
- Safe only for ADDITIVE changes (adding nullable columns, new tables)
- Never use when dropping columns that contain data

---

## Environment Variables

### Local Development (.env.local — never commit)
```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
SESSION_SECRET=your-32-character-secret-key-here
ADMIN_PASSWORD=your-admin-password
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=Montelle-Couture
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

### Template (.env.example — always commit)
```bash
DATABASE_URL=
SESSION_SECRET=
ADMIN_PASSWORD=
GITHUB_TOKEN=
GITHUB_REPO=
NEXT_PUBLIC_SITE_URL=
```

### SESSION_SECRET Generation
```bash
# Generate a secure 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# or
openssl rand -hex 32
```

### VPS Environment (PM2 ecosystem file)
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ahmed-elakad',
    script: 'npm',
    args: 'start',
    cwd: '/home/sherif/sites/Ahmed-Elakad',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    }
  }]
};
```

---

## Port Allocation (VPS)

| Project | Port | Notes |
|---------|------|-------|
| ahmed-elakad | 3000 | Default |
| webistrydev | 3001 | Configured in package.json |
| Montelle (dev) | 3002 | `next dev --port 3002` |
| zahrtelkhlig (dev) | 3000 | Default |

On VPS, multiple projects run on different ports. Nginx routes by domain.

---

## GitHub Repository Setup

All projects should have a GitHub repo under `SherifAsh93`:

```bash
# Initialize (from project directory)
git init
git add .
git commit -m "Initial commit"

# Create repo via GitHub API (PAT stored in ~/.git-credentials)
curl -X POST https://api.github.com/user/repos \
  -H "Authorization: token $(cat ~/.git-credentials | grep github | cut -d: -f3 | cut -d@ -f1)" \
  -d '{"name": "repo-name", "private": false}'

# Push
git remote add origin https://github.com/SherifAsh93/repo-name.git
git push -u origin main
```

---

## Post-Deploy Checklist

```
□ Site loads on HTTPS
□ Admin panel accessible (via logo triple-click)
□ Admin login works
□ Images load (check CDN or /media/ path)
□ Test a user flow (add to cart, checkout, order)
□ Check mobile layout
□ Verify environment variables set correctly
□ PM2 process shows as online (VPS)
□ No errors in PM2 logs (VPS): pm2 logs --lines 20
```

---

## Rollback Procedures

### Vercel
```bash
vercel rollback  # Rolls back to previous production deployment
```

### VPS
```bash
cd /home/sherif/sites/[project]
git log --oneline -10  # Find previous commit hash
git checkout [hash] -- .
npm run build
pm2 restart [project]
```

Or via git revert if you prefer a clean history.

---

## Monitoring (VPS)

```bash
# Process status
pm2 list

# Live logs
pm2 logs --lines 50

# CPU/Memory
pm2 monit

# Disk space (critical for Ahmed-Elakad images)
df -h /home/sherif/data/

# Check Nginx errors
sudo tail -f /var/log/nginx/error.log
```
