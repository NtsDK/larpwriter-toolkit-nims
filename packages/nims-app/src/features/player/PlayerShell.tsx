import { useEffect, useState } from 'react';
import {
  AppShell as MantineAppShell,
  Group,
  Text,
  Button,
  NavLink,
  Burger,
  Divider,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRootStore } from '@/stores';

const playerNav = [
  { path: '/', label: 'О вас', icon: '🧑', always: true },
  { path: '/questionnaire', label: 'Анкета', icon: '📝', always: true },
  { path: '/character', label: 'Персонаж', icon: '🎭', always: false },
] as const;

export const PlayerShell = observer(function PlayerShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, api } = useRootStore();
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [hasCharacter, setHasCharacter] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get<{ character?: { name: string } }>('getPlayerProfileInfo')
      .then((info) => {
        if (!cancelled) setHasCharacter(!!info?.character);
      })
      .catch(() => {
        if (!cancelled) setHasCharacter(false);
      });
    return () => { cancelled = true; };
  }, [api, location.pathname]);

  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  const go = (path: string) => {
    navigate(path);
    closeMobile();
  };

  return (
    <MantineAppShell
      header={{ height: 52 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }}
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
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" aria-label="Меню" />
            <Text fw={700} size="lg">NIMS</Text>
            <Text size="sm" c="dimmed" visibleFrom="xs">Кабинет игрока</Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            {auth.user && (
              <Text size="sm" c="dimmed" visibleFrom="sm" truncate maw={140}>
                {auth.user.name}
              </Text>
            )}
            <ThemeToggle compact />
            <Button
              size="compact-sm"
              variant="default"
              visibleFrom="sm"
              onClick={() => void auth.logout()}
            >
              Выйти
            </Button>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="xs">
        <MantineAppShell.Section grow>
          {playerNav.map((item) => {
            const disabled = !item.always && !hasCharacter;
            return (
              <NavLink
                key={item.path}
                label={item.label}
                leftSection={<span aria-hidden style={{ fontSize: 18 }}>{item.icon}</span>}
                active={location.pathname === item.path}
                disabled={disabled}
                onClick={() => { if (!disabled) go(item.path); }}
                styles={{
                  root: { minHeight: 44, borderRadius: 8, marginBottom: 2 },
                }}
              />
            );
          })}
        </MantineAppShell.Section>
        <MantineAppShell.Section hiddenFrom="sm" mt="xs">
          <Divider mb="sm" />
          <Stack gap="xs">
            {auth.user && (
              <Text size="sm" c="dimmed" truncate>
                {auth.user.name}
              </Text>
            )}
            <Button
              fullWidth
              variant="default"
              styles={{ root: { minHeight: 44 } }}
              onClick={() => void auth.logout()}
            >
              Выйти
            </Button>
          </Stack>
        </MantineAppShell.Section>
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
});
