import { animate, utils, stagger, text } from "https://esm.sh/animejs";
// import { animate, utils, stagger, text } from 'animejs';

// Dark mode functionality
const darkModeToggle = document.querySelector('.dark-mode-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved user preference, if any, on load of the website
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (currentTheme === 'dark') {
    darkModeToggle.checked = true;
  }
} else if (prefersDarkScheme.matches) {
  document.documentElement.setAttribute('data-theme', 'dark');
  darkModeToggle.checked = true;
}

// Listen for toggle
darkModeToggle.addEventListener('change', function(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
});

const colors = [];

text.split('p', {
  lines: true,
})
/* Registering an animation to the split */
.addEffect(({ lines }) => animate(lines, {
  y: ['50%', '-50%'],
  loop: true,
  alternate: true,
  delay: stagger(400),
  ease: 'inOutQuad',
}))
/* Registering a callback to the split */
.addEffect(split => {
  split.words.forEach(($el, i) => {
    const color = colors[i];
    if (color) utils.set($el, { color });
    $el.addEventListener('pointerenter', () => {
      animate($el, {
        color: utils.randomPick(['#FF4B4B', '#FFCC2A', '#B7FF54', '#57F695']),
        duration: 250,
      })
    });
  });
  return () => {
    /* Called between each split */
    split.words.forEach((w, i) => colors[i] = utils.get(w, 'color'));
  }
});