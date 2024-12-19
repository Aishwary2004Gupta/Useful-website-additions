document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.querySelector('.progress-bar');
    const progressNumber = document.querySelector('.progress-number');
    const loadingScreen = document.querySelector('.loading-screen');
    const newContent = document.querySelector('.new-content');
    const currentDateTime = document.getElementById('current-date-time');
    let progress = 0;

    function updateProgress() {
        if (progress < 100) {
            progress += 1;
            progressBar.style.width = `${progress}%`;
            progressNumber.textContent = progress;
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
