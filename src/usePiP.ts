import * as React from 'react';
import { useSpring } from '@react-spring/three';
import { useDrag } from 'react-use-gesture';

const r = window.innerWidth / window.innerHeight;
const FOB_W = 450;
const FOB_H = FOB_W / r;
const MARGIN = 20;

export const POSITIONS: Record<string, number[]> = {
  LEFT: [-window.innerWidth / 2 + FOB_W / 2 + MARGIN, 0],
  TOP_LEFT: [
    -window.innerWidth / 2 + FOB_W / 2 + MARGIN,
    window.innerHeight / 2 - FOB_H / 2 - MARGIN,
  ],
  TOP: [0, window.innerHeight / 2 - FOB_H / 2 - MARGIN],
  TOP_RIGHT: [
    window.innerWidth / 2 - FOB_W / 2 - MARGIN,
    window.innerHeight / 2 - FOB_H / 2 - MARGIN,
  ],
  RIGHT: [window.innerWidth / 2 - FOB_W / 2 - MARGIN, 0],
  BOTTOM_RIGHT: [
    window.innerWidth / 2 - FOB_W / 2 - MARGIN,
    -window.innerHeight / 2 + FOB_H / 2 + MARGIN,
  ],
  BOTTOM_LEFT: [
    -window.innerWidth / 2 + FOB_W / 2 + MARGIN,
    -window.innerHeight / 2 + FOB_H / 2 + MARGIN,
  ],
  BOTTOM: [0, -window.innerHeight / 2 + FOB_H / 2 + MARGIN],
};

export function usePip(
  ref: React.RefObject<THREE.Mesh>,
  position: number[],
  callback?: (isActive: boolean) => void
) {
  const [DEF_POS_X, DEF_POS_Y] = position;

  const [styles, set] = useSpring(() => ({
    'position-x': DEF_POS_X,
    'position-y': DEF_POS_Y,
  }));

  const bind = useDrag(
    ({ down, last, movement: [x, y], metaKey }) => {
      let defaultPosition = position;

      const _y = y * -1;

      if (ref.current && last) {
        const xPerc = x / (window.innerWidth / 2);
        const yPerc = _y / (window.innerHeight / 2);

        const p: string[] = [];

        if (yPerc < -0.25 || yPerc > 0.25) {
          p.push(yPerc > 0 ? 'TOP' : 'BOTTOM');
        }

        if (xPerc < -0.25 || xPerc > 0.25) {
          p.push(xPerc < 0 ? 'LEFT' : 'RIGHT');
        }

        if (p.length > 0) {
          defaultPosition = POSITIONS[p.join('_')];
        }
      }

      set({
        'position-x': down || metaKey ? x : defaultPosition[0],
        'position-y': down || metaKey ? _y : defaultPosition[1],
        immediate: down,
      });

      if (typeof callback === 'function') {
        callback(down);
      }
    },
    {
      initial: () => [
        styles['position-x'].get(),
        -1 * styles['position-y'].get(),
      ],
    }
  );

  return [bind, { ...styles }] as const;
}
