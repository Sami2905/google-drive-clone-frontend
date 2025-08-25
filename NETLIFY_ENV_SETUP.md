# Netlify Environment Variables Setup

## Overview
This guide explains how to set up environment variables in Netlify to deploy your Google Drive Clone frontend securely.

## Environment Variables to Set in Netlify

### 1. Go to Netlify Dashboard
- Navigate to your site in Netlify
- Go to **Site settings** → **Build & deploy** → **Environment**

### 2. Add the following environment variables:

#### API Configuration
```
NEXT_PUBLIC_API_URL = https://google-drive-clone-backend-gpqh.onrender.com/api
NEXT_PUBLIC_API_BASE_URL = https://google-drive-clone-backend-gpqh.onrender.com
```

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL = https://zkgqoeaszrwszzynxazo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZ3FvZWFzenJ3c3p6eW54YXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMzg4NDAsImV4cCI6MjA3MDgxNDg0MH0.202-9XXN9sjr3vvXyuHmgKRdbxXzhp59JbDL4LLztA8
```

#### App Configuration
```
NEXT_PUBLIC_APP_NAME = Google Drive Clone
NEXT_PUBLIC_APP_VERSION = 1.0.0
NEXT_PUBLIC_APP_DESCRIPTION = Secure file storage and sharing platform
NEXT_PUBLIC_SUPPORT_EMAIL = support@yourdomain.com
NEXT_PUBLIC_DOCS_URL = https://docs.yourdomain.com
```

#### Google OAuth
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID = 286199503169-assvp49dr9e6ln5rpurkulrnq2ctth7o.apps.googleusercontent.com
```

#### Feature Flags
```
NEXT_PUBLIC_ENABLE_ANALYTICS = true
NEXT_PUBLIC_ENABLE_DEBUG = false
NEXT_PUBLIC_ENABLE_SOURCE_MAPS = false
NEXT_PUBLIC_ENABLE_BETA_FEATURES = false
NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES = false
NEXT_PUBLIC_ENABLE_PWA = true
NEXT_PUBLIC_ENABLE_OFFLINE_SUPPORT = true
NEXT_PUBLIC_ENABLE_CACHING = true
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN = true
NEXT_PUBLIC_ENABLE_TWO_FACTOR_AUTH = false
NEXT_PUBLIC_ENABLE_SSO = false
NEXT_PUBLIC_ENABLE_ENTERPRISE_FEATURES = false
NEXT_PUBLIC_SHOW_GALLERY = false
```

#### Performance & Limits
```
NEXT_PUBLIC_MAX_FILE_SIZE = 104857600
NEXT_PUBLIC_MAX_UPLOAD_CONCURRENT = 3
NEXT_PUBLIC_SESSION_TIMEOUT = 3600000
```

#### URLs
```
NEXT_PUBLIC_AUTH_REDIRECT_URL = https://your-netlify-site.netlify.app/dashboard
NEXT_PUBLIC_LOGOUT_REDIRECT_URL = https://your-netlify-site.netlify.app/login
```

#### Monitoring (Optional - set to placeholder values if not using)
```
NEXT_PUBLIC_SENTRY_DSN = your_sentry_dsn_here
NEXT_PUBLIC_LOGROCKET_ID = your_logrocket_id_here
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID = your_google_analytics_id_here
```

#### Development Features
```
NEXT_PUBLIC_ENABLE_HOT_RELOAD = false
NEXT_PUBLIC_ENABLE_ERROR_BOUNDARY = true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING = true
NEXT_PUBLIC_ENABLE_ACCESSIBILITY_FEATURES = true
```

#### Build Configuration
```
NODE_ENV = production
NODE_VERSION = 22.12.0
NPM_CONFIG_PRODUCTION = false
```

## Important Notes

### 1. Security
- **NEVER** add sensitive secrets like `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, or database credentials
- Only use `NEXT_PUBLIC_*` variables for client-side code
- The Supabase anon key is intentionally public and safe to expose

### 2. URL Updates
- Update `NEXT_PUBLIC_AUTH_REDIRECT_URL` and `NEXT_PUBLIC_LOGOUT_REDIRECT_URL` to match your actual Netlify domain
- Ensure your backend API is accessible from the production domain

### 3. Feature Flags
- Set `NEXT_PUBLIC_ENABLE_DEBUG = false` in production
- Set `NEXT_PUBLIC_ENABLE_SOURCE_MAPS = false` in production for smaller bundle sizes

### 4. After Setting Variables
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Monitor the build logs for any errors

## Troubleshooting

### Common Issues
1. **Build fails with "Missing environment variables"**
   - Ensure all required variables are set in Netlify
   - Check for typos in variable names

2. **Secret scanning still blocks deployment**
   - Verify `SECRETS_SCAN_OMIT_KEYS` is set in `netlify.toml`
   - Check that no sensitive values are hardcoded in the repository

3. **Environment variables not available in client**
   - Ensure variables start with `NEXT_PUBLIC_`
   - Rebuild and redeploy after adding new variables

### Verification
After deployment, you can verify environment variables are working by:
1. Opening browser dev tools
2. Going to Console
3. Typing: `console.log(process.env.NEXT_PUBLIC_APP_NAME)`
4. Should show "Google Drive Clone"

## Next Steps
1. Set all environment variables in Netlify
2. Trigger a new deployment
3. Test the application functionality
4. Monitor for any runtime errors
