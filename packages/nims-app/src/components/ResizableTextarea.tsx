import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { Textarea as MantineTextarea, type TextareaProps } from '@mantine/core';
import { useIsMobile } from '@/hooks/useIsMobile';
import './ResizableTextarea.css';

const MIN_HEIGHT = 72;
const MOBILE_MIN_HEIGHT = 160;

function withFixedHeight(
  styles: TextareaProps['styles'],
  height: number | undefined,
  mobileMin: number | undefined,
): TextareaProps['styles'] {
  const apply = (input: CSSProperties = {}): CSSProperties => ({
    ...input,
    resize: 'none',
    scrollMargin: '120px',
    ...(height != null
      ? { height, minHeight: height }
      : mobileMin != null
        ? { minHeight: mobileMin }
        : {}),
  });

  if (typeof styles === 'function') {
    return ((theme, params, ctx) => {
      const resolved = (styles as Function)(theme, params, ctx) || {};
      return { ...resolved, input: apply(resolved.input) };
    }) as TextareaProps['styles'];
  }

  const obj = (styles && typeof styles === 'object' ? styles : {}) as Record<string, CSSProperties>;
  return { ...obj, input: apply(obj.input) };
}

/** Textarea with a full-width bottom-edge drag handle (native CSS resize is corner-only). */
export function Textarea({
  styles,
  resize: _resize,
  autosize: _autosize,
  rows,
  onFocus,
  ...props
}: TextareaProps) {
  const isMobile = useIsMobile();
  const [height, setHeight] = useState<number | undefined>();
  const rootRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const textarea = rootRef.current?.querySelector('textarea');
    if (!textarea) return;

    const startY = e.clientY;
    const startH = textarea.offsetHeight;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    const onMove = (ev: PointerEvent) => {
      setHeight(Math.max(MIN_HEIGHT, startH + (ev.clientY - startY)));
    };
    const onUp = () => {
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    onFocus?.(e);
    // Keep focused field above the soft keyboard when possible
    requestAnimationFrame(() => {
      e.currentTarget?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }, [onFocus]);

  const effectiveRows = rows ?? (isMobile ? 8 : 4);
  const mobileMin = isMobile && height == null ? MOBILE_MIN_HEIGHT : undefined;

  return (
    <div ref={rootRef} className={`nims-resizable-textarea${isMobile ? ' nims-resizable-textarea--mobile' : ''}`}>
      <MantineTextarea
        {...props}
        rows={effectiveRows}
        autosize={false}
        resize="none"
        onFocus={handleFocus}
        styles={withFixedHeight(styles, height, mobileMin)}
      />
      {!isMobile && (
        <div
          className="nims-textarea-resize-handle"
          onPointerDown={onPointerDown}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Изменить высоту поля"
          title="Потяните за нижнюю кромку"
        />
      )}
    </div>
  );
}

export type { TextareaProps };
