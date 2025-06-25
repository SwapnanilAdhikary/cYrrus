// DOM Elements
const output = document.getElementById('output');
const input = document.getElementById('input');
const askBtn = document.getElementById('ask-btn');
const askText = document.getElementById('ask-text');
const statusIndicator = document.querySelector('.status-indicator span');
const stealthToggle = document.getElementById('stealth-toggle');

// Application State
let isProcessing = false;
let isStealthMode = false;

// Development mode helpers
const isDevelopment = window.location.protocol === 'file:' && window.location.href.includes('src/');

if (isDevelopment) {
  console.log('🔧 Development mode active');

  // Auto-reload CSS in development
  const watchCSS = () => {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const href = link.href;
      link.href = href + '?v=' + Date.now();
    });
  };

  // Expose reload function globally for development
  window.reloadCSS = watchCSS;
}

// Initialize Application
function initializeApp() {
  // Set initial time
  document.getElementById('init-time').textContent = new Date().toLocaleTimeString();

  // Setup event listeners
  setupEventListeners();

  // Fix initial scroll and layout
  fixScrollAndLayout();
}

// Fix scroll and layout issues
function fixScrollAndLayout() {
  // Ensure response box is properly sized
  const responseBox = document.getElementById('output');
  if (responseBox) {
    // Force scroll to bottom initially
    setTimeout(() => {
      responseBox.scrollTop = responseBox.scrollHeight;
    }, 100);

    // Add wheel event listener for better scrolling
    responseBox.addEventListener('wheel', (e) => {
      // Allow native scrolling
      e.stopPropagation();
    }, { passive: true });
  }

  // Fix window resizing
  window.addEventListener('resize', () => {
    setTimeout(() => {
      if (responseBox) {
        responseBox.scrollTop = responseBox.scrollHeight;
      }
    }, 100);
  });
}

// Event Listeners Setup
function setupEventListeners() {
  // Handle Enter key in input
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleAsk();
    }
  });

  // Stealth mode toggle
  if (stealthToggle) {
    stealthToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStealthMode();
    });
  }

  // Auto-focus input when overlay is shown
  window.addEventListener('focus', () => {
    if (!isProcessing) {
      input.focus();
    }
  });

  // Listen for stealth screen analysis results
  if (window.api && window.api.receiveStealthResponse) {
    window.api.receiveStealthResponse(handleStealthResponse);
  }
}

// Status Management
function updateStatus(status, color = 'var(--success-color)') {
  statusIndicator.textContent = status;
  document.querySelector('.status-dot').style.background = color;
}

// Message Creation
function createMessage(type, icon, title, content, time = null) {
  const messageTime = time || new Date().toLocaleTimeString();
  return `
    <div class="message ${type}">
      <div class="message-header">
        <span class="message-icon">${icon}</span>
        <span>${title}</span>
        <span class="message-time">${messageTime}</span>
      </div>
      <div class="message-content">${content}</div>
    </div>
  `;
}

// Loading State Management
function setLoading(loading) {
  isProcessing = loading;

  if (loading) {
    askText.innerHTML = `
      <div class="loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `;
    askBtn.disabled = true;
    input.placeholder = "Processing...";
    updateStatus('Thinking...', 'var(--warning-color)');
  } else {
    askText.textContent = 'Ask';
    askBtn.disabled = false;
    input.placeholder = "Ask Cyrus anything...";
    updateStatus('Ready');
  }
}

// Main Ask Handler
async function handleAsk() {
  const prompt = input.value.trim();
  if (!prompt || isProcessing) return;

  // Add user message to output
  const userMessage = createMessage('user', '🧍', 'You', prompt);
  output.innerHTML += userMessage;

  // Clear input and set loading state
  input.value = "";
  setLoading(true);

  // Force scroll after adding user message
  forceScrollToBottom();

  try {
    // Call Gemini API through preload script
    const response = await window.api.askGemini(prompt);
    const html = marked.parse(response);

    // Add assistant response to output
    const assistantMessage = createMessage('assistant', '🤖', 'Cyrus', html);
    output.innerHTML += assistantMessage;
  } catch (err) {
    // Handle errors
    console.error('Error calling Gemini API:', err);
    const errorMessage = createMessage('error', '⚠️', 'Error', err.message);
    output.innerHTML += errorMessage;
  } finally {
    // Reset loading state and scroll to bottom
    setLoading(false);
    forceScrollToBottom();
  }
}

