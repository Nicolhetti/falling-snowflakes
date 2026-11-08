import { describe, expect, it } from 'vitest';
import { createFlake, pick, stepFlake, type MotionOptions } from '../src/flake';

// Small seeded random so tests are repeatable.
function seeded(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const opts: MotionOptions = {
  size: [10, 20],
  speed: 2,
  wind: 0,
  sway: 0,
  rotationSpeed: 1,
};

describe('pick', () => {
  it('returns a fixed number as is', () => {
    expect(pick(5, 0.9)).toBe(5);
  });
  it('picks between the ends of a range', () => {
    expect(pick([10, 20], 0)).toBe(10);
    expect(pick([10, 20], 0.5)).toBe(15);
    expect(pick([10, 20], 1)).toBe(20);
  });
});

describe('createFlake', () => {
  it('starts above the top unless asked to start anywhere', () => {
    const r = seeded();
    for (let i = 0; i < 50; i++) {
      expect(createFlake(opts, 800, 600, 4, r, false).y).toBeLessThan(0);
      const anywhere = createFlake(opts, 800, 600, 4, r, true);
      expect(anywhere.y).toBeGreaterThanOrEqual(0);
      expect(anywhere.y).toBeLessThanOrEqual(600);
    }
  });
  it('only uses pictures that exist', () => {
    const r = seeded(7);
    for (let i = 0; i < 100; i++) {
      const v = createFlake(opts, 800, 600, 3, r, true).variant;
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(3);
    }
  });
});

describe('stepFlake', () => {
  it('moves a flake down and spins it', () => {
    const r = seeded(3);
    const flake = createFlake(opts, 800, 600, 1, r, true);
    flake.y = 100;
    const rotation = flake.rotation;
    stepFlake(flake, 1, opts, 800, 600, 1, r);
    expect(flake.y).toBeGreaterThan(100);
    expect(flake.rotation).toBeCloseTo(rotation + 1);
  });

  it('sends a flake back to the top after it falls off the bottom', () => {
    const r = seeded(4);
    const flake = createFlake(opts, 800, 600, 1, r, true);
    flake.y = 700;
    stepFlake(flake, 1, opts, 800, 600, 1, r);
    expect(flake.y).toBeLessThan(0);
  });

  it('wraps a flake that blows off one side to the other side', () => {
    const r = seeded(5);
    const windy = { ...opts, wind: 50 };
    const flake = createFlake(windy, 800, 600, 1, r, true);
    flake.x = 820;
    flake.y = 100;
    stepFlake(flake, 1, windy, 800, 600, 1, r);
    expect(flake.x).toBeLessThan(0);
  });

  it('swings a light flake further side to side and spins it less', () => {
    const swaying = { ...opts, sway: 2 };
    const a = createFlake(swaying, 800, 600, 1, seeded(11), true);
    a.x = 400;
    a.y = 100;
    a.swayPhase = Math.PI / 2;
    const b = { ...a };
    stepFlake(a, 1, swaying, 800, 600, 1, seeded(1));
    stepFlake(b, 1, swaying, 800, 600, 1, seeded(1), { sway: 2, swayFreq: 1, spin: 0.2, flip: 1, rock: 0 });
    expect(Math.abs(b.x - 400)).toBeGreaterThan(Math.abs(a.x - 400) * 1.5);
    expect(b.rotation - a.rotation + 1).toBeCloseTo(0.2);
  });

  it('moves twice as far in a frame twice as long', () => {
    const a = createFlake(opts, 800, 600, 1, seeded(9), true);
    a.y = 100;
    const b = { ...a };
    stepFlake(a, 1, opts, 800, 600, 1, seeded(1));
    stepFlake(b, 2, opts, 800, 600, 1, seeded(1));
    expect(b.y - 100).toBeGreaterThan((a.y - 100) * 1.5);
  });
});
