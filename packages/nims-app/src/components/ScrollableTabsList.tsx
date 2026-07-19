import { Tabs, type TabsListProps } from '@mantine/core';

const scrollStyle = {
  flexWrap: 'nowrap' as const,
  overflowX: 'auto' as const,
  WebkitOverflowScrolling: 'touch' as const,
};

/** Horizontally scrollable tab list for narrow viewports. */
export function ScrollableTabsList({ style, children, ...props }: TabsListProps) {
  const merged =
    style && typeof style === 'object' && !Array.isArray(style)
      ? { ...scrollStyle, ...style }
      : scrollStyle;
  return (
    <Tabs.List style={merged} {...props}>
      {children}
    </Tabs.List>
  );
}
