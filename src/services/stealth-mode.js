

let isStealthModeActive = false

export const enableStealthMode = () => {
  if (process.platform === 'win32') {
    const pid = process.pid;
    exec(`Invisiwind.exe --hide ${pid}`, { cwd: path.join(__dirname, 'tools', 'Invisiwind') }, (err) => {
      if (err) {
        console.error("Error while enabling stealth mode");
      } else {
        isStealthModeActive = true;
        console.log("Stealth mode enabled");
      }
    });
  }
};

export const disableStealthMode = () => {
  if (process.platform === 'win32') {
    const pid = process.pid;
    exec(`Invisiwind.exe --unhide ${pid}`, { cwd: path.join(__dirname, 'tools', 'Invisiwind') }, (err) => {
      if (err) {
        console.error("Error while disabling the stealth mode");
      } else {
        isStealthModeActive = false;
        console.log("Disabled stealth mode");
      }
    });
  }
};
