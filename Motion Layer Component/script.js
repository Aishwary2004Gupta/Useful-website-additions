const layers = document.querySelectorAll('.layer');

window.addEventListener('scroll', () => {
  let scrollTop = window.scrollY;

  layers.forEach(layer => {
    const speed = layer.getAttribute('data-speed');
    const y = scrollTop * speed * 0.5;
    layer.style.transform = `translateY(${y}px)`;

    // Add a subtle scale and opacity effect
    const opacity = Math.max(0.1, 1 - scrollTop / 1000);
    const scale = 1 + scrollTop / 5000;
    layer.querySelector('h1').style.opacity = opacity;
    layer.querySelector('h1').style.transform = `scale(${scale})`;
  });
});
