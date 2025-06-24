require('dotenv').config();

const { app, BrowserWindow, globalShortcut, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const { askGemini } = require('./services/gemini');
const crypto = require('crypto');

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
    }
  });

  win.loadFile('src/index.html');
  win.setIgnoreMouseEvents(false); // Enable true if you want full stealth click-through
}

app.whenReady().then(() => {
  createWindow();

  // 🔁 Toggle Overlay visibility
  globalShortcut.register('Control+Shift+O', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });

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
