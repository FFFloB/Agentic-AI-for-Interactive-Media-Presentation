<script lang="ts">
  let { isFocused = false }: { isFocused?: boolean } = $props();
</script>

<div class="title-slide" class:focused={isFocused}>
  <h1>AI for Interactive Media</h1>
  <p class="subtitle">A spatial exploration</p>
  {#if isFocused}
    <p class="description">
      This presentation explores the intersection of artificial intelligence
      and interactive media — through a canvas that itself demonstrates the concept.
    </p>
  {/if}
</div>

<style>
  .title-slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 2rem;
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .focused h1 {
    font-size: 3.5rem;
  }

  .subtitle {
    margin-top: 0.75rem;
    font-size: 1.125rem;
    color: var(--color-text-muted);
    font-weight: 300;
  }

  .description {
    margin-top: 2rem;
    font-size: 1.125rem;
    color: var(--color-text-muted);
    max-width: 40rem;
    line-height: 1.7;
  }
</style>
