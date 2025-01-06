// Tooltip element
const tooltip = document.getElementById('tooltip');

// Items in the room
const lamp = document.getElementById('lamp');
const table = document.getElementById('table');
const chair = document.getElementById('chair');

// Show tooltip
function showTooltip(e, text) {
  tooltip.textContent = text;
  tooltip.style.top = `${e.clientY + 15}px`;
  tooltip.style.left = `${e.clientX + 15}px`;
  tooltip.style.opacity = 1;
}

// Hide tooltip
function hideTooltip() {
  tooltip.style.opacity = 0;
}

// Lamp interaction
lamp.addEventListener('mouseenter', (e) => showTooltip(e, 'Click to toggle the lamp!'));
lamp.addEventListener('mouseleave', hideTooltip);
lamp.addEventListener('click', () => {
  lamp.style.backgroundColor =
    lamp.style.backgroundColor === 'yellow' ? '#ffc107' : 'yellow';
});

// Table interaction
table.addEventListener('mouseenter', (e) => showTooltip(e, 'This is the table.'));
table.addEventListener('mouseleave', hideTooltip);
table.addEventListener('click', () => {
  table.style.transform = 'scale(1.2)';
  setTimeout(() => (table.style.transform = 'scale(1)'), 500);
});

// Chair interaction
chair.addEventListener('mouseenter', (e) => showTooltip(e, 'Click to shake the chair!'));
chair.addEventListener('mouseleave', hideTooltip);
chair.addEventListener('click', () => {
  chair.style.animation = 'shake 0.5s';
  chair.addEventListener('animationend', () => {
    chair.style.animation = '';
  });
});

// Shake animation
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
}`;
document.head.appendChild(styleSheet);
