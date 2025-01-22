const track = document.getElementById("image-track");

// Capture mousedown position
const handleOnDown = e => {
    track.dataset.mouseDownAt = e.clientX || e.touches[0].clientX;
};

// Reset mousedown tracking on mouseup/touchend
const handleOnUp = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage || "0";
};

// Adjust slider movement on mouse/touch move
const handleOnMove = e => {
    if (track.dataset.mouseDownAt === "0") return;

    const clientX = e.clientX || e.touches[0].clientX;
    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - clientX;
    const maxDelta = window.innerWidth / 2;

    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;
    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

    track.dataset.percentage = nextPercentage;

    // Animate track sliding
    track.style.transform = `translate(${nextPercentage}%, -50%)`;

    // Animate individual images
    for (const image of track.getElementsByClassName("image")) {
        image.style.objectPosition = `${100 + nextPercentage}% center`;
    }
};

// Event listeners for mouse and touch events
window.onmousedown = handleOnDown;
window.ontouchstart = handleOnDown;

window.onmouseup = handleOnUp;
window.ontouchend = handleOnUp;

window.onmousemove = handleOnMove;
window.ontouchmove = handleOnMove;
