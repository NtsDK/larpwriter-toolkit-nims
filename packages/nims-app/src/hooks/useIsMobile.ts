import { useMediaQuery } from '@mantine/hooks';

/** Below Mantine `md` (768px) — shared mobile breakpoint for shell + master-detail. */
export function useIsMobile(): boolean {
  return !!useMediaQuery('(max-width: 47.99em)');
}
