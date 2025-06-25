#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Cyrus in development mode...');

// Set development environment
process.env.NODE_ENV = 'development';

// Start Electron with nodemon for auto-restart
const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
const mainPath = path.join(__dirname, '..', 'src', 'main.js');

const electron = spawn('nodemon', [
  '--watch', 'src/',
  '--ext', 'js,html,css',
  '--exec', `${electronPath} .`
], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

electron.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down development server...');
  electron.kill();
  process.exit();
});
