/** A fixed value, or a `[min, max]` range that each flake picks a value from. */
export type Range = number | [number, number];

/** The options that shape how each flake moves. All ranges are per flake. */
export interface MotionOptions {
  /** Flake size in CSS pixels. */
  size: Range;
  /** Fall speed in pixels per frame (at 60fps). */
  speed: Range;
  /** Steady sideways drift in pixels per frame. Negative blows left. */
  wind: Range;
  /** How far flakes swing side to side, in pixels per frame. */
  sway: Range;
  /** Spin speed in degrees per frame. */
  rotationSpeed: Range;
}

/**
 * One flake. Each flake keeps random factors between 0 and 1 rather than
 * final values, so changing options takes effect immediately for every flake.
 */
export interface Flake {
  x: number;
  y: number;
  rotation: number;
  /** Where the flake is in its side-to-side swing, in radians. */
  swayPhase: number;
  /** Where the flake is in its slow turn over in the air (3D flip), in radians. */
  flipPhase: number;
  /** Which color sprite or image this flake uses. */
  variant: number;
  rSize: number;
  rSpeed: number;
  rWind: number;
  rSway: number;
  rRotation: number;
  rSwayFreq: number;
  rFlipFreq: number;
}

/**
 * How a kind of flake moves, relative to the options. Round puffs don't
 * spin or tumble, because they look the same from every side.
 */
export interface MotionProfile {
  /** Multiplies how far the flake swings side to side. */
  sway: number;
  /** Multiplies how fast the side-to-side swing is. */
  swayFreq: number;
  /** Multiplies spin speed. */
  spin: number;
  /** Multiplies how fast the flake tumbles over. */
  flip: number;
  /** Degrees the flake tilts back and forth as it swings, like a pendulum. */
  rock: number;
}

// Snowflakes turn over slowly, so the default flip is gentle.
export const DEFAULT_PROFILE: MotionProfile = { sway: 1, swayFreq: 1, spin: 1, flip: 0.4, rock: 0 };

export type Random = () => number;

/** Picks the value at `t` (0–1) between a range's ends. */
export function pick(range: Range, t: number): number {
  if (typeof range === 'number') return range;
  const [min, max] = range;
  return min + (max - min) * t;
}

/** The largest size a flake can be. Used to decide when a flake is off screen. */
export function maxSize(range: Range): number {
  return typeof range === 'number' ? range : Math.max(range[0], range[1]);
}

/**
 * Makes a flake. With `anywhere`, it starts at a random height so the screen
 * is already full on the first frame; otherwise it starts just above the top.
 */
export function createFlake(
  opts: MotionOptions,
  width: number,
  height: number,
  variants: number,
  random: Random,
  anywhere: boolean,
): Flake {
  const rSize = random();
  const size = pick(opts.size, rSize);
  return {
    x: random() * width,
    y: anywhere ? random() * height : -size - random() * height * 0.2,
    rotation: random() * 360,
    swayPhase: random() * Math.PI * 2,
    flipPhase: random() * Math.PI * 2,
    variant: Math.floor(random() * Math.max(1, variants)),
    rSize,
    rSpeed: random(),
    rWind: random(),
    rSway: random(),
    rRotation: random(),
    rSwayFreq: random(),
    rFlipFreq: random(),
  };
}

/**
 * Moves a flake forward by `dt` frames (1 = one frame at 60fps). A flake
 * that falls off the bottom goes back to the top as a new flake. A flake that
 * drifts off the side comes back on the other side.
 */
export function stepFlake(
  flake: Flake,
  dt: number,
  opts: MotionOptions,
  width: number,
  height: number,
  variants: number,
  random: Random,
  profile: MotionProfile = DEFAULT_PROFILE,
): void {
  const size = pick(opts.size, flake.rSize);
  const swayFreq = (0.01 + flake.rSwayFreq * 0.02) * profile.swayFreq;
  const flipFreq = (0.02 + flake.rFlipFreq * 0.04) * profile.flip;

  flake.swayPhase += swayFreq * dt;
  flake.flipPhase += flipFreq * dt;

  const sway = Math.sin(flake.swayPhase) * pick(opts.sway, flake.rSway) * profile.sway;
  flake.x += (pick(opts.wind, flake.rWind) + sway) * dt;
  // Flakes slow down at the ends of each swing, like snow drifting on the air.
  const flutter = 0.6 + 0.4 * Math.abs(Math.cos(flake.swayPhase));
  flake.y += pick(opts.speed, flake.rSpeed) * flutter * dt;
  flake.rotation += pick(opts.rotationSpeed, flake.rRotation) * profile.spin * dt;

  if (flake.y - size > height) {
    Object.assign(flake, createFlake(opts, width, height, variants, random, false));
    return;
  }
  const margin = size;
  if (flake.x > width + margin) flake.x = -margin;
  else if (flake.x < -margin) flake.x = width + margin;
}
