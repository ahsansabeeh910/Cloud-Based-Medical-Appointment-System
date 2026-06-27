#!/bin/bash
set -e

echo "Installing MongoDB dependencies..."
sudo apt-get update
sudo apt-get install -y gnupg curl

echo "Adding MongoDB repository..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor --yes
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

echo "Installing MongoDB..."
sudo apt-get update
sudo apt-get install -y mongodb-org

echo "Configuring MongoDB to listen on all interfaces..."
sudo sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf

echo "Starting and enabling MongoDB service..."
sudo systemctl enable mongod
sudo systemctl start mongod

echo "MongoDB Installation Complete! Status:"
sudo systemctl status mongod --no-pager
