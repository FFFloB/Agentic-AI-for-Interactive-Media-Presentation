import type { ComponentLoader } from '$lib/types';

export const componentRegistry: Record<string, ComponentLoader> = {
  TitleSlide: () => import('./slides/TitleSlide.svelte'),
  IntroSlide: () => import('./slides/IntroSlide.svelte'),
  DemoSlide: () => import('./slides/DemoSlide.svelte'),
};
