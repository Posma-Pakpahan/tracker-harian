#!/bin/bash#!/bin/bash

# Deploy script for tracker.posma-pakpahan.me

# Jalankan: bash deploy.sh# Vue Weekly Tracker Deployment Script

# Run this script in your VPS at /var/www/vue-weekly-tracker/

set -e

echo "🚀 Starting Vue Weekly Tracker Deployment..."

REPO_DIR="/home/posma/vue-weekly-tracker"

API_DIR="$REPO_DIR/api"# Update code from git

FRONTEND_DIR="$REPO_DIR/public"echo "📥 Pulling latest code from git..."

git pull origin main

# Pull latest code

echo "[DEPLOY] Git pull..."# Navigate to API directory

git pull origin maincd api



# Install backend dependencies# Install/update dependencies

cd "$API_DIR"echo "📦 Installing/updating dependencies..."

echo "[DEPLOY] Install API dependencies..."npm install

npm install

# Update database path in database.js

# Install frontend dependencies (if any)echo "🗄️  Updating database configuration..."

# cd "$FRONTEND_DIR"sed -i "s|const db = new sqlite3.Database('../schedule.db');|const db = new sqlite3.Database('/var/www/vue-weekly-tracker/schedule.db');|g" database.js

# npm install

# Update server port in server.js

# Restart PM2echo "🔧 Updating server port..."

pm2 stop tracker-api || truesed -i "s|const PORT = 3000;|const PORT = 3001;|g" server.js

pm2 start server.js --name tracker-api --cwd "$API_DIR" --update-env

# Add start script to package.json if not exists

# Set permissions for scriptsecho "📝 Updating package.json..."

chmod +x "$REPO_DIR/deploy.sh" "$REPO_DIR/setup-nginx.sh" "$REPO_DIR/setup-ssl.sh"if ! grep -q '"start"' package.json; then

    sed -i 's/"scripts": {/"scripts": {\n    "start": "node server.js",/' package.json

echo "[DEPLOY] Selesai. API & frontend siap!"fi


# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart tracker-api || pm2 start ecosystem.config.js

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status

# Open firewall if needed
echo "🔥 Ensuring firewall allows port 3001..."
ufw allow 3001

# Test if server is running
echo "🧪 Testing server..."
sleep 2
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Server is running successfully!"
    echo "🌐 Application accessible at: https://tracker.posma-pakpahan.me"
    echo "📱 Frontend accessible at: https://tracker.posma-pakpahan.me"
else
    echo "❌ Server test failed!"
    echo "📋 Check PM2 logs: pm2 logs tracker-api"
fi

echo "🎉 Deployment completed!"
echo ""
echo "📋 Quick commands:"
echo "  - Check status: pm2 status"
echo "  - View logs: pm2 logs tracker-api"
echo "  - Restart: pm2 restart tracker-api"
echo "  - Stop: pm2 stop tracker-api"