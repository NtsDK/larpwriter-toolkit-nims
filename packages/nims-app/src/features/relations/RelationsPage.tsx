import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Title, Stack, Button, Select, Group, Card, Text, TextInput,
  Badge, Anchor, SimpleGrid, UnstyledButton, Divider, SegmentedControl, Checkbox } from '@mantine/core';
import { Textarea } from '@/components/ResizableTextarea';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '@/stores';
import { EntityPageLayout } from '@/components/EntityPageLayout';
import { DeleteEntityButton } from '@/components/DeleteEntityButton';
import { EmptyState } from '@/components/EmptyState';
import { OwnerBadge } from '@/components/OwnerBadge';
import { PermissionHint } from '@/components/PermissionHint';
import { useEntityOwners } from '@/hooks/useEntityOwners';
import { useIsMobile } from '@/hooks/useIsMobile';

function CharacterLink({ name, fw, size = 'md' }: { name: string; fw?: number; size?: string }) {
  return (
    <Anchor component={Link} to={`/characters?select=${encodeURIComponent(name)}`} fw={fw} size={size as any}>
      {name}
    </Anchor>
  );
}

function formatProfileValue(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'да' : 'нет';
  if (Array.isArray(value)) return value.map(String).join(', ') || '—';
  const s = String(value).trim();
  return s || '—';
}

interface Relation {
  starter: string;
  ender: string;
  origin: string;
  starterTextReady: boolean;
  enderTextReady: boolean;
  essence: string[];
  [key: string]: unknown;
}

interface ProfileField {
  name: string;
}

type RelEssence = 'starterToEnder' | 'allies' | 'enderToStarter';

