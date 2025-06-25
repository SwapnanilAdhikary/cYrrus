// Development utilities
const { app } = require('electron');

class DevTools {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.watchers = new Map();
  }

  init() {
    if (!this.isDevelopment) return;

    console.log('🔧 Development tools initialized');
    this.setupFileWatchers();
    this.setupDevShortcuts();
  }

  setupFileWatchers() {
    // Watch for changes in main process files
    const mainFiles = [
      'src/main.js',
      'src/preload.js',
      'src/services/**/*.js',
      'src/scripts/**/*.js',
    ];

    mainFiles.forEach(pattern => {
      this.watchFiles(pattern, () => {
        console.log('📦 Main process files changed, restarting...');
        app.relaunch();
        app.exit();
      });
    });
  }

  watchFiles(pattern, callback) {
    if (this.watchers.has(pattern)) return;

    try {
      const chokidar = require('chokidar');
      const watcher = chokidar.watch(pattern, {
        ignored: /node_modules/,
        persistent: true
      });

      watcher.on('change', callback);
      this.watchers.set(pattern, watcher);
    } catch (error) {
      console.log('File watcher not available:', error.message);
    }
  }

  setupDevShortcuts() {
    // Additional development shortcuts can be added here
    console.log('⌨️  Development shortcuts:');
    console.log('   Ctrl+R - Reload renderer');
    console.log('   F12 - Toggle DevTools');
    console.log('   Ctrl+Shift+I - Toggle DevTools');
  }

  cleanup() {
    this.watchers.forEach(watcher => watcher.close());
    this.watchers.clear();
  }
}

module.exports = DevTools;
