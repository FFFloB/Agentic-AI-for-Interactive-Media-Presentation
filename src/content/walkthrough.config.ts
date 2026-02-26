import type { WalkthroughConfig } from '$lib/types';

export const walkthroughConfig: WalkthroughConfig = {
  name: 'Main Presentation',
  steps: [
    {
      id: 'step-title',
      targetElementId: 'title',
      x: 400,
      y: 250,
      zoom: 1,
      duration: 0,
      pauseDuration: 3000,
      label: 'Title',
    },
    {
      id: 'step-intro',
      targetElementId: 'intro',
      x: 1515,
      y: 502,
      zoom: 1.1,
      duration: 2,
      ease: 'power3.inOut',
      pauseDuration: 5000,
      label: 'Introduction',
    },
    {
      id: 'step-demo',
      targetElementId: 'demo',
      x: 2900,
      y: 150,
      zoom: 0.9,
      duration: 2.5,
      ease: 'power2.inOut',
      label: 'Demo',
    },
  ],
};
