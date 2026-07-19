import { type ReactNode } from 'react';
import { Group, Card, Loader, Center, Button, Stack } from '@mantine/core';
import { EntitySidebar, type EntitySidebarProps } from './EntitySidebar';
import { EmptyState } from './EmptyState';
import { useIsMobile } from '@/hooks/useIsMobile';

interface EntityPageLayoutProps {
  sidebar: EntitySidebarProps;
  loading?: boolean;
  selected: string | null;
  emptySelectTitle?: string;
  emptySelectDescription?: string;
  /** Clear selection on mobile «back to list» */
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
  const isMobile = useIsMobile();
  const showList = !isMobile || !selected;
  const showDetail = !isMobile || !!selected;

  const detailCard = (
    <Card
      shadow="sm"
      padding="md"
      withBorder
      style={{
        flex: 1,
        alignSelf: 'stretch',
        overflowY: isMobile ? undefined : 'auto',
        maxHeight: isMobile ? undefined : 'calc(100vh - 140px)',
        minWidth: 0,
        width: isMobile ? '100%' : undefined,
      }}
    >
      {isMobile && selected && onMobileBack && (
        <Button
          variant="subtle"
          size="sm"
          mb="sm"
          onClick={onMobileBack}
          styles={{ root: { minHeight: 44, justifySelf: 'flex-start' } }}
        >
          ← К списку
        </Button>
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

  if (isMobile) {
    return (
      <Stack gap="md" style={{ minHeight: '60vh' }}>
        {showList && (
          <EntitySidebar
            {...sidebar}
            fullWidth
            // On mobile list-only mode, don't keep selection highlight forcing detail
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
