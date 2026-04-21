import type { ComponentLoader } from '$lib/types';

export const componentRegistry: Record<string, ComponentLoader> = {
  TitleSegment: () => import('./segments/title/TitleSegment.svelte'),
  SkillsSegment: () => import('./segments/skills/SkillsSegment.svelte'),
  LLMPredictionSegment: () => import('./segments/llm-prediction/LLMPredictionSegment.svelte'),
  AgenticChatSegment: () => import('./segments/chat/AgenticChatSegment.svelte'),
  ContextSegment: () => import('./segments/context/ContextSegment.svelte'),
  TokensSegment: () => import('./segments/tokens/TokensSegment.svelte'),
  ContextEngineeringSegment: () =>
    import('./segments/context-engineering/ContextEngineeringSegment.svelte'),
  GranularitySegment: () =>
    import('./segments/granularity/GranularitySegment.svelte'),
  UsesDesignSegment: () =>
    import('./segments/uses-design/UsesDesignSegment.svelte'),
  UsesTechnicalSegment: () =>
    import('./segments/uses-technical/UsesTechnicalSegment.svelte'),
  CareOverviewSegment: () =>
    import('./segments/care-overview/CareOverviewSegment.svelte'),
  CareTrainingSegment: () =>
    import('./segments/care-training/CareTrainingSegment.svelte'),
  CareOwnershipSegment: () =>
    import('./segments/care-ownership/CareOwnershipSegment.svelte'),
  CareAttributionSegment: () =>
    import('./segments/care-attribution/CareAttributionSegment.svelte'),
  CareAuditSegment: () =>
    import('./segments/care-audit/CareAuditSegment.svelte'),
  CareNumbersSegment: () =>
    import('./segments/care-numbers/CareNumbersSegment.svelte'),
  CareFootprintSegment: () =>
    import('./segments/care-footprint/CareFootprintSegment.svelte'),
  CareContextSegment: () =>
    import('./segments/care-context/CareContextSegment.svelte'),
  CareWrongSegment: () =>
    import('./segments/care-wrong/CareWrongSegment.svelte'),
  CareAgreementSegment: () =>
    import('./segments/care-agreement/CareAgreementSegment.svelte'),
};
