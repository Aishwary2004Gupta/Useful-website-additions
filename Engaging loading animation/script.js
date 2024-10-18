document.addEventListener('DOMContentLoaded', () => {
    // Simulate loading process
    setTimeout(() => {
        // Hide loading animation
        document.querySelector('.loading-container').style.display = 'none';

        // Show image container
        const imageContainer = document.querySelector('.image-container');
        imageContainer.style.display = 'block';

        // Get a random vacation image
        fetchRandomVacationImage();
        // Display current date and day
        displayCurrentDate();
    }, 3000); // Simulate a 3-second loading time
});

// Function to fetch random vacation image
function fetchRandomVacationImage() {
    const vacationImage = document.querySelector('.vacation-image');
    const randomImageUrl = `https://source.unsplash.com/1600x900/?vacation`;
    vacationImage.src = randomImageUrl;
}

// Function to display current date and day
function displayCurrentDate() {
    const dateOverlay = document.querySelector('.date-overlay');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString(undefined, options);
    dateOverlay.textContent = today;
}
