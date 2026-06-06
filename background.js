console.log("🌸 Take Care Sis: Service Worker active.");

const BREAK_INTERVAL_MINUTES = 45;
const WARNING_LEAD_MINUTES = 3;
const SNOOZE_MINUTES = 5;

const PRE_BREAK_ALARM = "preBreakWarningAlarm";
const BREAK_ALARM = "breakAlarm";
const UPCOMING_BREAK_NOTIFICATION_ID = "upcomingBreakNotification";

chrome.runtime.onInstalled.addListener(() => {
  restoreBreakScheduleIfNeeded();
});

chrome.runtime.onStartup.addListener(() => {
  restoreBreakScheduleIfNeeded();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTimer") {
    chrome.storage.local.set({ isWorkdayActive: true }, () => {
      scheduleBreakCycle(BREAK_INTERVAL_MINUTES);
      console.log("⏰ Workday started. First break scheduled.");
    });
  }

  if (message.action === "stopTimer") {
    stopWorkday();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === PRE_BREAK_ALARM) {
    showUpcomingBreakNotification();
  }

  if (alarm.name === BREAK_ALARM) {
    openBreakAndScheduleNextCycle();
  }
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId !== UPCOMING_BREAK_NOTIFICATION_ID) return;

  // Button 0: Start break now
  if (buttonIndex === 0) {
    chrome.notifications.clear(UPCOMING_BREAK_NOTIFICATION_ID);
    openBreakAndScheduleNextCycle();
  }

  // Button 1: Snooze 5 minutes
  if (buttonIndex === 1) {
    chrome.notifications.clear(UPCOMING_BREAK_NOTIFICATION_ID);
    snoozeBreak();
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId !== UPCOMING_BREAK_NOTIFICATION_ID) return;

  chrome.notifications.clear(UPCOMING_BREAK_NOTIFICATION_ID);
  openBreakAndScheduleNextCycle();
});

function scheduleBreakCycle(minutesUntilBreak) {
  clearBreakAlarms(() => {
    const warningDelay = minutesUntilBreak - WARNING_LEAD_MINUTES;

    if (warningDelay > 0) {
      chrome.alarms.create(PRE_BREAK_ALARM, {
        delayInMinutes: warningDelay
      });
    }

    chrome.alarms.create(BREAK_ALARM, {
      delayInMinutes: minutesUntilBreak
    });

    chrome.storage.local.set({
      nextBreakAt: Date.now() + minutesUntilBreak * 60 * 1000,
      snoozedUntil: null
    });

    console.log(`🌸 Next break scheduled in ${minutesUntilBreak} minutes.`);
  });
}

function clearBreakAlarms(callback) {
  chrome.alarms.clear(PRE_BREAK_ALARM, () => {
    chrome.alarms.clear(BREAK_ALARM, () => {
      if (callback) callback();
    });
  });
}

function showUpcomingBreakNotification() {
  chrome.storage.local.get(["isWorkdayActive"], (result) => {
    if (!result.isWorkdayActive) return;

    chrome.notifications.create(UPCOMING_BREAK_NOTIFICATION_ID, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Break in 3 minutes 🌸",
      message: "Wrap up what you’re doing. Your Take care Sis break is almost here.",
      contextMessage: "Start now or snooze for 5 minutes.",
      buttons: [
        { title: "Start break now" },
        { title: "Snooze 5 min" }
      ],
      priority: 1,
      requireInteraction: true,
      silent: false
    });

    console.log("🔔 Upcoming break notification shown.");
  });
}

function snoozeBreak() {
  chrome.storage.local.get(["isWorkdayActive"], (result) => {
    if (!result.isWorkdayActive) return;

    clearBreakAlarms(() => {
      chrome.alarms.create(BREAK_ALARM, {
        delayInMinutes: SNOOZE_MINUTES
      });

      chrome.storage.local.set({
        nextBreakAt: Date.now() + SNOOZE_MINUTES * 60 * 1000,
        snoozedUntil: Date.now() + SNOOZE_MINUTES * 60 * 1000
      });

      console.log("😴 Break snoozed for 5 minutes.");
    });
  });
}

function openBreakAndScheduleNextCycle() {
  chrome.storage.local.get(["isWorkdayActive"], (result) => {
    if (!result.isWorkdayActive) return;

    chrome.notifications.clear(UPCOMING_BREAK_NOTIFICATION_ID);

    triggerBreakTab();

    scheduleBreakCycle(BREAK_INTERVAL_MINUTES);
  });
}

function triggerBreakTab() {
  const options = ["water", "breathing", "stretch", "gratitude", "kegels"];

  chrome.storage.local.get(options, (result) => {
    const activeTypes = options.filter((opt) => result[opt] !== false);

    const chosenType = activeTypes.length > 0
      ? activeTypes[Math.floor(Math.random() * activeTypes.length)]
      : "water";

    const targetUrl = chrome.runtime.getURL(`break.html?type=${chosenType}`);

    console.log("🚀 Launching break path:", targetUrl);

    chrome.tabs.create({ url: targetUrl });
  });
}

function stopWorkday() {
  clearBreakAlarms(() => {
    chrome.notifications.clear(UPCOMING_BREAK_NOTIFICATION_ID);

    chrome.storage.local.set({
      isWorkdayActive: false,
      nextBreakAt: null,
      snoozedUntil: null
    });

    console.log("🛑 Workday stopped. Break alarms cleared.");
  });
}

function restoreBreakScheduleIfNeeded() {
  chrome.storage.local.get(["isWorkdayActive"], (result) => {
    if (!result.isWorkdayActive) return;

    chrome.alarms.get(BREAK_ALARM, (alarm) => {
      if (!alarm) {
        scheduleBreakCycle(BREAK_INTERVAL_MINUTES);
        console.log("♻️ Restored missing break schedule.");
      }
    });
  });
}