// Fixed 16:9 stage the whole presentation lives inside. The stage is CSS-scaled
// to fit any viewport (contain / letterbox), so world coordinates are stable
// regardless of window size or aspect ratio.
export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;

export const DEFAULTS = {
  camera: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  animation: {
    duration: 1.2,
    ease: 'power2.inOut',
  },
  segment: {
    baseWidth: 1920,
    baseHeight: 1080,
    gap: 480,
  },
  scroll: {
    // auto-scroll during staging
    stageScrollDuration: 0.6,
    stageScrollEase: 'power2.out',
    // free scroll (wheel)
    wheelSensitivity: 1,
  },
  zoom: {
    min: 0.15,
    max: 4,
  },
} as const;
