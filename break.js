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
    // YOUR CUSTOM ROUTINE: 3x Long sets, then 3x Short pulses + 1 Long relax
    timeline: [
      // 3x Long Squeeze / Long Relax (4 seconds each phase)
      { text: "Squeeze", sub: "Long Hold (1/3)", action: "expand", duration: 4000 },
      { text: "Relax", sub: "Fully Release", action: "contract", duration: 4000 },
      { text: "Squeeze", sub: "Long Hold (2/3)", action: "expand", duration: 4000 },
      { text: "Relax", sub: "Fully Release", action: "contract", duration: 4000 },
      { text: "Squeeze", sub: "Long Hold (3/3)", action: "expand", duration: 4000 },
      { text: "Relax", sub: "Fully Release", action: "contract", duration: 4000 },
      
      // 3x Short Squeeze / Short Relax (1.5 seconds) + 1 Long Relax at the end
      { text: "Squeeze!", sub: "Quick Pulse (1/3)", action: "expand", duration: 1500 },
      { text: "Relax", sub: "Quick Drop", action: "contract", duration: 1500 },
      { text: "Squeeze!", sub: "Quick Pulse (2/3)", action: "expand", duration: 1500 },
      { text: "Relax", sub: "Quick Drop", action: "contract", duration: 1500 },
      { text: "Squeeze!", sub: "Quick Pulse (3/3)", action: "expand", duration: 1500 },
      { text: "Relax...", sub: "Deep Final Release", action: "contract", duration: 5000 }
    ]
  },
  stretch: {
    title: "Time to Move! 🤸‍♀️",
    instruction: "Let's open up your chest and spine with a gentle Cobra Stretch or simple shoulder rolls.",
    showDemo: true,
    imgUrl: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3h0Y3I0eHBrMHVwZnZpdzN0ZnZ6cHFsN3E3M2w1YThwaXN4Y3F6dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7qE1YN7aBOFPRw8E/giphy.gif" 
  },
  gratitude: {
    title: "A Moment of Grace ✨",
    instruction: "Close your eyes and take a slow breath. Name one tiny thing that made you smile or feel safe today."
  }
};

// 1. EXTRACT URL PROPERTY SAFELY
let currentType = 'water';
const urlParams = new URLSearchParams(window.location.search);
const typeParam = urlParams.get('type');
if (typeParam && data[typeParam]) {
  currentType = typeParam;
}

const config = data[currentType];

// 2. INJECT CONTENT TO PAGE
document.getElementById('title').textContent = config.title;
document.getElementById('instruction').textContent = config.instruction;

// 3. RUN INTERACTIVE TIMELINE LOOPS (Breathing / Kegels)
if (config.hasTimeline) {
  const counterBox = document.getElementById('counterBox');
  const pacerText = document.getElementById('pacerText');
  const pacerSubText = document.getElementById('pacerSubText');
  
  counterBox.style.display = 'flex';
  
  let currentStepIndex = 0;

  function runTimelineStep() {
    const step = config.timeline[currentStepIndex];
    
    // Update labels
    pacerText.textContent = step.text;
    pacerSubText.textContent = step.sub || "";

    // Adjust visual circle scaling using class modifiers
    if (step.action === "expand") {
      counterBox.className = "visual-counter expand";
    } else {
      counterBox.className = "visual-counter contract";
    }

    // Move to next step smoothly based on custom durations
    setTimeout(() => {
      currentStepIndex = (currentStepIndex + 1) % config.timeline.length;
      runTimelineStep();
    }, step.duration);
  }

  // Initiate the custom loop array
  runTimelineStep();
}

// 4. DISPLAY STRETCH GRAPHICS
if (config.showDemo) {
  document.getElementById('demoBox').style.display = 'block';
  document.getElementById('demoImg').src = config.imgUrl;
}

// 5. SECURE COMPLIANT CLOSE BUTTON FOR MANIFEST V3
document.getElementById('closeBtn').addEventListener('click', () => {
  window.close();
});