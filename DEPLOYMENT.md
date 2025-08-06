# Deployment Configuration Guide

## Port Configuration

The application is configured to use the `PORT` environment variable with the following priority:

1. **Production**: Uses `process.env.PORT` (provided by deployment platform)
2. **Fallback**: Defaults to port `5000` if no PORT environment variable is set

## Required Environment Variables for Production

- `NODE_ENV=production` - Sets the application to production mode
- `PORT=5000` - Server port (should be automatically provided by deployment platform)
- `DATABASE_URL` - PostgreSQL connection string

## Health Check Endpoint

The application provides a comprehensive health check at `/health` that validates:

- Server startup status
- Environment configuration
- Memory usage
- Required environment variables (in production)

### Health Check Response Examples

**Healthy Status (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-26T10:30:00.000Z",
  "uptime": 120.5,
  "environment": "production",
  "port": "5000",
  "memory": {
    "used": 45.2,
    "total": 67.8
  }
}
```

**Unhealthy Status (503):**
```json
{
  "status": "unhealthy",
  "error": "Missing required environment variables",
  "missingVars": ["DATABASE_URL"],
  "timestamp": "2025-01-26T10:30:00.000Z"
}
```

## Deployment Platform Configuration

For Replit Deployments or similar platforms:

1. Ensure the deployment uses the `start` script from package.json
2. The platform should automatically set the `PORT` environment variable
3. Verify the health check endpoint returns 200 status before routing traffic
4. Monitor startup logs for production environment confirmation

## Troubleshooting

### Common Port Configuration Issues

**Problem**: "The server is configured to listen on port 3000 by default instead of the configured port 5000"

**Solutions Applied**:

1. **Aggressive PORT Override**: The server now force-sets `PORT=5000` in production mode regardless of incoming environment variables
2. **Multi-layer Fallback**: Port resolution with validation and error handling 
3. **Comprehensive Logging**: Detailed startup logs show all PORT-related environment variables
4. **Alternative Startup Script**: Created `start-production.js` for explicit environment control

**Debugging Steps**:

1. Check deployment logs for `[SERVER] ===== DEPLOYMENT DEBUG INFO =====` section
2. Verify `Final resolved port: 5000` appears in logs
3. Look for `[PRODUCTION] WARNING: Port X differs from expected 5000!` warnings
4. Ensure health check at `/health` returns status 200

**Expected Production Logs**:
```
[DEPLOYMENT] Force-setting PORT=5000 for production (was: undefined)
[SERVER] ===== DEPLOYMENT DEBUG INFO =====
[SERVER] Raw PORT environment variable: "5000"
[SERVER] Final resolved port: 5000
[SERVER] NODE_ENV: "production"
[SERVER] Target bind address: 0.0.0.0:5000
[PRODUCTION] ===== PRODUCTION DEPLOYMENT =====
[PRODUCTION] Server will start on: 0.0.0.0:5000
[PRODUCTION] Server successfully started: serving on port 5000
```

### Alternative Deployment Methods

If the standard approach continues to fail, try these solutions in order:

**Option 1: Use Dedicated Deployment Script**
- Modify `.replit` deployment configuration to use `node deploy-prod.js` instead of `npm run start`
- This script forces environment variables before any code execution
- Provides explicit validation and error handling

**Option 2: Manual Environment Override**
- Use the alternative startup script: `node start-production.js`
- This provides explicit PORT environment control

**Option 3: Verify Replit Configuration**
- Ensure `.replit` file has correct port mapping:
  ```toml
  [env]
  PORT = "5000"
  
  [[ports]]
  localPort = 5000
  externalPort = 80
  ```
- Check that no other files reference port 3000

**Option 4: Force Rebuild**
- Run `npm run build` to ensure latest changes are compiled
- Verify built file `dist/index.js` contains port 5000 configuration

## Server Startup Logs

In production, the application logs the following for debugging:

```
[PRODUCTION] Starting server with PORT=5000 (resolved to 5000)
[PRODUCTION] NODE_ENV=production
[PRODUCTION] Server binding to 0.0.0.0:5000
[PRODUCTION] Server successfully started: serving on port 5000
```