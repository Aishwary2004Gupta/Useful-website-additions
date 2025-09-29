const container = document.getElementById("comparison");
const leftImg = document.getElementById("leftImg");
const rightImg = document.getElementById("rightImg");
const slider = document.getElementById("slider");
const loadBtn = document.getElementById("loadBtn");
const imgUrlInput = document.getElementById("imgUrl");

let isDragging = false;

function updateSlider(x) {
    const rect = container.getBoundingClientRect();
    const pos = Math.min(Math.max(x - rect.left, 0), rect.width);
    const percent = (pos / rect.width) * 100;

    leftImg.style.clipPath = `inset(0 0 0 ${percent}%)`;
    rightImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    slider.style.left = `${percent}%`;
}

container.addEventListener("mousedown", () => {
    isDragging = true;
});
container.addEventListener("mouseup", () => {
    isDragging = false;
});
container.addEventListener("mouseleave", () => {
    isDragging = false;
});
container.addEventListener("mousemove", (e) => {
    if (isDragging) updateSlider(e.clientX);
});

container.addEventListener(
    "touchstart",
    () => {
        isDragging = true;
    },
    { passive: true }
);
container.addEventListener(
    "touchend",
    () => {
        isDragging = false;
    },
    { passive: true }
);
container.addEventListener(
    "touchmove",
    (e) => {
        if (isDragging) updateSlider(e.touches[0].clientX);
    },
    { passive: true }
);

// Initial slider position
updateSlider(
    container.getBoundingClientRect().width / 2 +
    container.getBoundingClientRect().left
);

// Load custom image
loadBtn.addEventListener("click", () => {
    const url = imgUrlInput.value.trim();
    if (!url) return;
    leftImg.src = url;
    rightImg.src = url;
});