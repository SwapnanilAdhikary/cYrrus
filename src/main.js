require('dotenv').config();

const { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const { askGemini } = require('./services/gemini');
const crypto = require('crypto');

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (e) {
    console.log('Electron reload not available');
  }
}

let lastImageHash = null;
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 280,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Enable dev tools in development
      devTools: process.env.NODE_ENV === 'development'
    }
  });

  win.loadFile('src/index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  win.setIgnoreMouseEvents(false);

  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  win.setContentProtection(true);
}

const toggleVisibility = () => {
  if (win.isVisible()) win.hide();
  else win.show()
}




app.whenReady().then(() => {
  createWindow();

  // Development hot reload shortcut
  if (process.env.NODE_ENV === 'development') {
    globalShortcut.register('Control+R', () => {
      win.reload();
    });
    globalShortcut.register('F12', () => {
      win.webContents.toggleDevTools();
    });
  }

  // 🔁 Toggle Overlay visibility
  globalShortcut.register('Control+Shift+O', toggleVisibility);
  globalShortcut.register('Super+Shift+O', toggleVisibility);

  // Toggle stealth mode
  globalShortcut.register('Control+Shift+P', enableStealthMode);
  globalShortcut.register('Control+Shift+I', disableStealthMode);

  // 📸 Capture Screen & Ask Gemini
  globalShortcut.register('Control+Shift+A', async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: 1920,
          height: 1080,
        }
      });

      if (!sources.length) return;

      const screen = sources[0];
      const imageBuffer = screen.thumbnail.toPNG();
      const base64Image = imageBuffer.toString('base64');

      // 🧠 Compute SHA-256 hash to check for duplicate
      const currentHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');

      if (currentHash === lastImageHash) {
        console.log("🟡 Duplicate screenshot detected. Skipping Gemini call.");
        return;
      }

      lastImageHash = currentHash; // ✅ Save for future comparison

      const defaultPrompt = `
You are a concise coding sidekick. The user is working on a coding problem.
From the image, identify and respond with:

- The coding task or error (if visible)
- A summary of the problem if it's a LeetCode or competitive coding question
- A helpful next step, between 50–100 words

✅ If recommending a fix, optimization, or approach — include concise code snippets inside markdown-style triple backticks (\`\`\`) to help the user implement it quickly.

Ignore display glitches unless they block the task.
`.trim();


      const response = await askGemini(defaultPrompt, base64Image);

      win.webContents.send('stealth-response', {
        prompt: defaultPrompt,
        response: response,
      });

      if (!win.isVisible()) win.show();
    } catch (err) {
      console.error("❌ Error during screen capture:", err);
    }
  });
  // 📡 IPC from renderer (text prompt)
  ipcMain.handle('ask-gemini', async (event, prompt) => {
    return await askGemini(prompt);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
