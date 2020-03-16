#!/bin/bash

echo "Starting deployment process...."
read -p "Enter your server public IP : " ip
echo "SSHing to ubuntu@$ip...Please wait!"
ssh -i dsc-portal-key.pem ubuntu@$ip << 'ENDSSH'
echo "Connection Established"
cd website-backend-v2
echo "Stopping the process.."
sudo pm2 stop index
echo "Pulling changes..."
sudo git pull origin master
echo "Installing dependencies..."
sudo npm i
echo "Starting the process"
sudo pm2 start index
echo "Latest code deployed successfully!!"
ENDSSH