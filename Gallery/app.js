document.addEventListener('DOMContentLoaded', () => {
    const main = document.createElement('main');
    
    // Create progress bar
    const progressDiv = document.createElement('div');
    progressDiv.className = 'progress';
    main.appendChild(progressDiv);
    
    // Create 10 cards
    for (let i = 0; i < 10; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = 'This is My photo gallery This is My photo gallery This is My photo gallery This is My photo gallery This is My photo gallery This is My photo gallery This is My photo gallery This is My photo gallery This is My photo gallery This is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo galleryThis is My photo gallery';
        main.appendChild(card);
    }
    
    document.body.appendChild(main);
});