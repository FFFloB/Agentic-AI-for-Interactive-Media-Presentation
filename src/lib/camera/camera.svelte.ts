import gsap from 'gsap';
import type { CameraTarget, AnimationOptions } from '$lib/types';
import { DEFAULTS } from '$lib/constants';

class CameraState {
  x: number = $state(DEFAULTS.camera.x);
  y: number = $state(DEFAULTS.camera.y);
  zoom: number = $state(DEFAULTS.camera.zoom);

  viewportWidth = $state(window.innerWidth);
  viewportHeight = $state(window.innerHeight);

  private activeTween: gsap.core.Tween | null = null;

  get transform(): string {
    const tx = -this.x * this.zoom + this.viewportWidth / 2;
    const ty = -this.y * this.zoom + this.viewportHeight / 2;
    return `translate(${tx}px, ${ty}px) scale(${this.zoom})`;
  }

  updateViewport(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  animateTo(target: CameraTarget, options?: AnimationOptions): gsap.core.Tween {
    this.activeTween?.kill();

    const tween = gsap.to(this, {
      x: target.x,
      y: target.y,
      zoom: target.zoom,
      duration: options?.duration ?? DEFAULTS.animation.duration,
      ease: options?.ease ?? DEFAULTS.animation.ease,
    });

    this.activeTween = tween;
    return tween;
  }

  scrollTo(y: number, options?: AnimationOptions): gsap.core.Tween {
    this.activeTween?.kill();

    const tween = gsap.to(this, {
      y,
      duration: options?.duration ?? DEFAULTS.animation.duration,
      ease: options?.ease ?? DEFAULTS.animation.ease,
    });

    this.activeTween = tween;
    return tween;
  }

  jumpTo(target: CameraTarget) {
    this.activeTween?.kill();
    this.x = target.x;
    this.y = target.y;
    this.zoom = target.zoom;
  }

  pause() {
    this.activeTween?.pause();
  }

  resume() {
    this.activeTween?.resume();
  }
}

export const camera = new CameraState();
