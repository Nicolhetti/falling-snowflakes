import { useEffect, useRef, type CSSProperties } from 'react';
import { FallingSnowflakes as Engine, type FallingSnowflakesOptions } from './falling-snowflakes';

export interface FallingSnowflakesProps extends Omit<FallingSnowflakesOptions, 'container'> {
  /**
   * Cover the whole page instead of filling the parent element.
   * When false (the default), the parent element needs `position: relative`
   * (or any position other than static) for the flakes to stay inside it.
   */
  fullScreen?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Falling flakes for React. By default it fills its parent element;
 * pass `fullScreen` to cover the whole page.
 */
export function FallingSnowflakes({ fullScreen = false, className, style, ...options }: FallingSnowflakesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    if (!ref.current) return;
    engine.current = new Engine({ ...latest.current, container: ref.current });
    return () => {
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);

  // Pass prop changes through without restarting the animation.
  useEffect(() => {
    engine.current?.update(options);
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        position: fullScreen ? 'fixed' : 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: options.zIndex ?? (fullScreen ? 9999 : undefined),
        ...style,
      }}
    />
  );
}

export type { FallingSnowflakesOptions, FlakeShape, Range } from './index';
export { DEFAULT_COLORS } from './falling-snowflakes';
