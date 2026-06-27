#!/bin/bash
set -e

echo "Getting current instance information..."
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
MAC=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/mac)
VPC_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/network/interfaces/macs/$MAC/vpc-id)
SUBNET_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/network/interfaces/macs/$MAC/subnet-id)
WEB_PRIVATE_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/local-ipv4)

echo "VPC: $VPC_ID"
echo "Subnet: $SUBNET_ID"
echo "Web IP: $WEB_PRIVATE_IP"

echo "Creating Database Security Group..."
SG_ID=$(aws ec2 create-security-group --group-name "MongoDB-SG-$(date +%s)" --description "Security group for MongoDB EC2 instance" --vpc-id $VPC_ID --query 'GroupId' --output text)

echo "Adding Inbound Rule for Port 27017 from Web Server..."
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 27017 --cidr ${WEB_PRIVATE_IP}/32

echo "Adding Inbound Rule for SSH (Port 22) from anywhere (for setup)..."
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0

echo "Finding Ubuntu 24.04 AMI in ap-south-1..."
AMI_ID=$(aws ec2 describe-images --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query 'sort_by(Images, &CreationDate)[-1].ImageId' --output text)

echo "Launching Database EC2 Instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --count 1 \
  --instance-type t3.micro \
  --key-name mediconnect \
  --security-group-ids $SG_ID \
  --subnet-id $SUBNET_ID \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MediConnect-Database}]' \
  --query 'Instances[0].InstanceId' --output text)

echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

echo "Getting Private and Public IP of Database Server..."
DB_PRIVATE_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].PrivateIpAddress' --output text)
DB_PUBLIC_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

echo "=========================================="
echo "SUCCESS: Database Server Launched!"
echo "Instance ID: $INSTANCE_ID"
echo "Private IP: $DB_PRIVATE_IP"
echo "Public IP: $DB_PUBLIC_IP"
echo "=========================================="

echo $DB_PRIVATE_IP > ~/db_private_ip.txt
echo $DB_PUBLIC_IP > ~/db_public_ip.txt
