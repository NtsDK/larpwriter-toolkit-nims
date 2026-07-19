import {
  AppShell as MantineAppShell,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Button,
  useMantineColorScheme,
  NavLink,
} from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '@/stores';

const playerNav = [
  { path: '/', label: 'О вас', icon: '🧑' },
  { path: '/questionnaire', label: 'Анкета', icon: '📝' },
  { path: '/character', label: 'Персонаж', icon: '🎭' },
];

export const PlayerShell = observer(function PlayerShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { auth } = useRootStore();

  return (
    <MantineAppShell
      header={{ height: 52 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: false } }}
      padding={{ base: 'sm', md: 'md' }}
      styles={{
        main: {
          paddingBottom: 'calc(var(--mantine-spacing-md) + env(safe-area-inset-bottom, 0px))',
        },
      }}
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Text fw={700} size="lg">NIMS</Text>
            <Text size="sm" c="dimmed">Кабинет игрока</Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            {auth.user && (
              <Text size="sm" c="dimmed" visibleFrom="xs" truncate maw={140}>
                {auth.user.name}
              </Text>
            )}
            <Tooltip label={colorScheme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
              <ActionIcon variant="subtle" onClick={() => toggleColorScheme()} size="lg" aria-label="Тема">
                {colorScheme === 'dark' ? '☀' : '☾'}
              </ActionIcon>
            </Tooltip>
            <Button size="compact-sm" variant="default" onClick={() => void auth.logout()}>
              Выйти
            </Button>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="xs">
        {playerNav.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            leftSection={<span aria-hidden style={{ fontSize: 18 }}>{item.icon}</span>}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            styles={{
              root: { minHeight: 44, borderRadius: 8, marginBottom: 2 },
            }}
          />
        ))}
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
});
