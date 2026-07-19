import { useEffect } from 'react';
import { MantineProvider, Center, Loader } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { RootStoreProvider, useRootStore } from '@/stores/context';
import { AppShell } from './AppShell';
import { AppRoutes } from './routes';
import { PlayerShell } from '@/features/player/PlayerShell';
import { PlayerRoutes } from '@/features/player/PlayerRoutes';
import { LoginPage } from '@/features/auth/LoginPage';
import { theme, cssVariablesResolver } from './theme';
import '../i18n';

const AuthedApp = observer(function AuthedApp() {
  const { auth } = useRootStore();

  useEffect(() => {
    void auth.bootstrap();
  }, [auth]);

  if (auth.bootstrapping) {
    return (
      <Center mih="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!auth.isLoggedIn) {
    return <LoginPage />;
  }

  const isPlayer = auth.user?.role === 'player';

  return (
    <BrowserRouter>
      {isPlayer ? (
        <PlayerShell>
          <PlayerRoutes />
        </PlayerShell>
      ) : (
        <AppShell>
          <AppRoutes />
        </AppShell>
      )}
    </BrowserRouter>
  );
});

export function App() {
  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="auto"
    >
      <Notifications position="top-right" />
      <RootStoreProvider>
        <AuthedApp />
      </RootStoreProvider>
    </MantineProvider>
  );
}
