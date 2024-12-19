document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.querySelector('.progress-bar');
    const progressNumber = document.querySelector('.progress-number');
    const loadingText = document.getElementById('loading-text');
    const loadingScreen = document.querySelector('.loading-screen');
    const newContent = document.querySelector('.new-content');
    const currentDateTime = document.getElementById('current-date-time');
    let progress = 0;
    let dotCount = 0;

    function updateDots() {
        const dots = '.'.repeat(dotCount);
        loadingText.textContent = `Loading${dots}`;
        dotCount = (dotCount + 1) % 4; // Cycle through 0, 1, 2, 3 dots
    }

    function updateProgress() {
        if (progress < 100) {
            progress += 1;
            progressBar.style.width = `${progress}%`;
            progressNumber.textContent = progress;

            // Update the dots every 300ms
            if (progress % 3 === 0) {
                updateDots();
            }
            setTimeout(updateProgress, 50);
        } else {
            // Slide the new content up after the loading is completed
            loadingScreen.style.transform = 'translateY(-100%)';
            newContent.classList.add('show');

            // Set the current date and time
            const now = new Date();
            currentDateTime.textContent = now.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
    }

    updateProgress();
});
