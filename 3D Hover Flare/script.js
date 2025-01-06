// Select elements
const minuteHand = document.getElementById("minute-hand");
const background = document.getElementById("background");
const timeDisplay = document.getElementById("time-display");

let currentTime = { hours: 12, minutes: 0 }; // Default time

// Drag-to-rotate functionality
let isDragging = false;
let initialRotation = 0;

minuteHand.addEventListener("mousedown", (e) => {
  isDragging = true;
  const rect = minuteHand.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  initialRotation = Math.atan2(e.clientY - centerY, e.clientX - centerX);
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const rect = minuteHand.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const newRotation = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    let deltaRotation = (newRotation - initialRotation) * (180 / Math.PI);
    let newMinuteRotation = ((deltaRotation + 360) % 360);

    const newMinutes = Math.round(newMinuteRotation / 6) % 60;
    updateClock(newMinutes);

    initialRotation = newRotation;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

function updateClock(minutes) {
  currentTime.minutes = minutes;
  currentTime.hours = (12 + Math.floor(minutes / 60)) % 12 || 12;
  minuteHand.style.transform = `translate(-50%, -100%) rotate(${minutes * 6}deg)`;
  timeDisplay.innerText = `Time: ${currentTime.hours}:${currentTime.minutes
    .toString()
    .padStart(2, "0")}`;
  updateBackground();
}

function updateBackground() {
  const hours = currentTime.hours;

  if (hours >= 6 && hours < 12) {
    // Morning
    background.style.backgroundColor = "#FFD580";
  } else if (hours >= 12 && hours < 18) {
    // Afternoon
    background.style.backgroundColor = "#FFA07A";
  } else if (hours >= 18 && hours < 21) {
    // Evening
    background.style.backgroundColor = "#4B0082";
  } else {
    // Night
    background.style.backgroundColor = "#2E3B55";
  }
}
