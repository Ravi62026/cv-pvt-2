# ChainVerdict GCP Deployment Guide

## Pre-deployment Setup

### 1. GCP Account Setup
- Create Google Cloud Platform account
- Enable billing
- Create a new project
- Enable required APIs:
  - App Engine Admin API
  - Cloud Build API
  - Cloud Storage API

### 2. Install Google Cloud SDK
```bash
# Download and install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Initialize gcloud
gcloud init

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

## Backend Deployment (App Engine)

### 1. Prepare Backend
```bash
cd backend

# Install dependencies
npm install

# Test locally first
npm run dev
```

### 2. Update app.yaml
- Edit `backend/app.yaml`
- Replace `your-frontend-domain.com` with actual frontend URL
- Replace `your-backend-domain.com` with actual backend URL

### 3. Deploy Backend
```bash
cd backend

# Deploy to App Engine
gcloud app deploy

# View logs
gcloud app logs tail -s default
```

### 4. Get Backend URL
After deployment, you'll get a URL like:
`https://YOUR_PROJECT_ID.uc.r.appspot.com`

## Frontend Deployment Options

### Option 1: Firebase Hosting (Recommended)

#### Setup Firebase
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in frontend directory
cd frontend
firebase init hosting
```

#### Configure Firebase
```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### Deploy Frontend
```bash
cd frontend

# Update .env.production with actual backend URL
# VITE_API_URL=https://YOUR_PROJECT_ID.uc.r.appspot.com/api

# Build for production
npm run build

# Deploy to Firebase
firebase deploy
```

### Option 2: App Engine (Alternative)

#### Create app.yaml for Frontend
```yaml
# frontend/app.yaml
runtime: nodejs20

handlers:
- url: /static
  static_dir: dist/static

- url: /(.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot))$
  static_files: dist/\1
  upload: dist/.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$

- url: /.*
  static_files: dist/index.html
  upload: dist/index.html

env_variables:
  VITE_API_URL: https://YOUR_PROJECT_ID.uc.r.appspot.com/api
```

```bash
cd frontend

# Build for production
npm run build

# Deploy to App Engine
gcloud app deploy
```

## Environment Variables Configuration

### 1. Backend Environment Variables
Update `backend/app.yaml` with:
- `CLIENT_URL`: Your frontend domain
- `FRONTEND_URL`: Your frontend domain
- `ALLOWED_HOSTNAMES`: Your backend domain

### 2. Frontend Environment Variables
Update `frontend/.env.production` with:
- `VITE_API_URL`: Your backend API URL
- `VITE_SOCKET_URL`: Your backend WebSocket URL

## Post-Deployment Steps

### 1. Update CORS Settings
```javascript
// backend/server.js
app.use(
    cors({
        origin: [
            "https://your-frontend-domain.com",
            "https://your-custom-domain.com"
        ],
        credentials: true,
    })
);
```

### 2. Update reCAPTCHA Settings
- Go to Google reCAPTCHA console
- Add your production domains
- Update `ALLOWED_HOSTNAMES` in backend

### 3. Database Security
- Whitelist your App Engine IP ranges in MongoDB Atlas
- Update connection strings if needed

### 4. SSL/HTTPS Setup
- App Engine provides HTTPS by default
- For custom domains, configure SSL certificates

## Custom Domain Setup (Optional)

### 1. Backend Custom Domain
```bash
# Map custom domain to App Engine
gcloud app domain-mappings create api.yourdomain.com
```

### 2. Frontend Custom Domain
```bash
# For Firebase Hosting
firebase hosting:channel:deploy production --only hosting
```

## Monitoring and Logs

### 1. View Backend Logs
```bash
gcloud app logs tail -s default
```

### 2. Monitor Performance
- Use Google Cloud Console
- Set up alerts for errors
- Monitor resource usage

## Environment-Specific URLs

### Development
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- AI API: http://localhost:3000

### Production
- Frontend: https://your-frontend-domain.com
- Backend: https://your-backend-domain.com
- AI API: https://your-ai-backend-domain.com

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update CORS settings in backend
2. **Environment Variables**: Check app.yaml configuration
3. **Build Errors**: Ensure all dependencies are installed
4. **Database Connection**: Verify MongoDB Atlas whitelist

### Debug Commands
```bash
# Check App Engine status
gcloud app describe

# View recent deployments
gcloud app versions list

# Check logs
gcloud app logs read
```

## Security Checklist

- [ ] Update JWT secrets for production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable HTTPS only
- [ ] Update reCAPTCHA domains
- [ ] Secure database connections
- [ ] Set up monitoring and alerts

## Cost Optimization

- Use automatic scaling in app.yaml
- Set appropriate instance limits
- Monitor usage in Cloud Console
- Consider using Cloud CDN for static assets
