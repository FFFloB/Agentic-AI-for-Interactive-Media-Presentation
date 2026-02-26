import type { CanvasElementConfig } from '$lib/types';

export const elements: CanvasElementConfig[] = [
  {
    id: 'title',
    x: 0,
    y: 0,
    scale: 1,
    width: 800,
    height: 500,
    component: 'TitleSlide',
    label: 'Title',
  },
  {
    id: 'intro',
    x: 1200,
    y: 300,
    scale: 0.9,
    width: 700,
    height: 450,
    component: 'IntroSlide',
    label: 'Introduction',
  },
  {
    id: 'demo',
    x: 2500,
    y: -150,
    scale: 1,
    width: 800,
    height: 600,
    component: 'DemoSlide',
    label: 'Interactive Demo',
  },
];
