const toggleBtn = document.getElementById('toggleBtn');
const resetBtn = document.getElementById('resetBtn');

const checkboxes = {
  water: document.getElementById('water'),
  breathing: document.getElementById('breathing'),
  stretch: document.getElementById('stretch'),
  gratitude: document.getElementById('gratitude'),
  kegels: document.getElementById('kegels')
};

// 1. LOAD SAVED PREFERENCES WHEN POPUP OPENS
function loadPreferences() {
  chrome.storage.local.get(['isWorkdayActive', 'water', 'breathing', 'stretch', 'gratitude', 'kegels'], (result) => {
    console.log("📦 Loaded from storage:", result);

    // Restore Workday Button state
    setButtonUI(!!result.isWorkdayActive);
    
    // Restore Checkboxes (default to true if undefined)
    Object.keys(checkboxes).forEach(key => {
      checkboxes[key].checked = result[key] !== false;
    });
  });
}

loadPreferences();

// 2. SAVE PREFERENCES IMMEDIATELY WHEN USER TICKS/UNTICKS
Object.keys(checkboxes).forEach(key => {
  checkboxes[key].addEventListener('change', (e) => {
    const status = e.target.checked;
    chrome.storage.local.set({ [key]: status }, () => {
      console.log(`💾 Saved: ${key} is now ${status}`);
    });
  });
});

// 3. TOGGLE WORKDAY BUTTON
toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get(['isWorkdayActive'], (result) => {
    const newState = !result.isWorkdayActive;
    
    chrome.storage.local.set({ isWorkdayActive: newState }, () => {
      setButtonUI(newState);
      chrome.runtime.sendMessage({ action: newState ? "startTimer" : "stopTimer" });
    });
  });
});

// 4. RESET STORAGE ENGINE (NEW)
resetBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to reset all data and options?")) {
    // Stop any active workday alarms first
    chrome.runtime.sendMessage({ action: "stopTimer" });
    
    // Clear out the database entirely
    chrome.storage.local.clear(() => {
      console.log("🧼 Storage completely wiped clear.");
      // Reload the panel layout back to pristine defaults
      loadPreferences();
    });
  }
});

function setButtonUI(isActive) {
  toggleBtn.textContent = isActive ? "Stop Workday" : "Start Workday";
  toggleBtn.className = isActive ? "active" : "inactive";
}