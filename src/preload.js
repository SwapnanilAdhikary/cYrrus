const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  askGemini: (prompt) => ipcRenderer.invoke('ask-gemini', prompt),

  // 🔹 Expose stealth screenshot result listener
  receiveStealthResponse: (callback) => {
    ipcRenderer.on('stealth-response', (_, data) => callback(data));
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');
  if (output) {
    output.textContent += '\n[Overlay ready] Press Ctrl+Shift+O to toggle visibility.';
  }
});
