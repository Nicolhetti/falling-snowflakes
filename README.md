# falling-snowflakes ❄️

**[Live demo](https://nicolhetti.github.io/falling-snowflakes/)**

Falling snow for any website. Small (~7 KB minified), no dependencies, drawn on a canvas, with an optional React component.

- Feathery dendrite, star and plate-shaped snowflakes, plus soft round flakes, or your own flake images
- Flakes drift, sway and slowly turn over as they fall
- Change options while it runs, with no restart
- Doesn't animate for people whose system asks for reduced motion
- Sharp on high-DPI screens, and clicks pass straight through

Forked from [ernkerr/falling-leaves](https://github.com/ernkerr/falling-leaves), the same engine with snowflakes instead of autumn leaves.

## Install

```sh
npm install @nicolhetti/falling-snowflakes
```

## Vanilla JS

```js
import { FallingSnowflakes } from '@nicolhetti/falling-snowflakes';

// Covers the whole page
const snow = new FallingSnowflakes();

// Or only inside one element
const hero = new FallingSnowflakes({ container: document.querySelector('.hero') });
```

| Method | What it does |
| --- | --- |
| `start()` | Starts or resumes the animation |
| `stop()` | Pauses it |
| `update(options)` | Changes options while it runs |
| `destroy()` | Stops it and removes the canvas |

## React

```jsx
import { FallingSnowflakes } from '@nicolhetti/falling-snowflakes/react';

// Covers the whole page
<FallingSnowflakes fullScreen />

// Fills its parent. The parent needs position: relative.
<div style={{ position: 'relative', height: 400 }}>
  <FallingSnowflakes count={80} wind={[0.2, 1]} />
</div>

// Every option is a prop. Changing a prop updates the flakes without restarting.
<FallingSnowflakes fullScreen shapes={['plate']} speed={[1, 2]} wind={[-1, 1]} />
```

It's safe to use with server rendering: nothing runs until the component mounts in the browser. In the Next.js App Router, use it inside a `'use client'` component.

## Options

Range options take either one number or a `[min, max]` pair, and each flake picks its own value from the range.

| Option | Default | Description |
| --- | --- | --- |
| `count` | `50` | How many flakes are on screen |
| `size` | `[8, 22]` | Flake size in pixels |
| `speed` | `[0.5, 1.3]` | Fall speed in pixels per frame (at 60fps) |
| `wind` | `[-0.3, 0.5]` | Sideways drift. Negative blows left |
| `sway` | `[0.3, 1]` | How far flakes swing side to side |
| `rotationSpeed` | `[-0.6, 0.6]` | Spin in degrees per frame |
| `colors` | white and pale blues | Flake colors (any CSS color) |
| `shapes` | `['dendrite', 'dot']` | Which built-in shapes to use: `'dendrite'`, `'star'`, `'plate'`, `'dot'` |
| `images` | — | Your own flake images (`HTMLImageElement`, canvas, etc.). Replaces `colors` and `shapes` |
| `opacity` | `1` | Flake opacity |
| `zIndex` | `9999` full page, `0` in a container | Canvas z-index |
| `respectReducedMotion` | `true` | Don't animate when the user's system asks for reduced motion |
| `autoStart` | `true` | Start animating straight away |
| `container` | page | Element to fill. Vanilla JS only |
| `fullScreen` | `false` | Cover the whole page. React only |

White flakes need a darker background to show up. On a light page, pass your own `colors`.

### Your own images

```js
const flake = new Image();
flake.src = '/flake.png';

new FallingSnowflakes({ images: [flake], size: [20, 40] });
```

## Development

```sh
npm install
npm test          # unit tests
npm run build     # builds dist/
npm run demo      # builds and serves the demo at http://localhost:3000/demo/
```

## License

MIT
