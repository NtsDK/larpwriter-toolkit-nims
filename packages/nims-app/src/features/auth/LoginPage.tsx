import { useEffect, useState } from 'react';
import {
  Paper, Stack, Title, TextInput, PasswordInput, Button, Alert, Center, Tabs, Text,
} from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '@/stores';

export const LoginPage = observer(function LoginPage() {
  const { auth } = useRootStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [allowSignup, setAllowSignup] = useState(false);

  useEffect(() => {
    fetch('/signup-status', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setAllowSignup(!!d.allowPlayerCreation))
      .catch(() => setAllowSignup(false));
  }, []);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Введите логин и пароль');
      return;
    }
    const ok = await auth.login(username.trim(), password);
    if (!ok) {
      setError(auth.lastError || 'Неверный логин или пароль');
    }
  };

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Введите логин и пароль');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    const ok = await auth.signUp(username.trim(), password, confirmPassword);
    if (!ok) {
      setError(auth.lastError || 'Не удалось зарегистрироваться');
    }
  };

  return (
    <Center mih="100vh" p="md" style={{ background: 'var(--mantine-color-body)' }}>
      <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={400}>
        <Stack gap="md">
          <Title order={2}>NIMS</Title>

          {allowSignup ? (
            <Tabs value={mode} onChange={(v) => { setMode((v as 'login' | 'signup') || 'login'); setError(null); }}>
              <Tabs.List grow>
                <Tabs.Tab value="login">Вход</Tabs.Tab>
                <Tabs.Tab value="signup">Регистрация</Tabs.Tab>
              </Tabs.List>
            </Tabs>
          ) : null}

          {error && (
            <Alert color="red" title={mode === 'signup' ? 'Ошибка регистрации' : 'Ошибка входа'}>
              {error}
            </Alert>
          )}

          {mode === 'login' || !allowSignup ? (
            <form onSubmit={submitLogin}>
              <Stack gap="md">
                <TextInput
                  label="Логин"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  autoComplete="username"
                  autoFocus
                  required
                />
                <PasswordInput
                  label="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  autoComplete="current-password"
                  required
                />
                <Button type="submit" loading={auth.loading} fullWidth>
                  Войти
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={submitSignup}>
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  Создаётся учётная запись, профиль и анкета. Организатор может позже связать вас
                  с уже заведённым профилем.
                </Text>
                <TextInput
                  label="Логин"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  autoComplete="username"
                  autoFocus
                  required
                />
                <PasswordInput
                  label="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  autoComplete="new-password"
                  required
                />
                <PasswordInput
                  label="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  autoComplete="new-password"
                  required
                />
                <Button type="submit" loading={auth.loading} fullWidth>
                  Зарегистрироваться
                </Button>
              </Stack>
            </form>
          )}
        </Stack>
      </Paper>
    </Center>
  );
});
