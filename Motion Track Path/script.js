import { animate, svg } from 'animejs';

// Animate the transforms properties of .car the motion path values
const carAnimation = animate('.car', {
  ease: 'linear',
  duration: 5000,
  loop: true,
  ...svg.createMotionPath('path')
});

// Line drawing animation following the motion path values
// For demo aesthetic only
animate(svg.createDrawable('path'), {
  draw: '0 1',
  ease: 'linear',
  duration: 5000,
  loop: true
});