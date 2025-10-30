# Dashboard Deployment Guide

## Quick Deploy to Vercel (Recommended)

### 1. Prerequisites
- GitHub repository connected
- Vercel account (free tier works)

### 2. Deploy Steps

```bash
# Navigate to dashboard directory
cd packages/dashboard

# Deploy to Vercel
npx vercel
```

Or use Vercel dashboard:
1. Import your GitHub repository
2. Set root directory to `packages/dashboard`
3. Set environment variables
4. Deploy

### 3. Environment Variables

Add these in Vercel dashboard under Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://api.messagejs.pro/api/v1
```

### 4. Custom Domain Setup

1. Go to Settings → Domains in Vercel
2. Add `app.messagejs.pro`
3. Follow DNS configuration steps
4. Enable HTTPS (automatic with Vercel)

---

## Alternative: Netlify

### 1. Prerequisites
- Netlify account
- GitHub repository

### 2. Deploy Steps

1. Import repository in Netlify
2. Set build settings:
   - **Base directory:** `packages/dashboard`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

### 3. Environment Variables

Add in Netlify dashboard under Site Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://api.messagejs.pro/api/v1
```

### 4. Custom Domain

Add custom domain in Netlify dashboard and configure DNS.

---

## Manual Deployment (Self-hosted)

### 1. Build

```bash
cd packages/dashboard
npm install
npm run build
```

### 2. Run

```bash
npm start
```

For production, use a process manager like PM2:

```bash
pm2 start npm --name "messagejs-dashboard" -- start
```

### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name app.messagejs.pro;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL with Let's Encrypt

```bash
certbot --nginx -d app.messagejs.pro
```

---

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Core API endpoint | `http://localhost:3001/api/v1` |

---

## Post-Deployment Checklist

- [ ] Verify dashboard loads at app.messagejs.pro
- [ ] Test login flow
- [ ] Test registration flow
- [ ] Verify API connections work
- [ ] Check HTTPS is enabled
- [ ] Test on mobile devices
- [ ] Update DNS records
- [ ] Configure error tracking (if using)

---

## Troubleshooting

### Build Errors
- Ensure Node.js version >= 20.0.0
- Clear `.next` folder and rebuild
- Check for TypeScript errors: `npm run typecheck`

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings on the API server
- Ensure API is accessible from dashboard domain

### Environment Variables Not Working
- Restart deployment after adding variables
- Variables must start with `NEXT_PUBLIC_` to be available in browser
- Check browser console for errors

---

## Maintenance

### Update Dashboard
```bash
git pull origin main
cd packages/dashboard
npm install
npm run build
# Redeploy
```

### Monitor Logs
- Vercel: Dashboard → Deployments → Logs
- Netlify: Deploys → Click on deploy → Logs
- Self-hosted: Check PM2 logs or system logs

