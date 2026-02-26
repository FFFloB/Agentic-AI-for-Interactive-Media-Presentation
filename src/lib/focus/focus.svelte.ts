import gsap from 'gsap';

class FocusState {
  activeId = $state<string | null>(null);
  isTransitioning = $state(false);
  originRect = $state<{ x: number; y: number; width: number; height: number } | null>(null);

  get isFocused(): boolean {
    return this.activeId !== null && !this.isTransitioning;
  }

  focusOn(elementId: string, rect: DOMRect) {
    if (this.activeId || this.isTransitioning) return;

    this.originRect = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
    this.activeId = elementId;
    this.isTransitioning = true;

    // Animate overlay from origin rect to fullscreen
    // The FocusOverlay component reads these states and handles the animation
    gsap.delayedCall(0.01, () => {
      this.isTransitioning = false;
    });
  }

  unfocus() {
    if (!this.activeId) return;
    this.isTransitioning = true;

    gsap.delayedCall(0.3, () => {
      this.activeId = null;
      this.originRect = null;
      this.isTransitioning = false;
    });
  }
}

export const focusState = new FocusState();
