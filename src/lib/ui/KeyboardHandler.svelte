<script lang="ts">
  import { walkthrough } from '$lib/walkthrough/walkthrough.svelte';

  function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      // Within-segment progression
      case 'ArrowDown':
      case ' ':
      case 'Enter':
      case 'PageDown':
        e.preventDefault();
        walkthrough.stepNext();
        break;
      case 'ArrowUp':
      case 'Backspace':
      case 'PageUp':
        e.preventDefault();
        walkthrough.stepPrev();
        break;

      // Cross-segment navigation
      case 'ArrowRight':
        e.preventDefault();
        walkthrough.switchNext();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        walkthrough.switchPrev();
        break;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
