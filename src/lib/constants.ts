export const DEFAULTS = {
  camera: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  animation: {
    duration: 1.5,
    ease: 'power2.inOut',
  },
  walkthrough: {
    pauseDuration: 3000,
  },
  zoom: {
    min: 0.2,
    max: 3,
  },
} as const;
