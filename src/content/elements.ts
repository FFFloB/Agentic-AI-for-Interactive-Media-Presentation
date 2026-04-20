import type { ComponentLoader } from '$lib/types';

export const componentRegistry: Record<string, ComponentLoader> = {
  SkillsSegment: () => import('./segments/skills/SkillsSegment.svelte'),
  AgenticChatSegment: () => import('./segments/chat/AgenticChatSegment.svelte'),
};
