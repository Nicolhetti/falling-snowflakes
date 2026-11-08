import type { MotionProfile } from './flake';

export type FlakeShape = 'dendrite' | 'star' | 'plate' | 'dot';

/** All built-in shapes. */
export const FLAKE_SHAPES: FlakeShape[] = ['dendrite', 'star', 'plate', 'dot'];

/** Shapes used when no `shapes` option is given. */
export const DEFAULT_SHAPES: FlakeShape[] = ['dendrite', 'dot'];

/** Round puffs look the same from every side, so they don't spin or tumble. */
export const SHAPE_MOTION: Partial<Record<FlakeShape, MotionProfile>> = {
  dot: { sway: 1, swayFreq: 1, spin: 0, flip: 0, rock: 0 },
};

/** Sprites are drawn once at this size and scaled down for each flake. */
const SPRITE_SIZE = 128;

type Ctx = CanvasRenderingContext2D;

// Every shape is drawn in a -1..1 box, centered on the middle of the flake.

/** Adds the same arm to the path six times around the center. */
function sixfold(ctx: Ctx, arm: () => void): void {
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);
    arm();
    ctx.restore();
  }
}

/** One arm from the center up to (0, -1), with a pair of side branches at each `[height, length]`. */
function branchedArm(ctx: Ctx, branches: Array<[number, number]>): void {
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -1);
  for (const [y, length] of branches) {
    for (const side of [1, -1]) {
      // Branches grow out from the arm at 60 degrees, like real ice crystals.
      ctx.moveTo(0, y);
      ctx.lineTo(side * length * 0.87, y - length * 0.5);
    }
  }
}

/** A hexagon with a point at the top, or turned by `turn` radians. */
function hexagon(ctx: Ctx, radius: number, turn = 0): void {
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 + turn;
    const x = radius * Math.sin(a);
    const y = -radius * Math.cos(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawShape(ctx: Ctx, shape: FlakeShape): void {
  ctx.beginPath();
  switch (shape) {
    case 'dendrite':
      // Feathery: two pairs of branches on every arm.
      sixfold(ctx, () => branchedArm(ctx, [[-0.35, 0.4], [-0.65, 0.27]]));
      ctx.stroke();
      break;
    case 'star':
      // Plain: one pair of branches on every arm.
      sixfold(ctx, () => branchedArm(ctx, [[-0.55, 0.32]]));
      ctx.stroke();
      break;
    case 'plate':
      // A flat hexagonal crystal: fine spokes, an outer ring and a smaller ring turned between them.
      ctx.lineWidth = 0.07;
      sixfold(ctx, () => {
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -0.85);
      });
      hexagon(ctx, 0.85);
      hexagon(ctx, 0.5, Math.PI / 6);
      ctx.stroke();
      break;
    default:
      // A soft round puff.
      ctx.arc(0, 0, 0.45, 0, Math.PI * 2);
      ctx.fill();
  }
}

/** Draws one snowflake in a solid color onto its own small canvas. */
export function createFlakeSprite(color: string, shape: FlakeShape): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.translate(SPRITE_SIZE / 2, SPRITE_SIZE / 2);
  // Leave room around the flake for its glow.
  ctx.scale(SPRITE_SIZE * 0.4, SPRITE_SIZE * 0.4);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = 0.11;
  // A faint blue glow keeps white flakes visible on light backgrounds.
  ctx.shadowColor = 'rgba(70,120,180,0.6)';
  ctx.shadowBlur = 8;

  drawShape(ctx, shape);
  return canvas;
}
