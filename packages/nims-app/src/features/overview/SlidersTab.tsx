import { useEffect, useState } from 'react';
import {
  Stack, Group, Button, Text, Card, Modal, TextInput, Select, ActionIcon, Anchor,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRootStore } from '@/stores';
import { useIsMobile } from '@/hooks/useIsMobile';
import { VerticalFader } from './VerticalFader';

interface SliderItem {
  name: string;
  top: string;
  bottom: string;
  value: number;
}

export function SlidersTab() {
  const { api } = useRootStore();
  const isMobile = useIsMobile();
  const [items, setItems] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpen, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [moveOpen, { open: openMove, close: closeMove }] = useDisclosure(false);
  const [form, setForm] = useState({ name: '', top: '', bottom: '' });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [moveIndex, setMoveIndex] = useState<number | null>(null);
  const [movePos, setMovePos] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api.get<SliderItem[]>('getSliderData');
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message || 'Не удалось загрузить бегунки', color: 'red' });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const create = async () => {
    try {
      await api.call('createSlider', {
        name: form.name.trim(),
        top: form.top.trim() || 'Верх',
        bottom: form.bottom.trim() || 'Низ',
      });
      setForm({ name: '', top: '', bottom: '' });
      closeCreate();
      await load();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const saveEdit = async () => {
    if (editIndex == null) return;
    try {
      await api.call('updateSliderNaming', {
        index: editIndex,
        name: form.name.trim(),
        top: form.top.trim() || 'Верх',
        bottom: form.bottom.trim() || 'Низ',
      });
      closeEdit();
      await load();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const doMove = async () => {
    if (moveIndex == null || movePos == null) return;
    try {
      await api.call('moveSlider', { index: moveIndex, pos: Number(movePos) });
      closeMove();
      await load();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const remove = async (index: number, name: string) => {
    if (!window.confirm(`Удалить бегунок «${name}»?`)) return;
    try {
      await api.call('removeSlider', { index });
      await load();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const saveValue = async (index: number, value: number) => {
    try {
      await api.call('updateSliderValue', { index, value });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
      await load();
    }
  };

  const moveOptions = [
    ...items.map((s, i) => ({ value: String(i), label: `Перед «${s.name}»` })),
    { value: String(items.length), label: 'В конец' },
  ];

  const faderH = isMobile ? 180 : 160;

  const cards = items.map((sl, i) => (
    <Card
      key={`${sl.name}-${i}`}
      withBorder
      padding="sm"
      style={{ width: isMobile ? 160 : 148, minHeight: 300, flexShrink: 0 }}
    >
      <Stack gap="xs" h="100%" justify="space-between" align="stretch">
        <div>
          <Text size="xs" ta="center" fw={600} lineClamp={3}>{sl.name}</Text>
          <Text size="xs" c="dimmed" ta="center" mt={4} lineClamp={2}>{sl.top}</Text>
        </div>

        <VerticalFader
          value={Number.isFinite(sl.value) ? sl.value : 0}
          height={faderH}
          onChange={(v) => {
            setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, value: v } : item)));
          }}
          onChangeEnd={(v) => { void saveValue(i, v); }}
        />

        <div>
          <Text size="xs" c="dimmed" ta="center" lineClamp={2}>{sl.bottom}</Text>
          <Group justify="center" gap={4} mt={6}>
            <ActionIcon
              size={isMobile ? 'md' : 'sm'}
              variant="subtle"
              title="Переместить"
              onClick={() => { setMoveIndex(i); setMovePos(null); openMove(); }}
            >
              ↕
            </ActionIcon>
            <ActionIcon
              size={isMobile ? 'md' : 'sm'}
              variant="subtle"
              title="Редактировать"
              onClick={() => {
                setEditIndex(i);
                setForm({ name: sl.name, top: sl.top, bottom: sl.bottom });
                openEdit();
              }}
            >
              ✎
            </ActionIcon>
            <ActionIcon
              size={isMobile ? 'md' : 'sm'}
              variant="subtle"
              color="red"
              title="Удалить"
              onClick={() => remove(i, sl.name)}
            >
              ✕
            </ActionIcon>
          </Group>
        </div>
      </Stack>
    </Card>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed">
            Микшерный пульт ролевой игры (The Mixing Desk of Larp) — оси дизайна от −10 до +10.
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            <Anchor href="https://nordiclarp.org/2016/11/13/the-mixing-desk-of-larp/" target="_blank" size="xs">
              Stenros et al. — история и теория
            </Anchor>
          </Text>
        </div>
        <Button size="xs" onClick={() => { setForm({ name: '', top: '', bottom: '' }); openCreate(); }}>
          Создать бегунок
        </Button>
      </Group>

      {loading ? (
        <Text c="dimmed">Загрузка…</Text>
      ) : items.length === 0 ? (
        <Text c="dimmed">Нет бегунков</Text>
      ) : (
        <div
          style={{
            overflowX: isMobile ? 'auto' : undefined,
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 8,
          }}
        >
          <Group
            align="stretch"
            gap="md"
            wrap={isMobile ? 'nowrap' : 'wrap'}
            style={isMobile ? { width: 'max-content' } : undefined}
          >
            {cards}
          </Group>
        </div>
      )}

      <Modal opened={createOpen} onClose={closeCreate} title="Создать бегунок">
        <Stack>
          <TextInput label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} />
          <TextInput label="Верхнее значение" value={form.top} onChange={(e) => setForm({ ...form, top: e.currentTarget.value })} placeholder="Верх" />
          <TextInput label="Нижнее значение" value={form.bottom} onChange={(e) => setForm({ ...form, bottom: e.currentTarget.value })} placeholder="Низ" />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeCreate}>Отмена</Button>
            <Button onClick={create} disabled={!form.name.trim()}>Создать</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={editOpen} onClose={closeEdit} title="Редактировать бегунок">
        <Stack>
          <TextInput label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.currentTarget.value })} />
          <TextInput label="Верхнее значение" value={form.top} onChange={(e) => setForm({ ...form, top: e.currentTarget.value })} />
          <TextInput label="Нижнее значение" value={form.bottom} onChange={(e) => setForm({ ...form, bottom: e.currentTarget.value })} />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeEdit}>Отмена</Button>
            <Button onClick={saveEdit}>Сохранить</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={moveOpen} onClose={closeMove} title="Переместить бегунок">
        <Stack>
          <Select label="Новая позиция" data={moveOptions} value={movePos} onChange={setMovePos} />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeMove}>Отмена</Button>
            <Button onClick={doMove} disabled={movePos == null}>Переместить</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
