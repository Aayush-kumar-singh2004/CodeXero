# Render Deployment Guide

## Overview
This guide will help you deploy both your frontend and backend to Render with proper CORS configuration.

## URLs
- **Frontend**: https://codexro-frontend.onrender.com
- **Backend**: https://codexero.onrender.com

## Deployment Steps

### Option 1: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file and deploy both services

### Option 2: Manual Deployment

#### Backend Deployment
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Name**: `codexero-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

4. Add environment variables from `backend/.env.production`

#### Frontend Deployment
1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Set the following:
   - **Name**: `codexero-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: Free

4. Add environment variables:
   - `VITE_API_URL`: `https://codexero.onrender.com`
   - `VITE_SERVER_URL`: `https://codexero.onrender.com`

## CORS Configuration
The backend is configured to accept requests from:
- `https://codexero-frontend.onrender.com` (production)
- `http://localhost:5173` (development)
- `http://localhost:5174` (development)

## Important Notes

### OAuth Configuration
Update your OAuth app settings:

**Google OAuth**:
- Authorized redirect URIs: `https://codexero.onrender.com/user/auth/google/callback`

**GitHub OAuth**:
- Authorization callback URL: `https://codexero.onrender.com/user/auth/github/callback`

Then update the environment variables:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

### Environment Files
- ✅ `backend/.env.production` - Created with production values
- ✅ `frontend/.env.production` - Updated with correct API URLs
- ✅ Backend CORS configuration updated
- ✅ Socket.IO CORS configuration updated

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Check that the frontend URL matches exactly in backend environment variables
2. Ensure `withCredentials: true` is set in frontend API calls (already configured)
3. Verify the backend CORS configuration includes your frontend domain

### Build Issues
- Backend: Ensure all dependencies are in `package.json`
- Frontend: Check that all environment variables are prefixed with `VITE_`

### Socket.IO Issues
The Socket.IO server is configured to accept connections from the same origins as the REST API.

## Testing
After deployment:
1. Test API endpoints: `https://codexero.onrender.com/user/test`
2. Test frontend: `https://codexero-frontend.onrender.com`
3. Test Socket.IO connections
4. Test OAuth flows (after updating OAuth app settings)

## Performance Notes
- Render free tier services sleep after 15 minutes of inactivity
- First request after sleep may take 30+ seconds to respond
- Consider upgrading to paid plans for production use