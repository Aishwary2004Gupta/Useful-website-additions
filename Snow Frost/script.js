document.addEventListener("DOMContentLoaded", () => {
    const hoverAreas = 30;
    const hoverAreaElement = document.querySelector('.hover-area');

    // Generate hover traps dynamically
    for (let i = 0; i < hoverAreas * hoverAreas; i++) {
        const hoverTrap = document.createElement('i');
        hoverAreaElement.appendChild(hoverTrap);
    }
});
