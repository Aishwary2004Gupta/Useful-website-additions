document.addEventListener('DOMContentLoaded', () => {
    const main = document.createElement('main');

    // Create progress bar
    const progressDiv = document.createElement('div');
    progressDiv.className = 'progress';
    main.appendChild(progressDiv);

    // Create 10 cards with Unsplash images
    for (let i = 0; i < 8; i++) {
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        img.src = `https://www.pexels.com/search/unsplash/?random=${i}`; // Random image from Picsum
        img.alt = 'Random Unsplash image';
        img.loading = 'lazy'; // Enable lazy loading for better performance

        card.appendChild(img);
        main.appendChild(card);
    }

    document.body.appendChild(main);
});