// Stealth Response Handler
function handleStealthResponse({ prompt, response }) {
  updateStatus('Analyzing...', 'var(--secondary-color)');

  const html = marked.parse(response);
  const screenshotMessage = createMessage('screenshot', '📸', 'Screen Analysis', html);
  output.innerHTML += screenshotMessage;

  forceScrollToBottom();

  // Reset status after 2 seconds
  setTimeout(() => updateStatus('Ready'), 2000);
}

// Stealth Mode Management
function toggleStealthMode() {
  isStealthMode = !isStealthMode;

  if (isStealthMode) {
    enableStealthMode();
  } else {
    disableStealthMode();
  }

  updateStealthUI();

  // Add message about stealth mode change
  const stealthMessage = createMessage('system', '🔧', 'System',
    `Stealth mode ${isStealthMode ? 'enabled' : 'disabled'}. ${isStealthMode ? 'Window is now hidden from screenshots and screen recordings.' : 'Window is now visible normally.'}`);
  output.innerHTML += stealthMessage;
  forceScrollToBottom();
}

function enableStealthMode() {
  // Call the main process stealth functions via IPC
  if (window.api && window.api.enableStealthMode) {
    window.api.enableStealthMode().then((status) => {
      isStealthMode = status;
      updateStealthUI();
    });
  } else {
    isStealthMode = true;
    updateStealthUI();
  }
}

function disableStealthMode() {
  // Call the main process stealth functions via IPC
  if (window.api && window.api.disableStealthMode) {
    window.api.disableStealthMode().then((status) => {
      isStealthMode = status;
      updateStealthUI();
    });
  } else {
    isStealthMode = false;
    updateStealthUI();
  }
}

function updateStealthUI() {
  if (!stealthToggle) return;

  const overlay = document.querySelector('.overlay');

  if (isStealthMode) {
    stealthToggle.classList.add('active');
    stealthToggle.querySelector('.stealth-icon').textContent = '🕵️';
    stealthToggle.title = 'Stealth Mode: ON - Window is hidden from screenshots';
    updateStatus('Stealth Active', 'var(--secondary-color)');
    overlay.classList.add('stealth-active');

    // Add stealth indicator to title
    document.title = '🕵️ Cyrus Assistant Overlay - Stealth Mode';
  } else {
    stealthToggle.classList.remove('active');
    stealthToggle.querySelector('.stealth-icon').textContent = '👁️';
    stealthToggle.title = 'Stealth Mode: OFF - Window is visible normally';
    updateStatus('Ready');
    overlay.classList.remove('stealth-active');

    // Remove stealth indicator from title
    document.title = 'Cyrus Assistant Overlay';
  }
}

// Utility Functions
function scrollToBottom() {
  // More robust scrolling
  if (output) {
    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      output.scrollTop = output.scrollHeight;

      // Double-check after a short delay
      setTimeout(() => {
        output.scrollTop = output.scrollHeight;
      }, 50);
    });
  }
}

// Enhanced scroll to bottom with force option
function forceScrollToBottom() {
  if (output) {
    output.style.scrollBehavior = 'auto';
    output.scrollTop = output.scrollHeight + 1000; // Extra padding to ensure we reach bottom

    setTimeout(() => {
      output.style.scrollBehavior = 'smooth';
    }, 100);
  }
}

// Error Handling
function handleError(error, context = 'Unknown') {
  console.error(`Error in ${context}:`, error);

  if (isDevelopment) {
    // More detailed error info in development
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString()
    };
    console.table(errorDetails);
  }

  const errorMessage = createMessage('error', '⚠️', 'System Error',
    `An error occurred in ${context}: ${error.message}`);
  output.innerHTML += errorMessage;
  scrollToBottom();
}

// Global Error Handler
window.addEventListener('error', (event) => {
  handleError(event.error, 'Global');
});

// Unhandled Promise Rejection Handler
window.addEventListener('unhandledrejection', (event) => {
  handleError(new Error(event.reason), 'Promise Rejection');
});

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export functions for potential external use
window.CyrusApp = {
  handleAsk,
  updateStatus,
  createMessage,
  setLoading,
  scrollToBottom,
  forceScrollToBottom,
  toggleStealthMode,
  enableStealthMode,
  disableStealthMode,
  isStealthMode: () => isStealthMode
};
