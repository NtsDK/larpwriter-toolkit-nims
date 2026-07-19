import { type ReactNode } from 'react';
import { ScrollArea, Text, Stack } from '@mantine/core';
import { useIsMobile } from '@/hooks/useIsMobile';

/** Horizontal scroll wrapper for wide tables on mobile. */
export function HScroll({
  children,
  minWidth = 640,
  hint = true,
}: {
  children: ReactNode;
  minWidth?: number;
  hint?: boolean;
}) {
  const isMobile = useIsMobile();
  return (
    <Stack gap={4}>
      {hint && isMobile && (
        <Text size="xs" c="dimmed">Листайте таблицу →</Text>
      )}
      <ScrollArea type="scroll" offsetScrollbars>
        <div style={{ minWidth }}>{children}</div>
      </ScrollArea>
    </Stack>
  );
}
