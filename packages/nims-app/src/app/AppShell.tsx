import { useState } from 'react';
import {
  AppShell as MantineAppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Text,
  ActionIcon,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navItems = [
  { path: '/', labelKey: 'nav.overview', icon: '📋' },
  { path: '/characters', labelKey: 'nav.characters', icon: '👤' },
  { path: '/stories', labelKey: 'nav.stories', icon: '📖' },
  { path: '/groups', labelKey: 'nav.groups', icon: '👥' },
  { path: '/relations', labelKey: 'nav.relations', icon: '🔗' },
  { path: '/adaptations', labelKey: 'nav.adaptations', icon: '✍️' },
  { path: '/briefings', labelKey: 'nav.briefings', icon: '📄' },
  { path: '/timeline', labelKey: 'nav.timeline', icon: '⏱️' },
  { path: '/network', labelKey: 'nav.network', icon: '🕸️' },
  { path: '/search', labelKey: 'nav.search', icon: '🔍' },
  { path: '/admin', labelKey: 'nav.admin', icon: '⚙️' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toggleColorScheme } = useMantineColorScheme();

  return (
    <MantineAppShell
      header={{ height: 50 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg">NIMS</Text>
          </Group>
          <ActionIcon variant="subtle" onClick={toggleColorScheme} size="lg">
            🌓
          </ActionIcon>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="xs">
        <ScrollArea>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              label={t(item.labelKey)}
              leftSection={item.icon}
              active={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                toggle();
              }}
            />
          ))}
        </ScrollArea>
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
