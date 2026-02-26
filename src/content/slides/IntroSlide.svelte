<script lang="ts">
  let { isFocused = false }: { isFocused?: boolean } = $props();
</script>

<div class="intro-slide" class:focused={isFocused}>
  <h2>What We'll Cover</h2>
  <ul>
    <li>Generative art and procedural content</li>
    <li>AI-driven interaction patterns</li>
    <li>Real-time visualisation techniques</li>
  </ul>
  {#if isFocused}
    <p class="detail">
      Click through each section to explore interactive demonstrations
      that bring these concepts to life.
    </p>
  {/if}
</div>

<style>
  .intro-slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2rem;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 1.5rem;
  }

  .focused h2 {
    font-size: 2.5rem;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  li {
    font-size: 1rem;
    color: var(--color-text-muted);
    padding-left: 1.25rem;
    position: relative;
  }

  li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.5em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-accent);
  }

  .detail {
    margin-top: 2rem;
    color: var(--color-text-muted);
    line-height: 1.7;
    max-width: 36rem;
  }
</style>
