const allPaths = document.querySelectorAll("path");
const replayBtn = document.getElementById("replayBtn");

function animatePaths() {
    allPaths.forEach((path) => {
        const length = path.getTotalLength();

        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        path.getBoundingClientRect();

        path.style.transition = "stroke-dashoffset 7s ease-in-out";
        path.style.strokeDashoffset = "0";
    });
}

// Initial animation on page load
animatePaths();

// Replay animation on button click
replayBtn.addEventListener("click", () => {
    allPaths.forEach((path) => {
        path.style.transition = "none";
        path.style.strokeDashoffset = path.getTotalLength();
    });

    // Trigger reflow to apply the reset
    void allPaths[0].offsetWidth;

    // Restart animation
    allPaths.forEach((path) => {
        path.style.transition = "stroke-dashoffset 7s ease-in-out";
        path.style.strokeDashoffset = "0";
    });
});