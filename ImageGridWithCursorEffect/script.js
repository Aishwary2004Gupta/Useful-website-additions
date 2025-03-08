document.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.querySelector('.grid-container');
    const cursor = document.getElementById('cursor');
    const gridItemsCount = 50; // Number of grid items

    // Create grid items
    for (let i = 0; i < gridItemsCount; i++) {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridContainer.appendChild(gridItem);
    }

    // Move cursor with mouse
    document.addEventListener('mousemove', function(e) {
        cursor.style.left = `${e.pageX}px`;
        cursor.style.top = `${e.pageY}px`;
    });

    // Change grid item color on hover
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = '#555';
        });
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = '#ccc';
        });
    });
});