function RelationsPage() {
  const { t } = useTranslation();
  const { api, permissions } = useRootStore();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const [charNames, setCharNames] = useState<string[]>([]);
  const { owners } = useEntityOwners('character', charNames.length);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [selectedChar, setSelectedChar] = useState<string | null>(searchParams.get('select'));
  const [selectedPartner, setSelectedPartner] = useState<string | null>(searchParams.get('partner'));
  const [addKnown, setAddKnown] = useState<string | null>(null);
  const [addUnknown, setAddUnknown] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [loading, setLoading] = useState(true);

  /** characterName → storyName → true (shared event presence) */
  const [knownCharacters, setKnownCharacters] = useState<Record<string, Record<string, boolean>>>({});
  const [profileStructure, setProfileStructure] = useState<ProfileField[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Record<string, unknown>>>({});
  const [bindings, setBindings] = useState<Record<string, string>>({});
  const [dossierField, setDossierField] = useState<string | null>(null);

  const load = async () => {
    const data = await api.get<Relation[]>('getRelations');
    setRelations(Array.isArray(data) ? data : []);
  };

  const loadChars = async () => {
    const data = await api.get<string[]>('getProfileNamesArray', { type: 'character' });
    setCharNames(Array.isArray(data) ? data : []);
  };

  const loadStatic = async () => {
    const [structure, allProfiles, binds] = await Promise.all([
      api.get<ProfileField[]>('getProfileStructure', { type: 'character' }),
      api.get<Record<string, Record<string, unknown>>>('getAllProfiles', { type: 'character' }),
      api.get<Record<string, string>>('getProfileBindings').catch(() => ({})),
    ]);
    const fields = Array.isArray(structure) ? structure : [];
    setProfileStructure(fields);
    setProfiles(allProfiles && typeof allProfiles === 'object' ? allProfiles : {});
    setBindings(binds && typeof binds === 'object' ? binds : {});
    setDossierField((prev) => prev || fields[0]?.name || null);
  };

  const loadSummary = async (characterName: string) => {
    try {
      const summary = await api.get<{
        knownCharacters: Record<string, Record<string, boolean>>;
      }>('getRelationsSummary', { characterName });
      setKnownCharacters(summary?.knownCharacters || {});
    } catch {
      setKnownCharacters({});
    }
  };

  useEffect(() => {
    Promise.all([load(), loadChars(), loadStatic()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get('select');
    if (fromUrl) setSelectedChar(fromUrl);
    const partner = searchParams.get('partner');
    if (partner) setSelectedPartner(partner);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedChar) {
      setKnownCharacters({});
      return;
    }
    void loadSummary(selectedChar);
  }, [selectedChar]);

  const charRelations = useMemo(
    () => (selectedChar
      ? relations.filter((r) => r.starter === selectedChar || r.ender === selectedChar)
      : []),
    [relations, selectedChar],
  );

  const getOther = (rel: Relation) => (rel.starter === selectedChar ? rel.ender : rel.starter);

  const existingPartners = useMemo(
    () => charRelations.map(getOther),
    [charRelations, selectedChar],
  );

  const { knownCandidates, unknownCandidates } = useMemo(() => {
    if (!selectedChar) return { knownCandidates: [] as string[], unknownCandidates: [] as string[] };
    const knownSet = new Set(Object.keys(knownCharacters));
    const free = charNames.filter((n) => n !== selectedChar && !existingPartners.includes(n));
    return {
      knownCandidates: free.filter((n) => knownSet.has(n)).sort((a, b) => a.localeCompare(b)),
      unknownCandidates: free.filter((n) => !knownSet.has(n)).sort((a, b) => a.localeCompare(b)) };
  }, [selectedChar, charNames, existingPartners, knownCharacters]);

  const partners = useMemo(() => {
    const list = charRelations.map((rel) => {
      const other = getOther(rel);
      const isStarter = rel.starter === selectedChar;
      const myReady = isStarter ? rel.starterTextReady : rel.enderTextReady;
      const theirReady = isStarter ? rel.enderTextReady : rel.starterTextReady;
      const myText = String(rel[selectedChar!] || '').trim();
      const theirText = String(rel[other] || '').trim();
      const sharedStories = Object.keys(knownCharacters[other] || {}).sort((a, b) => a.localeCompare(b));
      return {
        other,
        rel,
        myReady,
        theirReady,
        unfinished: (!myReady && !!myText) || (!theirReady && !!theirText) || (!myText && !theirText),
        empty: !myText && !theirText && !(rel.origin || '').trim(),
        sharedStories };
    }).sort((a, b) => a.other.localeCompare(b.other));

    if (!partnerFilter.trim()) return list;
    const q = partnerFilter.toLowerCase();
    return list.filter((p) => p.other.toLowerCase().includes(q));
  }, [charRelations, selectedChar, partnerFilter, knownCharacters]);

  // Keep partner selection valid when character/list changes.
  // Desktop: auto-focus first partner (3-column layout).
  // Mobile: stay on the partners list until the user picks one.
  useEffect(() => {
    if (!selectedChar) {
      setSelectedPartner(null);
      return;
    }
    const names = charRelations.map(getOther);
    if (selectedPartner && names.includes(selectedPartner)) return;
    setSelectedPartner(isMobile ? null : (names[0] || null));
  }, [selectedChar, relations, isMobile]);

  const active = partners.find((p) => p.other === selectedPartner) || null;
  const activeRel = active?.rel || null;

  const createWith = async (partner: string | null) => {
    if (!selectedChar || !partner || selectedChar === partner) return;
    try {
      await api.call('createCharacterRelation', { fromCharacter: selectedChar, toCharacter: partner });
      setAddKnown(null);
      setAddUnknown(null);
      setSelectedPartner(partner);
      await load();
      await loadSummary(selectedChar);
      notifications.show({ title: 'Добавлено', message: `${selectedChar} ↔ ${partner}`, color: 'green' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleRemove = async (rel: Relation) => {
    try {
      await api.call('removeCharacterRelation', { fromCharacter: rel.starter, toCharacter: rel.ender });
      const other = getOther(rel);
      if (selectedPartner === other) setSelectedPartner(null);
      await load();
      if (selectedChar) await loadSummary(selectedChar);
      notifications.show({ title: 'Удалено', message: `${rel.starter} ↔ ${rel.ender}`, color: 'gray' });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const canEditSelected = selectedChar
    ? permissions.canEditEntity(owners[selectedChar])
    : false;
  const editBlockedReason = selectedChar
    ? permissions.contentEditBlockedReason(owners[selectedChar])
    : null;

  const handleTextSave = async (rel: Relation, character: string, text: string) => {
    try {
      await api.call('setCharacterRelationText', {
        fromCharacter: rel.starter, toCharacter: rel.ender, character, text });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleOriginSave = async (rel: Relation, text: string) => {
    try {
      await api.call('setRelationOrigin', { fromCharacter: rel.starter, toCharacter: rel.ender, text });
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleEssenceToggle = async (rel: Relation, absoluteKey: RelEssence) => {
    const current = Array.isArray(rel.essence) ? [...rel.essence] : [];
    const next = current.includes(absoluteKey)
      ? current.filter((e) => e !== absoluteKey)
      : [...current, absoluteKey];
    try {
      await api.call('setRelationEssence', {
        fromCharacter: rel.starter, toCharacter: rel.ender, essence: next });
      await load();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const handleReadyToggle = async (rel: Relation, character: string, ready: boolean) => {
    try {
      await api.call('setRelationReadyStatus', {
        fromCharacter: rel.starter, toCharacter: rel.ender, character, ready });
      await load();
    } catch (e: any) {
      notifications.show({ title: 'Ошибка', message: e.message, color: 'red' });
    }
  };

  const badgeCounts: Record<string, number> = {};
  for (const name of charNames) {
    const c = relations.filter((r) => r.starter === name || r.ender === name).length;
    if (c > 0) badgeCounts[name] = c;
  }

  const relativeEssence = (rel: Relation) => {
    const isStarter = rel.starter === selectedChar;
    return {
      toOther: (isStarter ? 'starterToEnder' : 'enderToStarter') as RelEssence,
      allies: 'allies' as RelEssence,
      fromOther: (isStarter ? 'enderToStarter' : 'starterToEnder') as RelEssence };
  };

  const partnerPlayer = selectedPartner ? (bindings[selectedPartner] || '') : '';
  const partnerProfileValue = selectedPartner && dossierField
    ? formatProfileValue(profiles[selectedPartner]?.[dossierField])
    : '—';
  const dossierOptions = profileStructure
    .map((f) => f.name)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name }));

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>{t('relations.title')}</Title>
        <Text size="sm" c="dimmed" mt={4}>
          {isMobile
            ? 'Персонаж → партнёр → редактор пары.'
            : 'Слева — персонаж. В центре — с кем есть связь. Справа — редактор одной пары.'}
        </Text>
      </div>

      {charNames.length === 0 ? (
        <EmptyState
          title="Нет персонажей"
          description="Сначала создайте персонажей — отношения строятся между ними."
        />
      ) : (
        <EntityPageLayout
          loading={loading}
          selected={selectedChar}
          onMobileBack={() => {
            setSelectedChar(null);
            setSelectedPartner(null);
            setPartnerFilter('');
            setAddKnown(null);
            setAddUnknown(null);
          }}
          emptySelectTitle="Выберите персонажа"
          emptySelectDescription="Слева — персонажи. Дальше выберите партнёра и правьте одну связь."
          sidebar={{
            items: charNames,
            selected: selectedChar,
            onSelect: (name) => {
              setSelectedChar(name);
              setSelectedPartner(null);
              setPartnerFilter('');
              setAddKnown(null);
              setAddUnknown(null);
            },
            filter,
            onFilterChange: setFilter,
            badgeCounts,
            owners }}
        >
          {selectedChar && (
            <Stack gap="md" key={selectedChar}>
              <Group gap="sm">
                <Text size="sm" c="dimmed">Владелец:</Text>
                <OwnerBadge owner={owners[selectedChar]} />
              </Group>
              <PermissionHint reason={editBlockedReason} />

              {isMobile && selectedPartner && (
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => setSelectedPartner(null)}
                    styles={{ root: { minHeight: 44 } }}
                  >
                    ← К партнёрам
                  </Button>
                  <Text size="sm" c="dimmed">
                    <Text span fw={600}>{selectedChar}</Text>
                    {' › '}
                    <Text span fw={600}>{selectedPartner}</Text>
                  </Text>
                </Group>
              )}

              {/* Add controls + dossier — hide on mobile when editing a pair */}
              {(!isMobile || !selectedPartner) && (
              <Card withBorder padding="sm">
                <Stack gap="sm">
                  <Group align="flex-end" grow preventGrowOverflow={false} wrap="wrap">
                    <Select
                      size="xs"
                      label="Известные по историям"
                      description="Уже пересекались в событиях"
                      placeholder={knownCandidates.length ? 'Выберите…' : 'Нет кандидатов'}
                      data={knownCandidates}
                      value={addKnown}
                      onChange={setAddKnown}
                      searchable
                      clearable
                      disabled={knownCandidates.length === 0}
                      nothingFoundMessage="Пусто"
                      style={{ minWidth: 200, flex: 1 }}
                    />
                    <Button
                      size="xs"
                      onClick={() => createWith(addKnown)}
                      disabled={!addKnown || !canEditSelected}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      Добавить
                    </Button>
                  </Group>
                  <Group align="flex-end" grow preventGrowOverflow={false} wrap="wrap">
                    <Select
                      size="xs"
                      label="Неизвестные по историям"
                      description="Нет общих событий — связь «с нуля»"
                      placeholder={unknownCandidates.length ? 'Выберите…' : 'Нет кандидатов'}
                      data={unknownCandidates}
                      value={addUnknown}
                      onChange={setAddUnknown}
                      searchable
                      clearable
                      disabled={unknownCandidates.length === 0}
                      nothingFoundMessage="Пусто"
                      style={{ minWidth: 200, flex: 1 }}
                    />
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => createWith(addUnknown)}
                      disabled={!addUnknown || !canEditSelected}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      Добавить
                    </Button>
                  </Group>
                  <Select
                    size="xs"
                    label="Поле досье"
                    description="Какое поле партнёра показывать рядом со связью"
                    data={dossierOptions}
                    value={dossierField}
                    onChange={setDossierField}
                    searchable
                    disabled={dossierOptions.length === 0}
                    style={{ maxWidth: 320 }}
                  />
                </Stack>
              </Card>
              )}

              <Group align="start" wrap={isMobile ? 'wrap' : 'nowrap'} gap="md">
                {/* Partner list */}
                {(!isMobile || !selectedPartner) && (
                <Card
                  withBorder
                  padding="sm"
                  style={{
                    width: isMobile ? '100%' : 220,
                    minWidth: isMobile ? 0 : 180,
                    maxWidth: isMobile ? 'none' : 280,
                    flexShrink: 0,
                    alignSelf: 'stretch',
                    resize: isMobile ? undefined : 'horizontal',
                    overflow: 'auto' }}
                >
                  <Stack gap="sm">
                    <div>
                      <Text size="sm" fw={600}>Партнёры</Text>
                      <Text size="xs" c="dimmed"><CharacterLink name={selectedChar} size="xs" /></Text>
                    </div>

                    {charRelations.length > 6 && (
                      <TextInput
                        size="xs"
                        placeholder="Фильтр партнёров…"
                        value={partnerFilter}
                        onChange={(e) => setPartnerFilter(e.currentTarget.value)}
                      />
                    )}

                    <Divider />

                    <Stack gap={4}>
                      {partners.map((p) => {
                        const activeItem = selectedPartner === p.other;
                        const player = bindings[p.other];
                        return (
                          <UnstyledButton
                            key={p.other}
                            onClick={() => setSelectedPartner(p.other)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--mantine-color-default-border)',
                              background: activeItem ? 'var(--mantine-color-blue-light)' : undefined,
                              textAlign: 'left' }}
                          >
                            <Group justify="space-between" wrap="nowrap" gap={6} align="flex-start">
                              <div style={{ minWidth: 0 }}>
                                <Text size="md" fw={activeItem ? 600 : 400} style={{ whiteSpace: 'normal' }}>
                                  {p.other}
                                  {player ? ` / ${player}` : ''}
                                </Text>
                                {p.sharedStories.length > 0 && (
                                  <Text size="xs" c="dimmed" lineClamp={1}>
                                    {p.sharedStories.join(', ')}
                                  </Text>
                                )}
                              </div>
                              <Badge
                                size="xs"
                                color={p.myReady && p.theirReady ? 'green' : p.empty ? 'gray' : 'orange'}
                                variant="light"
                              >
                                {p.myReady && p.theirReady ? '✓' : p.empty ? '○' : '…'}
                              </Badge>
                            </Group>
                          </UnstyledButton>
                        );
                      })}
                      {partners.length === 0 && (
                        <Text size="xs" c="dimmed">Нет связей — добавьте партнёра выше.</Text>
                      )}
                    </Stack>
                  </Stack>
                </Card>
                )}

                {/* Focused editor */}
                {(!isMobile || !!selectedPartner) && (
                <Stack gap="md" style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : undefined }}>
                  {!activeRel || !selectedPartner ? (
                    <EmptyState
                      title="Выберите партнёра"
                      description="Слева список связей выбранного персонажа. Кликните имя — откроется редактор."
                    />
                  ) : (
                    <>
                      <Group justify="space-between" align="flex-start">
                        <div>
                          <Title order={4}>
                            <CharacterLink name={selectedChar} />
                            {' ↔ '}
                            <CharacterLink name={selectedPartner} />
                            {partnerPlayer ? (
                              <Text span size="sm" c="dimmed" fw={400}>
                                {` / ${partnerPlayer}`}
                              </Text>
                            ) : null}
                          </Title>
                          <Text size="xs" c="dimmed" mt={4}>
                            Редактируется одна пара. Сохранение текстов — при уходе с поля.
                          </Text>
                        </div>
                      </Group>

                      <Card withBorder padding="sm">
                        <Stack gap={6}>
                          <div>
                            <Text size="xs" c="dimmed">Где встречались</Text>
                            <Text size="sm">
                              {(active.sharedStories.length
                                ? active.sharedStories.join(', ')
                                : 'Нет общих событий в историях')}
                            </Text>
                          </div>
                          {dossierField && (
                            <div>
                              <Text size="xs" c="dimmed">{dossierField}</Text>
                              <Text size="sm">{partnerProfileValue}</Text>
                            </div>
                          )}
                        </Stack>
                      </Card>

                      <Card withBorder padding="md">
                        <Text size="md" fw={600} mb={4}>Характер связи</Text>
                        <Text size="sm" c="dimmed" mb="sm">
                          Флаги направления. Можно отметить несколько.
                        </Text>
                        {(() => {
                          const keys = relativeEssence(activeRel);
                          const essence = activeRel.essence || [];
                          const options: Array<{ key: RelEssence; label: string }> = [
                            {
                              key: keys.toOther,
                              label: `Активное отношение «${selectedChar}» к «${selectedPartner}»` },
                            {
                              key: keys.allies,
                              label: 'Союзники' },
                            {
                              key: keys.fromOther,
                              label: `Активное отношение «${selectedPartner}» к «${selectedChar}»` },
                          ];
                          return (
                            <Stack gap="sm">
                              {options.map((opt) => (
                                <Checkbox
                                  key={opt.key}
                                  size="md"
                                  checked={essence.includes(opt.key)}
                                  onChange={() => handleEssenceToggle(activeRel, opt.key)}
                                  label={opt.label}
                                  styles={{
                                    label: { fontSize: '1rem', lineHeight: 1.45 },
                                  }}
                                />
                              ))}
                            </Stack>
                          );
                        })()}
                      </Card>

                      <Textarea key={`${activeRel.starter}-${activeRel.ender}-origin`}
                        label="Суть отношений (общий текст для обоих)"
                        description="Видно мастерам; не путать с личными текстами вводных"
                        defaultValue={activeRel.origin || ''}
                        rows={4}
                        readOnly={!canEditSelected}
                        styles={{
                          label: { fontSize: '1rem' },
                          description: { fontSize: '0.9rem' },
                          input: { fontSize: '1.1rem', lineHeight: 1.55 },
                        }}
                        onBlur={(e) => handleOriginSave(activeRel, e.currentTarget.value)}
                      />

                      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                        <Card withBorder padding="sm">
                          <Stack gap="xs" mb="xs">
                            <Text size="md" fw={600}>
                              От <CharacterLink name={selectedChar} size="md" />
                            </Text>
                            <SegmentedControl
                              size="md"
                              fullWidth={isMobile}
                              value={active.myReady ? 'ready' : 'draft'}
                              onChange={(v) => handleReadyToggle(activeRel, selectedChar, v === 'ready')}
                              color={active.myReady ? 'green' : undefined}
                              disabled={!canEditSelected}
                              data={[
                                { value: 'draft', label: 'Черновик' },
                                { value: 'ready', label: 'Готово' },
                              ]}
                            />
                          </Stack>
                          <Textarea key={`${activeRel.starter}-${activeRel.ender}-my-${selectedChar}`}
                            placeholder={`Отношение ${selectedChar} к ${selectedPartner}…`}
                            defaultValue={String(activeRel[selectedChar] || '')}
                            rows={isMobile ? 12 : 8}
                            readOnly={!canEditSelected}
                            styles={{ input: { fontSize: '1.1rem', lineHeight: 1.55 } }}
                            onBlur={(e) => handleTextSave(activeRel, selectedChar, e.currentTarget.value)}
                          />
                        </Card>

                        <Card withBorder padding="sm">
                          <Stack gap="xs" mb="xs">
                            <Text size="md" fw={600}>
                              От <CharacterLink name={selectedPartner} size="md" />
                            </Text>
                            <SegmentedControl
                              size="md"
                              fullWidth={isMobile}
                              value={active.theirReady ? 'ready' : 'draft'}
                              onChange={(v) => handleReadyToggle(activeRel, selectedPartner, v === 'ready')}
                              color={active.theirReady ? 'green' : undefined}
                              disabled={!canEditSelected}
                              data={[
                                { value: 'draft', label: 'Черновик' },
                                { value: 'ready', label: 'Готово' },
                              ]}
                            />
                          </Stack>
                          <Textarea key={`${activeRel.starter}-${activeRel.ender}-their-${selectedPartner}`}
                            placeholder={`Отношение ${selectedPartner} к ${selectedChar}…`}
                            defaultValue={String(activeRel[selectedPartner] || '')}
                            rows={isMobile ? 12 : 8}
                            readOnly={!canEditSelected}
                            styles={{ input: { fontSize: '1.1rem', lineHeight: 1.55 } }}
                            onBlur={(e) => handleTextSave(activeRel, selectedPartner, e.currentTarget.value)}
                          />
                        </Card>
                      </SimpleGrid>

                      <DeleteEntityButton
                        entityLabel="отношение"
                        entityName={`${activeRel.starter} ↔ ${activeRel.ender}`}
                        onConfirm={() => handleRemove(activeRel)}
                        disabled={!canEditSelected}
                      />
                    </>
                  )}
                </Stack>
                )}
              </Group>
            </Stack>
          )}
        </EntityPageLayout>
      )}
    </Stack>
  );
}

export default observer(RelationsPage);
