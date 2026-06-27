#!/bin/bash
set -e
echo "Updating apt..."
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

echo "Installing PM2..."
sudo npm install -g pm2

echo "Extracting project..."
mkdir -p ~/mediconnect
tar -xzf ~/project.tar.gz -C ~/mediconnect
cd ~/mediconnect

echo "Setting up server..."
cd server
npm install
cd ..

echo "Setting up client..."
cd client
npm install
VITE_API_URL="http://13.201.63.124/api" npm run build
sudo cp -r dist/* /var/www/html/
cd ..

echo "Configuring Nginx..."
cat << 'EOF' > /tmp/default_nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html;
    server_name _;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
sudo mv /tmp/default_nginx /etc/nginx/sites-available/default
sudo systemctl restart nginx

echo "Starting backend..."
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
