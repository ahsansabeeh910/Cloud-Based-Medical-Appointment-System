#!/bin/bash
set -e
curl -sL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt-get update
sudo apt-get install -y unzip
unzip -q awscliv2.zip
sudo ./aws/install
aws --version
