import { type ReactNode } from 'react';
import { Group, Card, Loader, Center, Button, Stack, Badge } from '@mantine/core';
import { EntitySidebar, type EntitySidebarProps } from './EntitySidebar';
import { EmptyState } from './EmptyState';
import { useIsCompact } from '@/hooks/useIsCompact';

interface EntityPageLayoutProps {
  sidebar: EntitySidebarProps;
  loading?: boolean;
  selected: string | null;
  emptySelectTitle?: string;
  emptySelectDescription?: string;
  /** Clear selection on compact «back to list» */
  onMobileBack?: () => void;
  children: ReactNode;
}

export function EntityPageLayout({
  sidebar,
  loading,
  selected,
  emptySelectTitle = 'Выберите элемент из списка слева',
  emptySelectDescription,
  onMobileBack,
  children,
}: EntityPageLayoutProps) {
  const isCompact = useIsCompact();
  const showList = !isCompact || !selected;
  const showDetail = !isCompact || !!selected;

  const detailCard = (
    <Card
      shadow="sm"
      padding="md"
      withBorder
      style={{
        flex: 1,
        alignSelf: 'stretch',
        overflowY: isCompact ? undefined : 'auto',
        maxHeight: isCompact ? undefined : 'calc(100vh - 140px)',
        minWidth: 0,
        width: isCompact ? '100%' : undefined,
      }}
    >
      {isCompact && selected && onMobileBack && (
        <Group gap="sm" mb="sm" wrap="nowrap" align="center">
          <Button
            variant="subtle"
            size="sm"
            onClick={onMobileBack}
            styles={{ root: { minHeight: 44, flexShrink: 0 } }}
          >
            ← К списку
          </Button>
          <Badge
            size="lg"
            variant="light"
            style={{
              textTransform: 'none',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {selected}
          </Badge>
        </Group>
      )}
      {loading ? (
        <Center h={200}><Loader size="md" /></Center>
      ) : selected ? (
        children
      ) : (
        <EmptyState title={emptySelectTitle} description={emptySelectDescription} />
      )}
    </Card>
  );

  if (isCompact) {
    return (
      <Stack gap="md" style={{ minHeight: '60vh' }}>
        {showList && (
          <EntitySidebar
            {...sidebar}
            fullWidth
          />
        )}
        {showDetail && detailCard}
      </Stack>
    );
  }

  return (
    <Group align="start" wrap="nowrap" gap="md" style={{ minHeight: '70vh' }}>
      <EntitySidebar {...sidebar} />
      {detailCard}
    </Group>
  );
}
