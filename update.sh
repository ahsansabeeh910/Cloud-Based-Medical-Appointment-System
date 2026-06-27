#!/bin/bash
set -e

echo "Rebuilding client..."
cd ~/mediconnect/client
VITE_API_URL="http://13.201.63.124/api" npm run build
sudo cp -r dist/* /var/www/html/

echo "Configuring Nginx..."
sudo mv ~/default_nginx /etc/nginx/sites-available/default
sudo systemctl restart nginx
echo "Done!"
