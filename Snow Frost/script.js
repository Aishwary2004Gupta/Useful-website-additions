document.addEventListener("DOMContentLoaded", () => {
    const hoverAreas = 30;
    const hoverAreaElement = document.querySelector('.hover-area');

    // Generate hover areas dynamically
    for (let i = 0; i < hoverAreas * hoverAreas; i++) {
        const hoverCell = document.createElement('i');
        hoverAreaElement.appendChild(hoverCell);
    }
});
