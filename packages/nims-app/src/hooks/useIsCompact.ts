import { useMediaQuery } from '@mantine/hooks';

/**
 * Phone + compact laptop: below ~1200px.
 * Use for master-detail drill-down and auto-collapsed nav.
 * For phone-only UI (burger breakpoint, full-width list), use `useIsMobile`.
 */
export function useIsCompact(): boolean {
  return !!useMediaQuery('(max-width: 74.99em)');
}
