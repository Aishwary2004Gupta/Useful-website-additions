import anime from 'https://esm.sh/animejs';

// Animate the transforms properties of .car along the motion path
const motionPath = anime({
  targets: '.car',
  translateX: anime.path('path'),
  translateY: anime.path('path'),
  rotate: anime.path('path'),
  easing: 'linear',
  duration: 5000,
  loop: true
});

// Line drawing animation
anime({
  targets: 'path',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'linear',
  duration: 5000,
  loop: true
});