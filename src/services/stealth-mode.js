const { exec } = require('child_process');
const path = require('path');

let isStealthModeActive = false;

const enableStealthMode = () => {
  if (process.platform === 'win32') {
    const pid = process.pid;
    exec(`Invisiwind.exe --hide ${pid}`, { cwd: path.join(__dirname, '..', 'tools', 'Invisiwind') }, (err) => {
      if (err) {
        console.error("Error while enabling stealth mode:", err);
      } else {
        isStealthModeActive = true;
        console.log("Stealth mode enabled");
      }
    });
  } else {
    // For non-Windows platforms, just set the flag
    isStealthModeActive = true;
    console.log("Stealth mode enabled (simulated on non-Windows)");
  }
};

const disableStealthMode = () => {
  if (process.platform === 'win32') {
    const pid = process.pid;
    exec(`Invisiwind.exe --unhide ${pid}`, { cwd: path.join(__dirname, '..', 'tools', 'Invisiwind') }, (err) => {
      if (err) {
        console.error("Error while disabling the stealth mode:", err);
      } else {
        isStealthModeActive = false;
        console.log("Disabled stealth mode");
      }
    });
  } else {
    // For non-Windows platforms, just set the flag
    isStealthModeActive = false;
    console.log("Stealth mode disabled (simulated on non-Windows)");
  }
};

const getStealthModeStatus = () => {
  return isStealthModeActive;
};

module.exports = {
  enableStealthMode,
  disableStealthMode,
  getStealthModeStatus
};
