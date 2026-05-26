console.log("🌸 Take Care Sis: Service Worker active.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTimer") {
    // Keeps the 45-minute production interval
    chrome.alarms.create("workdayAlarm", { periodInMinutes: 45 }); 
    console.log("⏰ Alarm scheduled for every 45 minutes.");
    
    // Trigger an instant preview tab using the safe path resolver
    triggerBreakTab();
  } else if (message.action === "stopTimer") {
    chrome.alarms.clear("workdayAlarm");
    console.log("🛑 Alarm cleared.");
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "workdayAlarm") {
    triggerBreakTab();
  }
});

function triggerBreakTab() {
  const options = ['water', 'breathing', 'stretch', 'gratitude', 'kegels'];
  
  chrome.storage.local.get(options, (result) => {
    // Filter to find which types the user enabled
    const activeTypes = options.filter(opt => result[opt] !== false);
    
    // Fallback if nothing is selected
    const chosenType = activeTypes.length > 0 
      ? activeTypes[Math.floor(Math.random() * activeTypes.length)]
      : 'water';

    // BEST PRACTICE: Force Chrome to resolve the full internal path
    const targetUrl = chrome.runtime.getURL(`break.html?type=${chosenType}`);
    console.log("🚀 Launching explicit path:", targetUrl);

    chrome.tabs.create({ url: targetUrl });
  });
}