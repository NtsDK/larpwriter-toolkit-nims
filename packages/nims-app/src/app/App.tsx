import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import { RootStoreProvider } from '@/stores/context';
import { AppShell } from './AppShell';
import { AppRoutes } from './routes';
import { theme } from './theme';
import '../i18n';

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      <RootStoreProvider>
        <BrowserRouter>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </BrowserRouter>
      </RootStoreProvider>
    </MantineProvider>
  );
}
