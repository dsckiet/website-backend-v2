#!/bin/bash

echo "Starting deployment process...."
read -p "Enter your server public IP : " ip
echo "SSHing to ubuntu@$ip...Please wait!"
ssh -i dsc-portal-key.pem ubuntu@$ip << 'ENDSSH'
echo "Connection Established"
echo "Deploying production"
cd ~/prod/website-backend-v2
echo "Stopping the process.."
sudo pm2 stop 0
echo "Pulling changes..."
sudo git pull origin production
echo "Installing dependencies..."
sudo npm i
echo "Starting the process"
sudo pm2 start 0
echo "Latest production code deployed successfully!!"

echo " "

echo "Deploying development"
cd ~/dev/website-backend-v2
echo "Stopping the process.."
sudo pm2 stop 1
echo "Pulling changes..."
sudo git pull origin master
echo "Installing dependencies..."
sudo npm i
echo "Starting the process"
sudo pm2 start 1
echo "Latest development code deployed successfully!!"
ENDSSH