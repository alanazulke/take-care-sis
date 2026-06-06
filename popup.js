const toggleBtn = document.getElementById('toggleBtn');
const resetBtn = document.getElementById('resetBtn');
const breakIntervalPreset = document.getElementById('breakIntervalPreset');
const customBreakInterval = document.getElementById('customBreakInterval');
const breakIntervalNote = document.getElementById('breakIntervalNote');

const DEFAULT_BREAK_INTERVAL_MINUTES = 45;
const MIN_BREAK_INTERVAL_MINUTES = 5;
const MAX_BREAK_INTERVAL_MINUTES = 180;

const checkboxes = {
  water: document.getElementById('water'),
  breathing: document.getElementById('breathing'),
  stretch: document.getElementById('stretch'),
  gratitude: document.getElementById('gratitude'),
  kegels: document.getElementById('kegels')
};

function loadPreferences() {
  chrome.storage.local.get([
    'isWorkdayActive',
    'breakIntervalMinutes',
    'water',
    'breathing',
    'stretch',
    'gratitude',
    'kegels'
  ], (result) => {
    console.log("📦 Loaded from storage:", result);

    setButtonUI(!!result.isWorkdayActive);

    Object.keys(checkboxes).forEach(key => {
      checkboxes[key].checked = result[key] !== false;
    });

    const interval = sanitizeBreakInterval(result.breakIntervalMinutes);
    setIntervalUI(interval);
  });
}

loadPreferences();

Object.keys(checkboxes).forEach(key => {
  checkboxes[key].addEventListener('change', (e) => {
    const status = e.target.checked;
    chrome.storage.local.set({ [key]: status }, () => {
      console.log(`💾 Saved: ${key} is now ${status}`);
    });
  });
});

breakIntervalPreset.addEventListener('change', () => {
  if (breakIntervalPreset.value === 'custom') {
    customBreakInterval.disabled = false;
    customBreakInterval.focus();

    const current = sanitizeBreakInterval(customBreakInterval.value || DEFAULT_BREAK_INTERVAL_MINUTES);
    customBreakInterval.value = current;
    saveBreakInterval(current);
    updateBreakIntervalNote(current);
    return;
  }

  customBreakInterval.disabled = true;
  const selectedInterval = sanitizeBreakInterval(breakIntervalPreset.value);
  customBreakInterval.value = "";
  saveBreakInterval(selectedInterval);
  updateBreakIntervalNote(selectedInterval);
});

customBreakInterval.addEventListener('change', () => {
  const customInterval = sanitizeBreakInterval(customBreakInterval.value);
  customBreakInterval.value = customInterval;
  saveBreakInterval(customInterval);
  updateBreakIntervalNote(customInterval);
});

toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get(['isWorkdayActive'], (result) => {
    const newState = !result.isWorkdayActive;
    const interval = getSelectedBreakInterval();

    chrome.storage.local.set({
      isWorkdayActive: newState,
      breakIntervalMinutes: interval
    }, () => {
      setButtonUI(newState);
      chrome.runtime.sendMessage({ action: newState ? "startTimer" : "stopTimer" });
    });
  });
});

resetBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to reset all data and options?")) {
    chrome.runtime.sendMessage({ action: "stopTimer" });

    chrome.storage.local.clear(() => {
      console.log("🧼 Storage completely wiped clear.");
      loadPreferences();
    });
  }
});

function setButtonUI(isActive) {
  toggleBtn.textContent = isActive ? "Stop Workday" : "Start Workday";
  toggleBtn.className = isActive ? "active" : "inactive";
}

function setIntervalUI(interval) {
  const safeInterval = sanitizeBreakInterval(interval);

  if ([30, 45, 60].includes(safeInterval)) {
    breakIntervalPreset.value = String(safeInterval);
    customBreakInterval.disabled = true;
    customBreakInterval.value = "";
  } else {
    breakIntervalPreset.value = "custom";
    customBreakInterval.disabled = false;
    customBreakInterval.value = safeInterval;
  }

  updateBreakIntervalNote(safeInterval);
}

function getSelectedBreakInterval() {
  if (breakIntervalPreset.value === "custom") {
    return sanitizeBreakInterval(customBreakInterval.value);
  }

  return sanitizeBreakInterval(breakIntervalPreset.value);
}

function saveBreakInterval(interval) {
  const safeInterval = sanitizeBreakInterval(interval);

  chrome.storage.local.set({ breakIntervalMinutes: safeInterval }, () => {
    console.log(`💾 Saved break interval: ${safeInterval} minutes`);

    chrome.runtime.sendMessage({
      action: "updateBreakInterval",
      breakIntervalMinutes: safeInterval
    });
  });
}

function updateBreakIntervalNote(interval) {
  const safeInterval = sanitizeBreakInterval(interval);
  breakIntervalNote.textContent = `First break appears after ${formatMinutes(safeInterval)}. A gentle heads-up appears 3 minutes before.`;
}

function sanitizeBreakInterval(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_BREAK_INTERVAL_MINUTES;
  }

  const rounded = Math.round(parsed);

  if (rounded < MIN_BREAK_INTERVAL_MINUTES) {
    return MIN_BREAK_INTERVAL_MINUTES;
  }

  if (rounded > MAX_BREAK_INTERVAL_MINUTES) {
    return MAX_BREAK_INTERVAL_MINUTES;
  }

  return rounded;
}

function formatMinutes(minutes) {
  if (minutes === 60) {
    return "1 hour";
  }

  return `${minutes} minutes`;
}
