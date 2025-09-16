#!/bin/bash

# Deployment script for AWS
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

ENVIRONMENT=${1:-production}

echo "🚀 Starting deployment for $ENVIRONMENT environment..."

# Check if environment files exist
if [ ! -f "frontend/.env.$ENVIRONMENT" ]; then
    echo "❌ Frontend environment file not found: frontend/.env.$ENVIRONMENT"
    echo "Please copy from frontend/.env.$ENVIRONMENT.example and configure"
    exit 1
fi

if [ ! -f "backend/.env.$ENVIRONMENT" ]; then
    echo "❌ Backend environment file not found: backend/.env.$ENVIRONMENT"
    echo "Please copy from backend/.env.$ENVIRONMENT.example and configure"
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps for AWS deployment:"
echo "1. Upload frontend/dist to S3 bucket"
echo "2. Deploy backend to EC2/ECS/Elastic Beanstalk"
echo "3. Configure ALB/CloudFront with SSL certificates"
echo "4. Update DNS records"
echo "5. Test all functionality including WebSocket connections"
echo ""
echo "📖 See DEPLOYMENT_CONFIG.md for detailed instructions"


