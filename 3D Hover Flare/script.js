const hourHand = document.getElementById("hour-hand");
const minuteHand = document.getElementById("minute-hand");
const background = document.getElementById("background");
const timeDisplay = document.getElementById("time-display");

let isDraggingMinuteHand = false;
let currentTime = { hours: 12, minutes: 0 };

minuteHand.addEventListener("mousedown", startDragging);
document.addEventListener("mousemove", dragMinuteHand);
document.addEventListener("mouseup", stopDragging);

function startDragging() {
  isDraggingMinuteHand = true;
}

function dragMinuteHand(event) {
  if (!isDraggingMinuteHand) return;

  const clockRect = document.querySelector(".clock").getBoundingClientRect();
  const centerX = clockRect.left + clockRect.width / 2;
  const centerY = clockRect.top + clockRect.height / 2;

  const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI) + 90;
  const minuteRotation = (angle + 360) % 360;

  currentTime.minutes = Math.round(minuteRotation / 6) % 60;
  updateClockHands();
  updateTimeDisplay();
  updateBackground();
}

function stopDragging() {
  isDraggingMinuteHand = false;
}

function updateClockHands() {
  const minuteAngle = currentTime.minutes * 6;
  const hourAngle = (currentTime.hours % 12) * 30 + (currentTime.minutes / 60) * 30;

  minuteHand.style.transform = `translate(-50%, -100%) rotate(${minuteAngle}deg)`;
  hourHand.style.transform = `translate(-50%, -100%) rotate(${hourAngle}deg)`;
}

function updateTimeDisplay() {
  const hours = (Math.floor(currentTime.minutes / 60) + currentTime.hours) % 12 || 12;
  const minutes = currentTime.minutes.toString().padStart(2, "0");
  timeDisplay.textContent = `${hours}:${minutes}`;
}

function updateBackground() {
  const hours = currentTime.hours;

  if (hours >= 6 && hours < 12) {
    background.style.backgroundColor = "#FFD580"; // Morning
  } else if (hours >= 12 && hours < 18) {
    background.style.backgroundColor = "#FFA07A"; // Afternoon
  } else if (hours >= 18 && hours < 21) {
    background.style.backgroundColor = "#4B0082"; // Evening
  } else {
    background.style.backgroundColor = "#2E3B55"; // Night
  }
}

// Initialize with default time
updateClockHands();
updateTimeDisplay();
updateBackground();
