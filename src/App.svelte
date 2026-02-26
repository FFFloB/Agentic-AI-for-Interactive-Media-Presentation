<script lang="ts">
  import './app.css';
  import BackgroundCanvas from '$lib/background/BackgroundCanvas.svelte';
  import CameraViewport from '$lib/camera/CameraViewport.svelte';
  import CanvasLayer from '$lib/canvas/CanvasLayer.svelte';
  import FocusOverlay from '$lib/focus/FocusOverlay.svelte';
  import WalkthroughControls from '$lib/walkthrough/WalkthroughControls.svelte';
  import KeyboardHandler from '$lib/ui/KeyboardHandler.svelte';
  import { walkthrough } from '$lib/walkthrough/walkthrough.svelte';
  import { elements } from '$content/slides.config';
  import { walkthroughConfig } from '$content/walkthrough.config';

  $effect(() => {
    walkthrough.load(walkthroughConfig.steps);
  });
</script>

<BackgroundCanvas />

<CameraViewport>
  <CanvasLayer {elements} />
</CameraViewport>

<FocusOverlay />
<WalkthroughControls />
<KeyboardHandler />
