document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const audioElements = document.querySelectorAll('audio');

    keys.forEach(key => {
        key.addEventListener('click', () => {
            const keyCode = key.getAttribute('data-key');
            playSound(keyCode);
        });
    });

    document.addEventListener('keydown', (event) => {
        const keyCode = event.keyCode.toString();
        playSound(keyCode);
    });

    function playSound(keyCode) {
        const audio = document.querySelector(`audio[data-key="${keyCode}"]`);
        const key = document.querySelector(`.key[data-key="${keyCode}"]`);

        if (!audio) return;

        audio.currentTime = 0; // Rewind to the start
        audio.play();

        key.classList.add('active');
        setTimeout(() => {
            key.classList.remove('active');
        }, 100);
    }
});