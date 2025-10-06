#!/bin/bash#!/bin/bash

# Setup SSL dengan Certbot untuk tracker.posma-pakpahan.me

# Jalankan: bash setup-ssl.sh# SSL Setup Script for tracker.posma-pakpahan.me

echo "🔒 Setting up SSL certificate for tracker.posma-pakpahan.me..."

DOMAIN=tracker.posma-pakpahan.me

EMAIL=admin@posma-pakpahan.me# Install Certbot

echo "📦 Installing Certbot..."

# Install certbot jika belum adaapt update

if ! command -v certbot &> /dev/null; thenapt install certbot python3-certbot-nginx -y

    echo "[SSL] Installing certbot..."

    sudo apt update && sudo apt install -y certbot python3-certbot-nginx# Get SSL certificate

fiecho "🔐 Obtaining SSL certificate..."

certbot --nginx -d tracker.posma-pakpahan.me --non-interactive --agree-tos --email admin@posma-pakpahan.me

# Dapatkan/renew sertifikat SSL

sudo certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --redirect --non-interactive# Setup auto-renewal

echo "🔄 Setting up auto-renewal..."

echo "[SSL] SSL untuk $DOMAIN sudah aktif!"crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -


# Test renewal
echo "🧪 Testing renewal..."
certbot renew --dry-run

echo "✅ SSL setup completed!"
echo "🔒 Your site is now accessible at: https://tracker.posma-pakpahan.me"