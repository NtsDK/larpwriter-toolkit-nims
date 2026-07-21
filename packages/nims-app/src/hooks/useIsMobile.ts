import { useMediaQuery } from '@mantine/hooks';

/** Below Mantine `md` (768px) — phone UI (burger nav, touch-first layouts). */
export function useIsMobile(): boolean {
  return !!useMediaQuery('(max-width: 47.99em)');
}
