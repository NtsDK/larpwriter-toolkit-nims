import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import {
  Title, Stack, Group, Button, Card, Text, Select, TextInput, NumberInput,
  Checkbox, MultiSelect, Table, Badge, Anchor, Loader, Center, Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import { HScroll } from '@/components/HScroll';
import { ScrollableTabsList } from '@/components/ScrollableTabsList';
import { useIsMobile } from '@/hooks/useIsMobile';

interface FilterItemMeta {
  name: string;
  type: string;
  displayName: string;
  value?: string;
}

interface GroupedItems {
  name: string;
  profileFilterItems: FilterItemMeta[];
}

interface ProfileFilterInfo {
  groupedProfileFilterItems: GroupedItems[];
}

interface FilterCondition {
  name: string;
  type: string;
  selectedOptions?: Record<string, boolean>;
  condition?: string;
  num?: number;
  regexString?: string;
}

interface FilterRow {
  profileId: [string, string];
  cells: Record<string, unknown>;
}

const GROUP_LABELS: Record<string, string> = {
  characterFilterItems: 'Досье персонажа',
  playerFilterItems: 'Досье игрока',
  summaryFilterItems: 'Статистика',
};

function ProfileFilterPage() {
  const { t } = useTranslation();
  const { api } = useRootStore();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<ProfileFilterInfo | null>(null);
  const [groupNames, setGroupNames] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [filterModel, setFilterModel] = useState<FilterCondition[]>([]);
  const [visibleCols, setVisibleCols] = useState<string[]>(['char-name', 'player-name', 'summary-completeness', 'summary-totalStories']);
  const [rows, setRows] = useState<FilterRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [addField, setAddField] = useState<string | null>(null);

  const allItems = useMemo(
    () => (info?.groupedProfileFilterItems || []).flatMap((g) => g.profileFilterItems),
    [info],
  );
  const itemByName = useMemo(
    () => Object.fromEntries(allItems.map((i) => [i.name, i])),
    [allItems],
  );

  const loadInfo = async () => {
    setLoading(true);
    try {
      const [filterInfo, groups] = await Promise.all([
        api.get<ProfileFilterInfo>('getProfileFilterInfo'),
        api.get<string[]>('getGroupNamesArray'),
      ]);
      setInfo(filterInfo);
      setGroupNames(Array.isArray(groups) ? groups : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInfo(); }, []);

  const runFilter = async (model: FilterCondition[] = filterModel) => {
    setBusy(true);
    try {
      const data = await api.get<FilterRow[]>('applyProfileFilter', { filterModel: model });
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (info) runFilter([]);
  }, [info]);

  const upsertCondition = (cond: FilterCondition) => {
    setFilterModel((prev) => {
      const next = prev.filter((c) => c.name !== cond.name);
      next.push(cond);
      return next;
    });
  };

  const removeCondition = (name: string) => {
    setFilterModel((prev) => prev.filter((c) => c.name !== name));
  };

  const applyAndRun = async () => {
    await runFilter(filterModel);
  };

  const loadFromGroup = async () => {
    if (!selectedGroup) return;
    try {
      const group = await api.get<{ filterModel?: FilterCondition[] }>('getGroup', { groupName: selectedGroup });
      const model = Array.isArray(group?.filterModel) ? group.filterModel as FilterCondition[] : [];
      setFilterModel(model);
      await runFilter(model);
      notifications.show({ title: 'Загружено', message: `Фильтр группы «${selectedGroup}»`, color: 'green' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const saveToGroup = async () => {
    if (!selectedGroup) {
      notifications.show({ title: 'Группа', message: 'Выберите группу', color: 'yellow' });
      return;
    }
    try {
      await api.call('saveFilterToGroup', { groupName: selectedGroup, filterModel });
      notifications.show({ title: 'Сохранено', message: `Фильтр записан в «${selectedGroup}»`, color: 'green' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const downloadCsv = () => {
    const cols = visibleCols.filter((c) => itemByName[c]);
    const header = cols.map((c) => itemByName[c].displayName);
    const lines = [header.join(';')];
    for (const row of rows) {
      lines.push(cols.map((c) => {
        const v = row.cells[c];
        const s = v == null ? '' : String(v).replace(/;/g, ',').replace(/\n/g, ' ');
        return s;
      }).join(';'));
    }
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `profile-filter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const addConditionFromField = (fieldName: string | null) => {
    if (!fieldName) return;
    const meta = itemByName[fieldName];
    if (!meta) return;
    if (filterModel.some((c) => c.name === fieldName)) {
      setAddField(null);
      return;
    }
    let cond: FilterCondition;
    if (meta.type === 'enum' || meta.type === 'checkbox') {
      const opts = meta.type === 'checkbox'
        ? ['true', 'false']
        : (meta.value || '').split(',').map((s) => s.trim()).filter(Boolean);
      cond = {
        name: meta.name,
        type: meta.type === 'checkbox' ? 'checkbox' : 'enum',
        selectedOptions: Object.fromEntries(opts.map((o) => [o, true])),
      };
    } else if (meta.type === 'number') {
      cond = { name: meta.name, type: 'number', condition: 'greater', num: 0 };
    } else if (meta.type === 'multiEnum') {
      const opts = (meta.value || '').split(',').map((s) => s.trim()).filter(Boolean);
      cond = {
        name: meta.name,
        type: 'multiEnum',
        condition: 'some',
        selectedOptions: Object.fromEntries(opts.map((o) => [o, true])),
      };
    } else {
      cond = { name: meta.name, type: meta.type === 'text' ? 'text' : 'string', regexString: '' };
    }
    upsertCondition(cond);
    setAddField(null);
  };

  if (loading) return <Center h={200}><Loader /></Center>;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>{t('profileFilter.title')}</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Фильтр по досье персонажа/игрока и статистике. Можно сохранить в группу.
          </Text>
        </div>
        <Group>
          <Select
            size="sm"
            placeholder="Группа"
            data={groupNames}
            value={selectedGroup}
            onChange={setSelectedGroup}
            searchable
            clearable
            w={180}
          />
          <Button size="sm" variant="light" onClick={loadFromGroup} disabled={!selectedGroup}>Загрузить</Button>
          <Button size="sm" variant="light" onClick={saveToGroup} disabled={!selectedGroup}>Сохранить в группу</Button>
          <Button size="sm" variant="default" onClick={downloadCsv} disabled={rows.length === 0}>CSV</Button>
          <Button size="sm" onClick={applyAndRun} loading={busy}>Применить</Button>
        </Group>
      </Group>

      <Group align="start" wrap={isMobile ? 'wrap' : 'nowrap'} gap="md">
        <Card withBorder padding="sm" style={{ width: isMobile ? '100%' : 340, flexShrink: 0 }}>
          <Tabs defaultValue="rows">
            <ScrollableTabsList>
              <Tabs.Tab value="rows">Строки</Tabs.Tab>
              <Tabs.Tab value="columns">Колонки</Tabs.Tab>
            </ScrollableTabsList>

            <Tabs.Panel value="rows" pt="sm">
              <Stack gap="sm">
                <Select
                  size="xs"
                  label="Добавить условие"
                  placeholder="Поле..."
                  data={(info?.groupedProfileFilterItems || []).flatMap((g) =>
                    g.profileFilterItems
                      .filter((i) => !filterModel.some((c) => c.name === i.name))
                      .map((i) => ({
                        value: i.name,
                        label: `${GROUP_LABELS[g.name] || g.name}: ${i.displayName}`,
                      })),
                  )}
                  value={addField}
                  onChange={addConditionFromField}
                  searchable
                  clearable
                />

                {filterModel.length === 0 && (
                  <Text size="xs" c="dimmed">Без условий — все строки (привязки персонаж↔игрок).</Text>
                )}

                {filterModel.map((cond) => {
                  const meta = itemByName[cond.name];
                  if (!meta) return null;
                  return (
                    <Card key={cond.name} withBorder padding="xs">
                      <Group justify="space-between" mb={6}>
                        <Text size="xs" fw={600}>{meta.displayName}</Text>
                        <Button size="compact-xs" variant="subtle" color="red" onClick={() => removeCondition(cond.name)}>✕</Button>
                      </Group>

                      {(cond.type === 'string' || cond.type === 'text') && (
                        <TextInput
                          size="xs"
                          placeholder="Содержит..."
                          value={cond.regexString || ''}
                          onChange={(e) => upsertCondition({ ...cond, regexString: e.currentTarget.value })}
                        />
                      )}

                      {(cond.type === 'enum' || cond.type === 'checkbox') && (
                        <Checkbox.Group
                          value={Object.keys(cond.selectedOptions || {}).filter((k) => cond.selectedOptions?.[k])}
                          onChange={(vals) => {
                            const all = cond.type === 'checkbox'
                              ? ['true', 'false']
                              : (meta.value || '').split(',').map((s) => s.trim()).filter(Boolean);
                            upsertCondition({
                              ...cond,
                              selectedOptions: Object.fromEntries(all.map((o) => [o, vals.includes(o)])),
                            });
                          }}
                        >
                          <Stack gap={4}>
                            {(cond.type === 'checkbox'
                              ? [{ v: 'true', l: 'Да' }, { v: 'false', l: 'Нет' }]
                              : (meta.value || '').split(',').map((s) => s.trim()).filter(Boolean).map((v) => ({ v, l: v }))
                            ).map(({ v, l }) => (
                              <Checkbox key={v} size="xs" value={v} label={l} />
                            ))}
                          </Stack>
                        </Checkbox.Group>
                      )}

                      {cond.type === 'number' && (
                        <Group grow>
                          <Select
                            size="xs"
                            data={[
                              { value: 'greater', label: 'Больше' },
                              { value: 'equal', label: 'Равно' },
                              { value: 'lesser', label: 'Меньше' },
                            ]}
                            value={cond.condition || 'greater'}
                            onChange={(v) => upsertCondition({ ...cond, condition: v || 'greater' })}
                            allowDeselect={false}
                          />
                          <NumberInput
                            size="xs"
                            value={cond.num ?? 0}
                            onChange={(v) => upsertCondition({ ...cond, num: Number(v) || 0 })}
                          />
                        </Group>
                      )}

                      {cond.type === 'multiEnum' && (
                        <Stack gap={6}>
                          <Select
                            size="xs"
                            data={[
                              { value: 'some', label: 'Включает любой' },
                              { value: 'every', label: 'Включает все' },
                              { value: 'equal', label: 'Точное совпадение' },
                            ]}
                            value={cond.condition || 'some'}
                            onChange={(v) => upsertCondition({ ...cond, condition: v || 'some' })}
                            allowDeselect={false}
                          />
                          <MultiSelect
                            size="xs"
                            data={(meta.value || '').split(',').map((s) => s.trim()).filter(Boolean)}
                            value={Object.keys(cond.selectedOptions || {}).filter((k) => cond.selectedOptions?.[k])}
                            onChange={(vals) => {
                              const all = (meta.value || '').split(',').map((s) => s.trim()).filter(Boolean);
                              upsertCondition({
                                ...cond,
                                selectedOptions: Object.fromEntries(all.map((o) => [o, vals.includes(o)])),
                              });
                            }}
                          />
                        </Stack>
                      )}
                    </Card>
                  );
                })}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="columns" pt="sm">
              <Stack gap="xs">
                {(info?.groupedProfileFilterItems || []).map((g) => (
                  <Stack key={g.name} gap={4}>
                    <Text size="xs" fw={600} c="dimmed">{GROUP_LABELS[g.name] || g.name}</Text>
                    {g.profileFilterItems.map((item) => (
                      <Checkbox
                        key={item.name}
                        size="xs"
                        label={item.displayName}
                        checked={visibleCols.includes(item.name)}
                        onChange={(e) => {
                          const on = e.currentTarget.checked;
                          setVisibleCols((prev) => (on
                            ? [...prev, item.name]
                            : prev.filter((n) => n !== item.name)));
                        }}
                      />
                    ))}
                  </Stack>
                ))}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>

        <Card withBorder padding="sm" style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : undefined }}>
          <Group justify="space-between" mb="sm">
            <Text size="sm" fw={600}>Результат</Text>
            <Badge variant="light">{rows.length} строк</Badge>
          </Group>
          <HScroll minWidth={600}>
            <Table striped withTableBorder stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  {visibleCols.filter((c) => itemByName[c]).map((c) => (
                    <Table.Th key={c}>{itemByName[c].displayName}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row, idx) => (
                  <Table.Tr key={`${row.profileId[0]}-${row.profileId[1]}-${idx}`}>
                    {visibleCols.filter((c) => itemByName[c]).map((c) => {
                      const v = row.cells[c];
                      if (c === 'char-name' && row.profileId[0]) {
                        return (
                          <Table.Td key={c}>
                            <Anchor component={Link} to={`/characters?select=${encodeURIComponent(row.profileId[0])}`} size="sm">
                              {String(v || row.profileId[0])}
                            </Anchor>
                          </Table.Td>
                        );
                      }
                      if (c === 'player-name' && row.profileId[1]) {
                        return (
                          <Table.Td key={c}>
                            <Anchor component={Link} to={`/players?select=${encodeURIComponent(row.profileId[1])}`} size="sm">
                              {String(v || row.profileId[1])}
                            </Anchor>
                          </Table.Td>
                        );
                      }
                      return (
                        <Table.Td key={c}>
                          <Text size="sm">{v == null || v === '' ? '—' : String(v)}</Text>
                        </Table.Td>
                      );
                    })}
                  </Table.Tr>
                ))}
                {rows.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={Math.max(visibleCols.length, 1)}>
                      <Text size="sm" c="dimmed">Нет строк — измените условия и нажмите «Применить»</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </HScroll>
        </Card>
      </Group>
    </Stack>
  );
}

export default observer(ProfileFilterPage);
