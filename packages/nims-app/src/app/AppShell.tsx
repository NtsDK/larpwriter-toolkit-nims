import { useEffect, useMemo } from 'react';
import {
  AppShell as MantineAppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Text,
  ActionIcon,
  Tooltip,
  Button,
  Alert,
  Divider,
  Stack,
} from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { McpTokenModal } from '@/features/mcp/McpTokenModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRootStore } from '@/stores';

type NavItem =
  | { path: string; labelKey: string; icon: string }
  | { action: 'mcp'; labelKey: string; icon: string };

const navItems: NavItem[] = [
  { path: '/', labelKey: 'nav.overview', icon: '📋' },
  { path: '/characters', labelKey: 'nav.characters', icon: '👤' },
  { path: '/players', labelKey: 'nav.players', icon: '🎮' },
  { path: '/stories', labelKey: 'nav.stories', icon: '📖' },
  { path: '/groups', labelKey: 'nav.groups', icon: '👥' },
  { path: '/relations', labelKey: 'nav.relations', icon: '🔗' },
  { path: '/adaptations', labelKey: 'nav.adaptations', icon: '✍️' },
  { path: '/briefings', labelKey: 'nav.briefings', icon: '📄' },
  { path: '/timeline', labelKey: 'nav.timeline', icon: '⏱️' },
  { path: '/network', labelKey: 'nav.network', icon: '🕸️' },
  { path: '/role-grid', labelKey: 'nav.roleGrid', icon: '▦' },
  { path: '/profile-filter', labelKey: 'nav.profileFilter', icon: '🧰' },
  { path: '/search', labelKey: 'nav.search', icon: '🔍' },
  { action: 'mcp', labelKey: 'nav.mcp', icon: '🔌' },
  { path: '/admin', labelKey: 'nav.admin', icon: '⚙️' },
];

export const AppShell = observer(function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [mcpOpened, { open: openMcp, close: closeMcp }] = useDisclosure();
  const [collapsed, setCollapsed] = useLocalStorage({ key: 'nims-nav-collapsed', defaultValue: false });
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { auth, permissions } = useRootStore();

  const navWidth = collapsed ? 64 : 220;

  const pageTitle = useMemo(() => {
    const item = navItems.find((n) => 'path' in n && n.path === location.pathname);
    return item ? t(item.labelKey) : 'NIMS';
  }, [location.pathname, t]);

  useEffect(() => { closeMobile(); }, [location.pathname]);

  const go = (path: string) => {
    navigate(path);
    closeMobile();
  };

  const onNav = (item: NavItem) => {
    if ('action' in item && item.action === 'mcp') {
      openMcp();
      closeMobile();
      return;
    }
    if ('path' in item) go(item.path);
  };

  return (
    <MantineAppShell
      header={{ height: 52 }}
      navbar={{ width: navWidth, breakpoint: 'md', collapsed: { mobile: !mobileOpened } }}
      padding={{ base: 'sm', md: 'md' }}
      transitionDuration={200}
      styles={{
        navbar: {
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        },
        main: {
          paddingBottom: 'calc(var(--mantine-spacing-md) + env(safe-area-inset-bottom, 0px))',
        },
      }}
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="md"
              size="sm"
              aria-label="Меню"
            />
            <Tooltip label={collapsed ? 'Развернуть меню' : 'Свернуть меню'} position="bottom">
              <ActionIcon
                variant="default"
                onClick={() => setCollapsed(!collapsed)}
                size="lg"
                visibleFrom="md"
                aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
              >
                <Text size="sm" fw={600} style={{ lineHeight: 1 }}>
                  {collapsed ? '»' : '«'}
                </Text>
              </ActionIcon>
            </Tooltip>
            <Text fw={700} size="lg" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => go('/')}>
              NIMS
            </Text>
            <Text size="sm" c="dimmed" truncate hiddenFrom="md" style={{ minWidth: 0 }}>
              {pageTitle}
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            {auth.user && (
              <Text size="sm" c="dimmed" visibleFrom="md" truncate maw={140}>
                {auth.user.name}
              </Text>
            )}
            <ThemeToggle compact />
            <Button
              size="compact-sm"
              variant="default"
              visibleFrom="md"
              onClick={() => void auth.logout()}
            >
              Выйти
            </Button>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="xs">
        <MantineAppShell.Section grow component={ScrollArea} type="scroll" offsetScrollbars>
          {navItems.map((item) => {
            const key = 'path' in item ? item.path : item.action;
            const active = 'path' in item && location.pathname === item.path;
            if (collapsed) {
              return (
                <Tooltip key={key} label={t(item.labelKey)} position="right" withArrow>
                  <ActionIcon
                    variant={active ? 'filled' : 'subtle'}
                    size={44}
                    onClick={() => onNav(item)}
                    aria-label={t(item.labelKey)}
                    style={{ width: '100%', marginBottom: 4, minHeight: 44 }}
                  >
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                  </ActionIcon>
                </Tooltip>
              );
            }
            return (
              <NavLink
                key={key}
                label={t(item.labelKey)}
                leftSection={<span aria-hidden style={{ fontSize: 18 }}>{item.icon}</span>}
                active={active}
                onClick={() => onNav(item)}
                styles={{
                  root: { minHeight: 44, borderRadius: 8, marginBottom: 2 },
                  label: { fontSize: 'var(--mantine-font-size-sm)' },
                }}
              />
            );
          })}
        </MantineAppShell.Section>
        <MantineAppShell.Section hiddenFrom="md" mt="xs">
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
        {permissions.loadError && (
          <Alert color="orange" mb="sm" title="Права доступа не загружены">
            {permissions.loadError}. Режим редактора и владельцы могут отображаться неверно.
          </Alert>
        )}
        {children}
      </MantineAppShell.Main>

      <McpTokenModal opened={mcpOpened} onClose={closeMcp} />
    </MantineAppShell>
  );
});
