const ball = document.querySelector('.ball');

ball.addEventListener('click', () => {
    ball.style.backgroundColor = '#FF5722'; // Change color
    ball.style.animation = 'bounce 0.8s infinite cubic-bezier(0.25, 0.1, 0.25, 1)'; // Increase speed
    setTimeout(() => {
        ball.style.backgroundColor = '#4CAF50'; // Reset color
        ball.style.animation = 'bounce 2s infinite cubic-bezier(0.25, 0.1, 0.25, 1)'; // Reset speed
    }, 500); // Reset after 0.5 seconds
});
