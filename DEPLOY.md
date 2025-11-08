# Deploy to Vercel

This application is ready to be deployed on Vercel. Here's how:

## Quick Deployment

1. **Push to GitHub**: Make sure your code is in a GitHub repository
2. **Connect to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Import your repository
3. **Deploy**: Vercel will automatically detect the configuration and deploy

## Configuration

The app uses Vercel's serverless functions:
- `/api/health` - Health check endpoint
- `/api/remove-contact` - Main functionality endpoint
- Static files served from `/public/`

## Environment Variables

No environment variables are required for Vercel deployment since all credentials are provided via the frontend form.

## Local Development

```bash
npm install
npm start
```

## Production URL

After deployment, your app will be available at:
`https://your-project-name.vercel.app`
