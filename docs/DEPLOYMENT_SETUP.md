# 🚀 GitHub Actions CI/CD Deployment Setup

## Overview
Your archcool e-commerce app is now configured to:
- Build Docker images on every push to `main` or `test` branches
- Push images to GitHub Container Registry (GHCR)
- Automatically deploy to Coolify via webhook

---

## 📋 Required GitHub Secrets

You need to add **2 secrets** to your GitHub repository:

### 1. `COOLIFY_API_TOKEN`
- **What it is**: API token from your Coolify instance
- **How to get it**: 
  1. Log into your Coolify dashboard
  2. Go to Settings → API Tokens
  3. Create a new token
  4. Copy the token value

### 2. `COOLIFY_WEBHOOK_URL`
- **What it is**: Webhook URL that triggers redeployment in Coolify
- **How to get it**:
  1. Go to your Coolify project
  2. Navigate to the application settings
  3. Find "Webhooks" section
  4. Copy the webhook URL (should look like: `https://your-coolify-instance.com/api/v1/deploy/webhooks/...`)

---

## 🔧 How to Add Secrets to GitHub

### Method 1: Via GitHub Web UI
1. Go to your repository: `https://github.com/Seganation/archcool`
2. Click **Settings** (top menu)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:
   - Name: `COOLIFY_API_TOKEN`
     Value: `[paste your Coolify API token]`
   - Name: `COOLIFY_WEBHOOK_URL`
     Value: `[paste your Coolify webhook URL]`

### Method 2: Via GitHub CLI (if you have it installed)
```bash
gh secret set COOLIFY_API_TOKEN
# Paste your token when prompted

gh secret set COOLIFY_WEBHOOK_URL
# Paste your webhook URL when prompted
```

---

## 🏗️ What Happens When You Push Code

### Automatic Build Trigger
The workflow runs when:
- ✅ You push to `main` or `test` branch
- ✅ Files change in: `src/**`, `public/**`, `package.json`, `Dockerfile`, or the workflow file
- ✅ You manually trigger it via "Run workflow" button

### Build Process
1. **Checkout Code**: Gets latest code from your branch
2. **Build Docker Image**: 
   - Uses multi-stage build for smaller image size
   - Includes build args: version, timestamp, commit SHA
   - Optimized with layer caching
3. **Push to GHCR**: 
   - Images tagged with branch name, commit SHA, and "latest"
   - Public registry at `ghcr.io/seganation/archcool`
4. **Deploy to Coolify**:
   - Triggers webhook to pull new image
   - Coolify automatically redeploys with new version

---

## 📦 Docker Image Details

### Image Registry
- **Location**: `ghcr.io/seganation/archcool`
- **Tags Created**:
  - `main` or `test` (branch name)
  - `main-abc1234` or `test-abc1234` (branch-commitsha)
  - `latest` (only on main branch)

### Image Size Optimizations
- ✅ Alpine Linux base (~40MB vs 1GB+ Debian)
- ✅ Multi-stage build (only copies what's needed)
- ✅ Next.js standalone output (~80-120MB final image)
- ✅ Layer caching for faster rebuilds

---

## 🔒 Environment Variables for Coolify

Your Coolify deployment needs these environment variables configured:

### Required Runtime Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=https://your-domain.com

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# UploadThing
UPLOADTHING_SECRET=sk_...
UPLOADTHING_APP_ID=your-app-id

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional Variables (already in build)
```bash
# These are injected during Docker build from GitHub Actions
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_BUILD_TIME=2024-11-03T...
NEXT_PUBLIC_COMMIT_SHA=abc1234...
```

---

## 🧪 Testing the Setup

### Test Docker Build Locally
```bash
# Build the image
docker build -t archcool:test .

# Run it locally
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e BETTER_AUTH_SECRET="test-secret" \
  archcool:test

# Test health check
curl http://localhost:3000/api/health
```

### Test Workflow (Without Pushing)
```bash
# Validate workflow syntax
cat .github/workflows/deploy.yml | grep -E "name:|on:|jobs:"

# Check if secrets are set (via GitHub CLI)
gh secret list
```

---

## 🚨 Troubleshooting

### Build Fails
- Check GitHub Actions logs: Repository → Actions → Click failed run
- Common issues:
  - Missing `output: "standalone"` in next.config.mjs ✅ (already added)
  - TypeScript errors (currently ignored with `ignoreBuildErrors: true`)
  - Missing dependencies in package.json

### Deployment Fails
- Check Coolify logs
- Verify webhook URL is correct
- Ensure Coolify can pull from GHCR (should be public by default)

### Image Too Large
Current optimizations should give ~100-150MB image. If larger:
- Check `.dockerignore` is working
- Verify standalone output is enabled
- Remove unused dependencies

---

## 📊 Monitoring

### GitHub Actions
- View build status: Repository → Actions
- Download build logs for debugging
- See image size and build time

### GHCR
- View published images: `https://github.com/Seganation/archcool/pkgs/container/archcool`
- Images are public by default (can be made private in package settings)

### Coolify
- View deployment logs in Coolify dashboard
- Monitor application health
- Check resource usage

---

## ✅ Checklist

- [ ] Add `COOLIFY_API_TOKEN` secret to GitHub
- [ ] Add `COOLIFY_WEBHOOK_URL` secret to GitHub
- [ ] Configure environment variables in Coolify
- [ ] Test local Docker build
- [ ] Push to `test` branch to trigger first build
- [ ] Verify image appears in GHCR
- [ ] Verify Coolify deploys successfully
- [ ] Test the deployed application

---

## 🎉 You're All Set!

Once secrets are added, simply:
```bash
git add -A
git commit -m "Setup CI/CD with GitHub Actions and GHCR"
git push origin test
```

Then watch the magic happen in GitHub Actions! 🚀
