// Presentation mode. Switches scenario / exemplar content across segments
// without touching structure or visuals.
//
// Today there are two audiences:
//   - 'design'    - designers, UX, interaction / visual work. The default
//                   audience (MA Digital Design at York).
//   - 'technical' - developers, engineers.
//
// The mode is read from the URL query param `?mode=technical` on load.
// Content modules subscribe to `mode.current` and derive the right variant.

export type Mode = 'technical' | 'design';

function parseModeFromUrl(): Mode {
  if (typeof window === 'undefined') return 'design';
  const params = new URLSearchParams(window.location.search);
  const m = params.get('mode');
  return m === 'technical' ? 'technical' : 'design';
}

class ModeState {
  current = $state<Mode>(parseModeFromUrl());

  setMode(m: Mode) {
    this.current = m;
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (m === 'design') {
      url.searchParams.delete('mode');
    } else {
      url.searchParams.set('mode', m);
    }
    window.history.replaceState(null, '', url.toString());
  }
}

export const mode = new ModeState();
