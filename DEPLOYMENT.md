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

If deployment fails with port configuration errors:

1. Check that `PORT` environment variable is being set by the deployment platform
2. Verify health check endpoint responds with 200 status
3. Review server startup logs for production environment messages
4. Ensure the server binds to `0.0.0.0:${PORT}` (not localhost)

## Server Startup Logs

In production, the application logs the following for debugging:

```
[PRODUCTION] Starting server with PORT=5000 (resolved to 5000)
[PRODUCTION] NODE_ENV=production
[PRODUCTION] Server binding to 0.0.0.0:5000
[PRODUCTION] Server successfully started: serving on port 5000
```