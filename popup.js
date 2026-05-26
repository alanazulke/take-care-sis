const toggleBtn = document.getElementById('toggleBtn');

// Check current status when popup opens
chrome.storage.local.get(['isWorkdayActive'], (result) => {
  if (result.isWorkdayActive) {
    setButtonUI(true);
  } else {
    setButtonUI(false);
  }
});

toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get(['isWorkdayActive'], (result) => {
    const currentState = !!result.isWorkdayActive;
    const newState = !currentState;

    chrome.storage.local.set({ isWorkdayActive: newState }, () => {
      setButtonUI(newState);
      
      if (newState) {
        // Start the 45-minute alarm
        chrome.runtime.sendMessage({ action: "startTimer" });
      } else {
        // Stop the alarm
        chrome.runtime.sendMessage({ action: "stopTimer" });
      }
    });
  });
});

function setButtonUI(isActive) {
  if (isActive) {
    toggleBtn.textContent = "Stop Workday";
    toggleBtn.className = "active";
  } else {
    toggleBtn.textContent = "Start Workday";
    toggleBtn.className = "inactive";
  }
}