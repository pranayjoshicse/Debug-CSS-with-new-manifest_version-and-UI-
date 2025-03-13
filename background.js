let isEnabled = false;

function toggleOutlines(tabId) {
  isEnabled = !isEnabled;
  chrome.tabs.sendMessage(tabId, { action: "toggleOutlines", enabled: isEnabled }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[Debug CSS] Error sending message:', chrome.runtime.lastError);
    } else {
      console.log('[Debug CSS] Background: Message sent successfully, response:', response);
    }
  });
}

chrome.action.onClicked.addListener((tab) => {
  toggleOutlines(tab.id);
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-outlines") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      toggleOutlines(tabs[0].id);
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isEnabled) {
    chrome.tabs.sendMessage(tabId, { action: "toggleOutlines", enabled: true });
  }
});