document.addEventListener("DOMContentLoaded", () => {
    const hoverAreas = 30; // Number of hover areas per row/column
    const hoverAreaContainer = document.querySelector(".hover-area");

    // Generate hover area grid
    for (let i = 0; i < hoverAreas * hoverAreas; i++) {
        const hoverElement = document.createElement("i");
        hoverAreaContainer.appendChild(hoverElement);
    }
});
