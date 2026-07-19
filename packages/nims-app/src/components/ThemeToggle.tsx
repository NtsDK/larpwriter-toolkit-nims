import { Button, useMantineColorScheme } from '@mantine/core';

/** Explicit light/dark toggle — label shows the theme you switch TO. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Button
      size={compact ? 'compact-sm' : 'sm'}
      variant="default"
      onClick={() => toggleColorScheme()}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      leftSection={<span aria-hidden>{isDark ? '☀' : '☾'}</span>}
    >
      {isDark ? 'Светлая' : 'Тёмная'}
    </Button>
  );
}
