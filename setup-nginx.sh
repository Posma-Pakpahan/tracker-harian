#!/bin/bash#!/bin/bash

# Setup Nginx for tracker.posma-pakpahan.me

# Jalankan: bash setup-nginx.sh# Install and configure nginx to serve static files

echo "🌐 Setting up Nginx for static file serving..."

NGINX_CONF="/etc/nginx/sites-available/tracker.posma-pakpahan.me"

NGINX_LINK="/etc/nginx/sites-enabled/tracker.posma-pakpahan.me"# Install nginx

APP_ROOT="/home/posma/vue-weekly-tracker/public"apt update

API_PORT=3001apt install nginx -y

DOMAIN=tracker.posma-pakpahan.me

# Create nginx config for vue tracker

cat <<EOF > "$NGINX_CONF"cat > /etc/nginx/sites-available/vue-tracker << 'EOF'

server {server {

    listen 80;    listen 80;

    server_name $DOMAIN;    server_name tracker.posma-pakpahan.me;

    

    location /api/ {    # Redirect HTTP to HTTPS

        proxy_pass http://localhost:$API_PORT/api/;    return 301 https://$server_name$request_uri;

        proxy_set_header Host $host;}

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;server {

        proxy_set_header X-Forwarded-Proto $scheme;    listen 443 ssl http2;

    }    server_name tracker.posma-pakpahan.me;

    

    location / {    # SSL configuration (will be configured by Certbot)

        root $APP_ROOT;    # ssl_certificate /etc/letsencrypt/live/tracker.posma-pakpahan.me/fullchain.pem;

        index index.html;    # ssl_certificate_key /etc/letsencrypt/live/tracker.posma-pakpahan.me/privkey.pem;

        try_files $uri $uri/ /index.html;    

    }    # Serve static files

}    location / {

EOF        root /var/www/vue-weekly-tracker/public;

        index index.html;

ln -sf "$NGINX_CONF" "$NGINX_LINK"        try_files $uri $uri/ /index.html;

echo "[NGINX] Reloading Nginx..."    }

systemctl reload nginx    

    # Proxy API requests to Node.js

echo "[NGINX] Konfigurasi selesai untuk $DOMAIN"    location /api/ {

        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/vue-tracker /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

# Open port 80 and 443
ufw allow 80
ufw allow 443

echo "✅ Nginx configured!"
echo "🌐 Frontend now accessible at: http://tracker.posma-pakpahan.me"
echo "🔗 API accessible at: http://tracker.posma-pakpahan.me/api/"
echo ""
echo "🔒 To enable SSL, run:"
echo "  apt install certbot python3-certbot-nginx -y"
echo "  certbot --nginx -d tracker.posma-pakpahan.me"