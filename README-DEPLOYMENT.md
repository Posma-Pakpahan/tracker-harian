# Vue Weekly Tracker - Deployment Guide

Aplikasi Vue Weekly Tracker dengan backend Node.js + Express + SQLite.

## 🚀 Quick Deployment

### 1. Clone & Setup
```bash
cd /var/www
git clone https://github.com/your-username/vue-weekly-tracker.git
cd vue-weekly-tracker
```

### 2. Auto Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Setup Nginx (Optional)
```bash
chmod +x setup-nginx.sh
./setup-nginx.sh
```

### 4. Setup SSL (Optional)
```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

## 🌐 Access Points

- **Frontend**: https://tracker.posma-pakpahan.me
- **API**: https://tracker.posma-pakpahan.me/api/

## 📋 Manual Commands

### PM2 Management
```bash
pm2 status           # Check status
pm2 logs tracker-api # View logs
pm2 restart tracker-api # Restart
pm2 stop tracker-api # Stop
```

### Update Code
```bash
git pull origin main
./deploy.sh
```

## 🔧 Configuration

### API Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/week-data` - Get weekly data
- `POST /api/update` - Update activity
- `POST /api/activities` - Add activity
- `PUT /api/activities/:id` - Edit activity
- `DELETE /api/activities/:id` - Delete activity

### Environment
- **Development**: `http://localhost:3000`
- **Production**: `https://tracker.posma-pakpahan.me`

## 🗂️ File Structure
```
/var/www/vue-weekly-tracker/
├── api/
│   ├── server.js
│   ├── database.js
│   ├── package.json
│   └── ecosystem.config.js
├── public/
│   ├── index.html
│   ├── app.js
│   ├── config.js
│   └── styles.css
├── schedule.db
├── deploy.sh
├── setup-nginx.sh
└── setup-ssl.sh
```

## 🔍 Troubleshooting

### Check API Status
```bash
curl http://localhost:3001
curl https://tracker.posma-pakpahan.me/api/register
```

### Check Logs
```bash
pm2 logs tracker-api
nginx -t
systemctl status nginx
```

### Restart Services
```bash
pm2 restart tracker-api
systemctl restart nginx
```