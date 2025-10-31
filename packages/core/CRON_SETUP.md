# Cron Job Setup for Render Free Tier

## Overview

This setup uses an inline worker (API + Worker in same process) with a cron job "keep-alive" ping to prevent Render free tier from spinning down.

## How It Works

1. **Inline Worker**: Worker runs as child process alongside API in `index.ts`
2. **Keep-Alive Endpoint**: `GET /api/v1/internal/ping?secret=YOUR_SECRET`
3. **Cron Service**: External service pings endpoint every 5-10 minutes

## Step 1: Add Environment Variable to Render

1. Go to Render Dashboard → Your API Service
2. Settings → Environment
3. Add new variable:
   - Key: `INTERNAL_SECRET_KEY`
   - Value: Generate a strong random string (e.g., use `openssl rand -hex 32`)

## Step 2: Set Up Cron Job

### Option A: Cron-Job.org (Recommended)

1. Go to https://cron-job.org/
2. Create free account
3. Click "Create cronjob"
4. Configure:
   - **Title**: MessageJS Keep-Alive
   - **Address**: `https://api.messagejs.pro/api/v1/internal/ping?secret=YOUR_SECRET_HERE`
   - **Schedule**: Every 5 minutes (`*/5 * * * *`)
   - **Request Method**: GET
   - **Save and activate**

### Option B: UptimeRobot

1. Go to https://uptimerobot.com/
2. Create free account
3. Add New Monitor
4. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: MessageJS Keep-Alive
   - **URL**: `https://api.messagejs.pro/api/v1/internal/ping?secret=YOUR_SECRET_HERE`
   - **Monitoring Interval**: 5 minutes
   - **Save**

## Step 3: Verify It's Working

1. Check Render logs - you should see "Cron keeper ping received"
2. Send a test message
3. Verify worker processes it within seconds
4. Wait 10+ minutes of no traffic
5. Verify service stays alive (check logs show periodic pings)

## Security Notes

- The `INTERNAL_SECRET_KEY` protects the endpoint from unauthorized access
- Never commit this secret to git
- Use a strong random string (32+ characters recommended)

## Troubleshooting

**Service still spinning down:**
- Verify cron job URL is correct (with secret)
- Check Render logs for ping requests
- Ensure INTERNAL_SECRET_KEY matches in both places

**Worker not processing jobs:**
- Check Render logs for worker startup
- Verify Redis connection
- Check database credentials

**Cron job failing:**
- Verify URL is correct
- Check secret key matches
- Try manual curl: `curl "https://api.messagejs.pro/api/v1/internal/ping?secret=YOUR_SECRET"`

