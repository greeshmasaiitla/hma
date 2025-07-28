# 🚀 Hospital Management System - Deployment Guide

## 📋 Prerequisites
1. GitHub account
2. Render account (free)
3. MongoDB Atlas account (free)

## 🗄️ Step 1: Set up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster (M0 Free tier)
4. Create database user with password
5. Get connection string
6. **Save the connection string** - you'll need it later

## 🚀 Step 2: Deploy to Render

### 2.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 2.2 Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `hospital-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Root Directory:** `backends`

### 2.3 Set Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/hospital
JWT_SECRET=your-super-secret-jwt-key-here
```

### 2.4 Deploy Frontend
1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name:** `hospital-frontend`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`
   - **Root Directory:** `frontend`

### 2.5 Set Frontend Environment Variables
```
REACT_APP_API_URL=https://your-backend-name.onrender.com
REACT_APP_SOCKET_URL=https://your-backend-name.onrender.com
```

## 🔧 Step 3: Update Code for Production

### Update CORS in server.js
Replace `your-app-name.onrender.com` with your actual backend URL.

### Update Frontend API Calls
All `localhost:5000` calls will automatically use the environment variable.

## ✅ Step 4: Test Deployment

1. Visit your frontend URL
2. Test login with existing credentials
3. Check if all features work

## 🔗 Your URLs
- **Frontend:** `https://your-frontend-name.onrender.com`
- **Backend:** `https://your-backend-name.onrender.com`

## 🆘 Troubleshooting

### Common Issues:
1. **CORS errors:** Check CORS configuration in server.js
2. **Database connection:** Verify MongoDB Atlas connection string
3. **Environment variables:** Make sure all are set in Render dashboard

### Check Logs:
- Go to Render dashboard → Your service → Logs
- Look for error messages

## 📞 Support
- Render documentation: [docs.render.com](https://docs.render.com)
- MongoDB Atlas: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---
**🎉 Your hospital management system will be live and accessible from anywhere!** 