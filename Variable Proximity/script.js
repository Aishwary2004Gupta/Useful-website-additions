const container = document.getElementById("container");
const textElement = document.getElementById("proximity-text");
const radius = 100;
const fromSettings = { wght: 400, opsz: 9 };
const toSettings = { wght: 1000, opsz: 40 };
const falloff = "linear";

const label = "Hover me! And then star this GitHub repo, or else...";

let i = 0;
while (i < label.length) {
    // Check if the current position starts the word "this"
    if (label.slice(i, i + 4) === "this") {
        const link = document.createElement("a");
        link.href = "https://github.com/Aishwary2004Gupta/Useful-website-additions/tree/main/Variable%20Proximity";
        link.target = "_blank";
        link.style.textDecoration = "underline";
        link.style.color = "blue";
        // Each letter in "this" gets its own span for proximity effect
        "this".split("").forEach(letterChar => {
            const span = document.createElement("span");
            span.className = "proximity-letter";
            span.style.fontSize = "6rem";
            span.textContent = letterChar;
            link.appendChild(span);
        });
        textElement.appendChild(link);
        i += 4; // Skip "this"
        continue;
    }
    const span = document.createElement("span");
    span.className = "proximity-letter";
    span.style.fontSize = "6rem"; // Increased font size
    //to add the spaces in betten the words
    if (label[i] === " ") {
        span.textContent = "\u00A0"; // non-breaking space for visible gap
        span.classList.add("proximity-space");
    } else {
        span.textContent = label[i];
    }
    textElement.appendChild(span);
    i++;
}

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
window.addEventListener("mousemove", animateProximity);
