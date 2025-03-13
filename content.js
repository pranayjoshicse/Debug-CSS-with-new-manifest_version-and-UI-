function createInfoDiv() {
  const infoDiv = document.createElement('div');
  infoDiv.id = 'elementInfoDiv';
  infoDiv.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
    color: white;
    padding: 10px;
    z-index: 9999;
    font-family: Arial, sans-serif;
    pointer-events: none;
    text-align: center;
    text-shadow: 0 0 5px rgba(0, 0, 0, .8);
  `;
  return infoDiv;
}

function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.id = 'elementTooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 5px 10px;
    border-radius: 3px;
    font-size: 12px;
    z-index: 10000;
    pointer-events: none;
    max-width: 300px;
    font-family: Arial, sans-serif;
    line-height: 1.5;
  `;
  return tooltip;
}

let isEnabled = false;
let infoDiv = null;
let tooltip = null;
let ctrlPressed = false;
let lastMouseX = 0;
let lastMouseY = 0;

function applyOutlines(enabled) {
  isEnabled = enabled;

  const existingStyle = document.getElementById('outlineStyles');
  if (existingStyle) existingStyle.remove();

  if (enabled) {
    let style = document.createElement('link');
    style.id = 'outlineStyles';
    style.rel = 'stylesheet';
    style.href = chrome.runtime.getURL('styles.css');
    document.head.appendChild(style);
  } else {
    if (infoDiv) {
      infoDiv.remove();
      infoDiv = null;
    }
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
    ctrlPressed = false;
  }
}

function updateElementInfo(x, y) {
  if (!isEnabled || !ctrlPressed) return;

  const element = document.elementFromPoint(x, y);
  if (!element) return;

  const styles = window.getComputedStyle(element);

  if (infoDiv) {
    const tagName = element.tagName.toLowerCase();
    const classes = element.className ? element.className.split(' ').join(', ') : 'None';
    infoDiv.textContent = `Hovered element: ${tagName} | Class(es) applied: ${classes}`;
  }

  if (tooltip) {
    const rect = element.getBoundingClientRect();
    tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 5) + 'px';
    tooltip.style.left = (rect.left + window.scrollX + 5) + 'px';
    tooltip.innerHTML = `
      Color: ${styles.color}<br>
      Background: ${styles.background}<br>
      Width: ${styles.width}<br>
      Height: ${styles.height}<br>
      Font-size: ${styles.fontSize}<br>
      Display: ${styles.display}
    `;
  }
}

function setupEventListeners() {
  // Track mouse position globally
  document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    if (ctrlPressed && isEnabled) {
      updateElementInfo(lastMouseX, lastMouseY);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Control' && isEnabled && !ctrlPressed) {
      ctrlPressed = true;
      
      // Create UI elements if they don't exist
      if (!infoDiv) {
        infoDiv = createInfoDiv();
        document.body.appendChild(infoDiv);
      }
      if (!tooltip) {
        tooltip = createTooltip();
        document.body.appendChild(tooltip);
      }
      
      // Update with current mouse position
      updateElementInfo(lastMouseX, lastMouseY);
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Control' && isEnabled) {
      ctrlPressed = false;
      if (infoDiv) {
        infoDiv.remove();
        infoDiv = null;
      }
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    }
  });
}

setupEventListeners();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleOutlines") {
    applyOutlines(message.enabled);
    sendResponse({ status: "success" });
  }
});