import { useCallback, useRef } from 'react';
import { Box, Text } from '@mantine/core';

/** Mixing-desk style vertical fader: top = max, bottom = min. */
export function VerticalFader({
  value,
  min = -10,
  max = 10,
  height = 160,
  disabled,
  onChange,
  onChangeEnd,
}: {
  value: number;
  min?: number;
  max?: number;
  height?: number;
  disabled?: boolean;
  onChange: (v: number) => void;
  onChangeEnd?: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef(value);
  lastRef.current = value;

  const valueFromClientY = useCallback((clientY: number) => {
    const el = trackRef.current;
    if (!el) return lastRef.current;
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) return lastRef.current;
    // 0 at top → max, 1 at bottom → min
    const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const raw = max - ratio * (max - min);
    return Math.round(raw);
  }, [min, max]);

  const bindDrag = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const apply = (clientY: number, end = false) => {
      const v = valueFromClientY(clientY);
      onChange(v);
      lastRef.current = v;
      if (end) onChangeEnd?.(v);
    };

    apply(e.clientY);

    const onMove = (ev: PointerEvent) => apply(ev.clientY);
    const onUp = (ev: PointerEvent) => {
      apply(ev.clientY, true);
      target.releasePointerCapture(ev.pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const clamped = Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
  // thumb position: max at top
  const pct = ((max - clamped) / (max - min)) * 100;

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <Text size="xs" fw={700} ta="center" style={{ minHeight: 18 }}>
        {clamped > 0 ? `+${clamped}` : String(clamped)}
      </Text>
      <Box
        ref={trackRef}
        onPointerDown={bindDrag}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-orientation="vertical"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return;
          let next = clamped;
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = Math.min(max, clamped + 1);
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = Math.max(min, clamped - 1);
          if (e.key === 'Home') next = max;
          if (e.key === 'End') next = min;
          if (next !== clamped) {
            e.preventDefault();
            onChange(next);
            onChangeEnd?.(next);
          }
        }}
        style={{
          position: 'relative',
          width: 44,
          height,
          cursor: disabled ? 'not-allowed' : 'ns-resize',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* track */}
        <Box
          style={{
            position: 'absolute',
            left: '50%',
            top: 8,
            bottom: 8,
            width: 8,
            transform: 'translateX(-50%)',
            borderRadius: 4,
            background: 'var(--mantine-color-default-border)',
          }}
        />
        {/* zero mark */}
        <Box
          style={{
            position: 'absolute',
            left: '50%',
            top: `${((max - 0) / (max - min)) * 100}%`,
            width: 18,
            height: 2,
            transform: 'translate(-50%, -50%)',
            background: 'var(--mantine-color-dimmed)',
            opacity: 0.7,
          }}
        />
        {/* thumb */}
        <Box
          style={{
            position: 'absolute',
            left: '50%',
            top: `${pct}%`,
            width: 28,
            height: 16,
            transform: 'translate(-50%, -50%)',
            borderRadius: 4,
            background: 'var(--mantine-color-indigo-filled)',
            boxShadow: '0 1px 3px rgba(0,0,0,.35)',
            border: '2px solid var(--mantine-color-body)',
            pointerEvents: 'none',
          }}
        />
      </Box>
    </Box>
  );
}
