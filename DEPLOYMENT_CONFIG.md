# Deployment Configuration Guide

This guide explains how to configure the application for different environments (development, production, AWS deployment).

## Environment Variables

### Frontend Environment Variables

#### Development (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_SERVER_URL=http://localhost:3000
```

#### Production (.env.production)
```env
VITE_API_URL=/api
VITE_SERVER_URL=https://your-domain.com
```

**Important**: Replace `https://your-domain.com` with your actual AWS domain.

### Backend Environment Variables

#### Development (.env)
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
# ... other variables
```

#### Production
```env
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
# ... other variables
```

## AWS Deployment Configuration

### 1. Frontend Configuration (S3 + CloudFront)

**Option A: Using Reverse Proxy (Recommended)**
```env
# .env.production
VITE_API_URL=/api
VITE_SERVER_URL=
```

**Option B: Direct Backend Connection**
```env
# .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_SERVER_URL=https://api.yourdomain.com
```

### 2. Backend Configuration (EC2/ECS/Elastic Beanstalk)

```env
# .env.production
PORT=3000
NODE_ENV=production
DOMAIN=api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
# ... other variables
```

### 3. AWS-Specific Considerations

#### Application Load Balancer (ALB) Configuration:
- Enable WebSocket support for Socket.IO
- Configure health checks on `/health` endpoint
- Set up SSL/TLS certificates

#### CloudFront Configuration:
- Configure caching policies for static assets
- Set up origin request policies for API calls
- Enable WebSocket support if using CloudFront for API

#### Security Groups:
- Allow inbound traffic on port 3000 (or your configured port)
- Allow outbound traffic for database and external API connections

### 3. Socket.IO Configuration
For WebSocket connections in production, ensure:

1. Your load balancer supports WebSocket connections
2. Enable sticky sessions if using multiple server instances
3. Configure proper CORS settings for Socket.IO

### 4. Reverse Proxy Setup (Recommended)
Configure your reverse proxy (nginx, ALB, etc.) to:

```nginx
# API routes
location /api/ {
    proxy_pass http://backend:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Socket.IO
location /socket.io/ {
    proxy_pass http://backend:3000/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Configuration Files Updated

The following files have been updated to use environment variables:

### Frontend Files:
- `src/pages/Multiplayer.jsx`
- `src/pages/MultiplayerRandomChallenge.jsx`
- `src/pages/PracticeBehavioralWithAI.jsx`
- `src/pages/PracticeDSAWithAI.jsx`
- `src/pages/PracticeSystemDesignWithAI.jsx`
- `src/pages/MockHRWithAI.jsx`
- `src/components/ChatAi.jsx`
- `src/components/AINavigationAssistant.jsx`
- `src/utils/axiosClient.js`
- `src/config/api.js` (new file)

### New Configuration File:
- `src/config/api.js` - Centralized API configuration

## Testing Configuration

### Local Development
1. Ensure both `.env` files have localhost URLs
2. Start backend on port 3000
3. Start frontend on port 5173
4. Test all multiplayer and AI features

### Production Testing
1. Update environment variables with your actual domains
2. Build frontend: `npm run build`
3. Test API endpoints and WebSocket connections
4. Verify CORS settings

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Update `FRONTEND_URL` in backend `.env`
2. **WebSocket Connection Failed**: Check `VITE_SERVER_URL` configuration
3. **API Not Found**: Verify `VITE_API_URL` points to correct backend
4. **Mixed Content Errors**: Ensure all URLs use HTTPS in production

### Debug Steps:
1. Check browser network tab for failed requests
2. Verify environment variables are loaded correctly
3. Test API endpoints directly
4. Check server logs for connection issues