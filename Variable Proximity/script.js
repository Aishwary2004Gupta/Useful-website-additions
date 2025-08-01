const container = document.getElementById("container");
const textElement = document.getElementById("proximity-text");
const radius = 100;
const fromSettings = { wght: 400, opsz: 9 };
const toSettings = { wght: 1000, opsz: 40 };
const falloff = "linear";

const label = "Hover me! And then star this GitHub repo, or else...";

label.split("").forEach((char, index) => {
  const span = document.createElement("span");
  span.className = "proximity-letter";
  span.textContent = char;
  textElement.appendChild(span);
});

const letters = [...document.querySelectorAll(".proximity-letter")];

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function getFalloff(distance) {
  const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
  switch (falloff) {
    case "exponential":
      return norm ** 2;
    case "gaussian":
      return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
    default:
      return norm;
  }
}

function animateProximity(e) {
  const rect = container.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  letters.forEach(letter => {
    const lRect = letter.getBoundingClientRect();
    const lX = lRect.left + lRect.width / 2 - rect.left;
    const lY = lRect.top + lRect.height / 2 - rect.top;
    const distance = calculateDistance(mouseX, mouseY, lX, lY);

    if (distance > radius) {
      letter.style.fontVariationSettings = `'wght' ${fromSettings.wght}, 'opsz' ${fromSettings.opsz}`;
    } else {
      const fall = getFalloff(distance);
      const wght = fromSettings.wght + (toSettings.wght - fromSettings.wght) * fall;
      const opsz = fromSettings.opsz + (toSettings.opsz - fromSettings.opsz) * fall;
      letter.style.fontVariationSettings = `'wght' ${wght.toFixed(1)}, 'opsz' ${opsz.toFixed(1)}`;
    }
  });
}

window.addEventListener("mousemove", animateProximity);
