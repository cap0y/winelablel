#!/usr/bin/env node

// Production startup script with explicit PORT management
// This ensures PORT=5000 is set before the main application starts

console.log('[STARTUP] Production deployment startup script');
console.log('[STARTUP] Original environment:');
console.log('[STARTUP] - PORT:', process.env.PORT || 'undefined');
console.log('[STARTUP] - NODE_ENV:', process.env.NODE_ENV || 'undefined');

// Force PORT to 5000 for Replit deployment compatibility
process.env.PORT = '5000';
process.env.NODE_ENV = 'production';

console.log('[STARTUP] Forced environment:');
console.log('[STARTUP] - PORT:', process.env.PORT);
console.log('[STARTUP] - NODE_ENV:', process.env.NODE_ENV);

console.log('[STARTUP] Starting main application...');

// Import and start the main server
import('./dist/index.js').catch(error => {
  console.error('[STARTUP] Failed to start application:', error);
  process.exit(1);
});