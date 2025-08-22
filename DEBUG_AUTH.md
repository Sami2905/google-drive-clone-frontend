# Authentication Debugging Guide

This guide helps you troubleshoot authentication issues in the Google Drive Clone frontend.

## Common Issues

### 1. 401 Unauthorized Error when accessing files

**Symptoms:**
- Console shows: `Failed to load resource: the server responded with a status of 401 ()`
- File preview/download fails
- Toast notification: "Session expired. Please log in again."

**Causes:**
- JWT token has expired (tokens expire after 7 days)
- Token is invalid or corrupted
- User is not properly authenticated

## Debugging Steps

### 1. Check Authentication Status

In the browser console, run:
```javascript
// Check if you're logged in
console.log('Token exists:', !!localStorage.getItem('token'));

// Check token validity
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expires:', new Date(payload.exp * 1000));
  console.log('Token expired:', payload.exp < Math.floor(Date.now() / 1000));
}
```

### 2. Use the Debug Button

In development mode, you'll see a "Debug Auth" button on the dashboard. Click it to:
- Log authentication status to console
- Test the `/auth/me` endpoint
- Show success/error toast notifications

### 3. Test Signed URL Functionality

In the browser console, run:
```javascript
// Test with a specific file ID
await window.testSignedUrl('your-file-id-here');
```

### 4. Manual Token Refresh

If your token is expired, you can manually refresh it:
```javascript
// This will attempt to refresh the token
const authStore = window.__AUTH_STORE__.getState();
await authStore.refreshToken();
```

## Solutions

### 1. Re-authenticate

If token refresh fails, simply log out and log back in:
1. Click your avatar in the top-right
2. Click "Sign out"
3. Log in again with your credentials

### 2. Clear Browser Data

If issues persist:
1. Open browser developer tools
2. Go to Application/Storage tab
3. Clear localStorage
4. Refresh the page and log in again

### 3. Check Backend Status

Ensure the backend server is running:
```bash
# Check if backend is running on port 5000
curl http://localhost:5000/api/auth/me
```

## Prevention

The app now includes automatic token refresh that should prevent most authentication issues:

1. **Pre-request validation**: Checks token validity before making requests
2. **Automatic refresh**: Attempts to refresh expired tokens
3. **Retry mechanism**: Retries failed requests with new tokens
4. **User feedback**: Shows loading states and error messages

## Development Tools

### Debug Functions

The following functions are available in development mode:

- `window.testSignedUrl(fileId)` - Test signed URL generation
- `window.__AUTH_STORE__.getState().debugAuth()` - Debug authentication state

### Console Logging

Enable detailed logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

This will show additional debug information in the console.

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "No authentication token found" | User is not logged in | Log in |
| "Session expired" | Token has expired | Token refresh or re-login |
| "Invalid or expired token" | Token is corrupted | Clear localStorage and re-login |
| "User not found" | User account deleted | Contact administrator |
