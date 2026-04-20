<script lang="ts">
  import { walkthrough } from '$lib/walkthrough/walkthrough.svelte';

  function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'Enter':
        e.preventDefault();
        walkthrough.next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'Backspace':
        e.preventDefault();
        walkthrough.prev();
        break;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
