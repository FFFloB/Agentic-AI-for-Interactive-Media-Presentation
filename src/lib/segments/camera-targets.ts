import type { CameraTarget, PlacedSegment, ZoomTarget } from '$lib/types';
import { camera } from '$lib/camera/camera.svelte';

export function cameraTargetForSegment(segment: PlacedSegment): CameraTarget {
  const zoom = camera.viewportWidth / segment.width;
  return {
    x: segment.xOffset + segment.width / 2,
    y: camera.viewportHeight / (2 * zoom),
    zoom,
  };
}

export function cameraTargetForZoom(
  segment: PlacedSegment,
  target: ZoomTarget,
): CameraTarget {
  const zx = camera.viewportWidth / target.width;
  const zy = camera.viewportHeight / target.height;
  const zoom = Math.min(zx, zy);
  return {
    x: segment.xOffset + target.xOffset + target.width / 2,
    y: target.yOffset + target.height / 2,
    zoom,
  };
}

export function cameraTargetForContextZoom(
  from: PlacedSegment,
  to: PlacedSegment,
): CameraTarget {
  const leftX = from.xOffset;
  const rightX = to.xOffset + to.width;
  const spanWidth = rightX - leftX;
  const maxHeight = Math.max(from.height, to.height);
  const zx = camera.viewportWidth / spanWidth;
  const zy = camera.viewportHeight / maxHeight;
  const zoom = Math.min(zx, zy) * 0.9;
  return {
    x: (leftX + rightX) / 2,
    y: maxHeight / 2,
    zoom,
  };
}

// Scroll-only: keeps current zoom and x, animates only camera.y so the target
// sits at ~40% from the top of the viewport (feels more balanced than dead center).
export function scrollYForTarget(
  segment: PlacedSegment,
  target: ZoomTarget,
  anchor: number = 0.4,
): number {
  const vpWorldHeight = camera.viewportHeight / camera.zoom;
  const targetCenterY = target.yOffset + target.height / 2;
  const desired = targetCenterY + vpWorldHeight * (0.5 - anchor);
  const minY = vpWorldHeight / 2;
  const maxY = Math.max(minY, segment.height - vpWorldHeight / 2);
  return Math.max(minY, Math.min(maxY, desired));
}
