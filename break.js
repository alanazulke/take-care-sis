// A database of your randomized stretching animations
const stretchPool = [
  {
    title: "Cobra Stretch 🤸‍♀️",
    instruction: "Drop your hips, press up through your hands, and lengthen your spine. Open up your chest and take a deep breath.",
    file: "stretches/cobra.gif"
  },
  {
    title: "Warrior 🧘‍♀️",
    instruction: "From a standing position, one leg is rooted and perpendicular to the earth while the other leg is raised, extended back and parallel to the earth.",
    file: "stretches/warrior_iii.gif"
  },
  {
    title: "Shoulder Release Loop 🌸",
    instruction: "Roll your shoulders backward in large, slow circles. Release the tension built up from typing. Then, do a regular push up, a few if you can :)",
    file: "stretches/shoulders.gif"
  },
  {
    title: "Jump Lunge 🤸‍♀️",
    instruction: "Jump one leg forwards and the other back, landing in a lunge position. Both knees should be at approximately a 90-degree angle. Jump up and switch your legs in the air.",
    file: "stretches/jump1.gif"
  },
  {
    title: "Standing Splits 🤸‍♀️",
    instruction: "From standing forward bend, lift your gaze and find a focal point on the ground in front of you. Walk your fingers out slightly in front of you. Shift your weight to one foot and lift your opposite leg up toward the sky.",
    file: "stretches/hand_down.gif"
  },
  {
    title: "Seated Spinal Twist ✨",
    instruction: "Sit tall, place your hand on your opposite knee, and gently twist your upper body. Hold and breathe smoothly. Then go to the floor and try some planks, stretching your arms up, in alternation.",
    file: "stretches/twist.gif"
  }
];

const data = {
  water: {
    title: "Hydration Check! 💧",
    instruction: "Stand up, stretch your legs, and drink a full glass of water. Your mind and body will thank you."
  },
  breathing: {
    title: "Box Breathing Exercise 🧘‍♀️",
    instruction: "Inhale as the circle grows, hold at the peak, and exhale slowly as it shrinks.",
    hasTimeline: true,
    timeline: [
      { text: "Inhale", action: "expand", duration: 4000 },
      { text: "Hold", action: "expand", duration: 4000 },
      { text: "Exhale", action: "contract", duration: 4000 },
      { text: "Hold", action: "contract", duration: 4000 }
    ]
  },
  kegels: {
    title: "Pelvic Floor Routine 😉",
    instruction: "Follow the physical tracking ring. Engage and squeeze your muscles as it expands, then fully release as it contracts.",
    hasTimeline: true,
    timeline: [
      { text: "Squeeze", sub: "Long Hold (1/3)", action: "expand", duration: 4000 },
      { text: "Relax", sub: "Fully Release", action: "contract", duration: 4000 },
      { text: "Squeeze", sub: "Long Hold (2/3)", action: "expand", duration: 4000 },
      { text: "Relax", sub: "Fully Release", action: "contract", duration: 4000 },
      { text: "Squeeze", sub: "Long Hold (3/3)", action: "expand", duration: 4000 },
      { text: "Relax", sub: "Fully Release", action: "contract", duration: 4000 },
      { text: "Squeeze!", sub: "Quick Pulse (1/3)", action: "expand", duration: 1500 },
      { text: "Relax", sub: "Quick Drop", action: "contract", duration: 1500 },
      { text: "Squeeze!", sub: "Quick Pulse (2/3)", action: "expand", duration: 1500 },
      { text: "Relax", sub: "Quick Drop", action: "contract", duration: 1500 },
      { text: "Squeeze!", sub: "Quick Pulse (3/3)", action: "expand", duration: 1500 },
      { text: "Relax...", sub: "Deep Final Release", action: "contract", duration: 5000 }
    ]
  },
  gratitude: {
    title: "A Moment of Grace ✨",
    instruction: "Close your eyes and take a slow breath. Name one tiny thing that made you smile or feel safe today."
  }
};

// 1. EXTRACT URL PARAMETER
let currentType = 'water';
const urlParams = new URLSearchParams(window.location.search);
const typeParam = urlParams.get('type');
if (typeParam && (data[typeParam] || typeParam === 'stretch')) {
  currentType = typeParam;
}

// 2. LOGIC POOL BRANCHING
let config = {};

if (currentType === 'stretch') {
  const randomIndex = Math.floor(Math.random() * stretchPool.length);
  const selectedStretch = stretchPool[randomIndex];
  
  config = {
    title: selectedStretch.title,
    instruction: selectedStretch.instruction,
    showDemo: true,
    imgUrl: selectedStretch.file
  };
} else {
  config = data[currentType];
}

// 3. INJECT CONTENT TO DOM
document.getElementById('title').textContent = config.title;
document.getElementById('instruction').textContent = config.instruction;

// 4. TIMELINE CONTROLLERS (Breathing & Kegels)
if (config.hasTimeline) {
  const counterBox = document.getElementById('counterBox');
  const pacerText = document.getElementById('pacerText');
  const pacerSubText = document.getElementById('pacerSubText');
  
  counterBox.style.display = 'flex';
  let currentStepIndex = 0;

  function runTimelineStep() {
    const step = config.timeline[currentStepIndex];
    pacerText.textContent = step.text;
    pacerSubText.textContent = step.sub || "";
    counterBox.className = step.action === "expand" ? "visual-counter expand" : "visual-counter contract";

    setTimeout(() => {
      currentStepIndex = (currentStepIndex + 1) % config.timeline.length;
      runTimelineStep();
    }, step.duration);
  }
  runTimelineStep();
}

// 5. UPGRADED: RENDER GIF VIA EXPLICIT RAW INJECTION WITH CACHE BUSTER
if (config.showDemo) {
  const demoBox = document.getElementById('demoBox');
  if (demoBox) {
    // Generate absolute extension internal path path
    const cleanUrl = chrome.runtime.getURL(config.imgUrl);
    
    // Append unique timestamp to shatter browser cache rendering holding patterns
    const cacheBustedUrl = `${cleanUrl}?cb=${Date.now()}`;
    console.log("🔥 Loading fresh asset path:", cacheBustedUrl);

    // Unhide the card element container and stamp the frame explicitly
    demoBox.style.display = 'block';
    demoBox.innerHTML = `<img src="${cacheBustedUrl}" alt="Stretch Animation" style="width: 100%; height: auto; border-radius: 12px;">`;
  }
}

// 6. COMPLIANT CLOSE CONTROLLER
document.getElementById('closeBtn').addEventListener('click', () => {
  window.close();
});