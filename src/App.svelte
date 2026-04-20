<script lang="ts">
  import './app.css';
  import BackgroundCanvas from '$lib/background/BackgroundCanvas.svelte';
  import CameraViewport from '$lib/camera/CameraViewport.svelte';
  import SegmentLayer from '$lib/segments/SegmentLayer.svelte';
  import WalkthroughControls from '$lib/walkthrough/WalkthroughControls.svelte';
  import KeyboardHandler from '$lib/ui/KeyboardHandler.svelte';
  import { segments } from '$lib/segments/segments.svelte';
  import { walkthrough } from '$lib/walkthrough/walkthrough.svelte';
  import { segmentConfigs } from '$content/segments.config';
  import { presentationConfig } from '$content/walkthrough.config';

  // One-time initialization: static configs; must NOT run inside $effect,
  // because walkthrough.load reads segments.placed which segments.load writes,
  // which would put the effect in a self-triggering loop.
  segments.load(segmentConfigs);
  walkthrough.load(presentationConfig.steps);
</script>

<BackgroundCanvas />

<CameraViewport>
  <SegmentLayer placed={segments.placed} />
</CameraViewport>

<WalkthroughControls />
<KeyboardHandler />
