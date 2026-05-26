console.log("🌸 Take Care Sis: Service Worker is active.");

const adviceList = [
  "Time for a sip of water! Stay hydrated, sis. 💧",
  "Let's do a 4-7-8 breathing exercise. Inhale... hold... exhale. 🧘‍♀️",
  "Stand up and do an active stretch. Roll those shoulders!",
  "Take 30 seconds to think of one thing you're deeply grateful for today. ✨",
  "Quick reminder: engage your core and do a quick set of Kegels. 😉"
];

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTimer") {
    console.log("🚀 Workday started. Alarm scheduled for every 45 minutes.");
    
    // CHANGED: Set to 45 minutes for your actual workday
    chrome.alarms.create("workdayAlarm", { periodInMinutes: 45 }); 
    
    // Optional: Trigger one immediately so you know it started, or leave it silent until the first 45 mins are up!
    triggerNotification("Workday started! I'll remind you to take care of yourself every 45 minutes. 🌸");

  } else if (message.action === "stopTimer") {
    chrome.alarms.clear("workdayAlarm");
    console.log("🛑 Workday stopped. Alarm cleared.");
  }
});

// Listen for the alarm loop
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "workdayAlarm") {
    const randomAdvice = adviceList[Math.floor(Math.random() * adviceList.length)];
    triggerNotification(randomAdvice);
  }
});

// Helper function to keep code clean
function triggerNotification(messageText) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Take care Sis! 🌸",
    message: messageText,
    priority: 2
  });
}