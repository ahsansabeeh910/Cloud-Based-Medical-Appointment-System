#!/bin/bash
set -e
export AWS_ACCESS_KEY_ID=$(grep AWS_ACCESS_KEY_ID ~/mediconnect/.env | cut -d '=' -f2)
export AWS_SECRET_ACCESS_KEY=$(grep AWS_SECRET_ACCESS_KEY ~/mediconnect/.env | cut -d '=' -f2)
export AWS_DEFAULT_REGION=$(grep AWS_REGION ~/mediconnect/.env | cut -d '=' -f2)
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set default.region $AWS_DEFAULT_REGION
aws sts get-caller-identity
