#!/bin/bash

# Vue Weekly Tracker Deployment Script
# Jalankan: bash deploy.sh

set -e

echo "🚀 Starting Vue Weekly Tracker Deployment..."

REPO_DIR="/var/www/vue-weekly-tracker"
API_DIR="$REPO_DIR/api"
FRONTEND_DIR="$REPO_DIR/public"

# Pull latest code
echo "📥 Pulling latest code from git..."
git pull origin main

# Install backend dependencies
echo "📦 Installing API dependencies..."
cd "$API_DIR"
npm install

# Restart PM2
echo "🔄 Restarting PM2 process..."
pm2 stop tracker-api || true
pm2 start server.js --name tracker-api --cwd "$API_DIR" --update-env

# Set permissions for scripts
chmod +x "$REPO_DIR/deploy.sh" "$REPO_DIR/setup-nginx.sh" "$REPO_DIR/setup-ssl.sh"

echo "🎉 Deployment completed!"
echo "🌐 Application accessible at: https://tracker.posma-pakpahan.me"
echo "📋 Quick commands:"
echo "  - Check status: pm2 status"
echo "  - View logs: pm2 logs tracker-api"
echo "  - Restart: pm2 restart tracker-api"
echo "  - Stop: pm2 stop tracker-api"