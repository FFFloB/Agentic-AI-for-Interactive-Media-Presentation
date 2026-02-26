<script lang="ts">
  import { walkthrough } from '$lib/walkthrough/walkthrough.svelte';
  import { focusState } from '$lib/focus/focus.svelte';

  function handleKeydown(e: KeyboardEvent) {
    // Don't intercept when focused on interactive content
    if (focusState.isFocused) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        walkthrough.next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        walkthrough.prev();
        break;
      case ' ':
        e.preventDefault();
        if (walkthrough.isPlaying) {
          walkthrough.pause();
        } else {
          walkthrough.play();
        }
        break;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
