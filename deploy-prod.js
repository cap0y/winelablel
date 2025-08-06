#!/usr/bin/env node

/**
 * Production deployment entry point for Replit
 * This script ensures proper environment configuration before starting the server
 */

console.log('[REPLIT-DEPLOY] Starting production deployment...');

// Force production environment variables BEFORE any other imports
process.env.NODE_ENV = 'production';
process.env.PORT = '5000';

console.log('[REPLIT-DEPLOY] Environment forcibly set:');
console.log('[REPLIT-DEPLOY] - NODE_ENV:', process.env.NODE_ENV);
console.log('[REPLIT-DEPLOY] - PORT:', process.env.PORT);

// Validate that the port is correctly set
const expectedPort = 5000;
const actualPort = parseInt(process.env.PORT, 10);

if (actualPort !== expectedPort) {
  console.error(`[REPLIT-DEPLOY] ERROR: PORT mismatch! Expected ${expectedPort}, got ${actualPort}`);
  process.exit(1);
}

console.log('[REPLIT-DEPLOY] Port validation passed. Starting application...');

// Dynamic import to ensure environment is set before server loads
import('./dist/index.js')
  .then(() => {
    console.log('[REPLIT-DEPLOY] Application started successfully');
  })
  .catch((error) => {
    console.error('[REPLIT-DEPLOY] Failed to start application:', error);
    process.exit(1);
  });