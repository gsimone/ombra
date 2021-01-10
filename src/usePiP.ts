import * as React from 'react';
import { useSpring } from '@react-spring/three';
import { useDrag } from 'react-use-gesture';
import { useThree } from 'react-three-fiber';

const FBO_W = 450;
const MARGIN = 20;

export const getPositions: (
  width?: number,
  margin?: number
) => Record<string, number[]> = (width = FBO_W, margin = MARGIN) => {
  const height = width / (window.innerWidth / window.innerHeight);

  return {
    LEFT: [-window.innerWidth / 2 + width / 2 + margin, 0],
    TOP_LEFT: [
      -window.innerWidth / 2 + width / 2 + margin,
      window.innerHeight / 2 - height / 2 - margin,
    ],
    TOP: [0, window.innerHeight / 2 - height / 2 - margin],
    TOP_RIGHT: [
      window.innerWidth / 2 - width / 2 - margin,
      window.innerHeight / 2 - height / 2 - margin,
    ],
    RIGHT: [window.innerWidth / 2 - width / 2 - margin, 0],
    BOTTOM_RIGHT: [
      window.innerWidth / 2 - width / 2 - margin,
      -window.innerHeight / 2 + height / 2 + margin,
    ],
    BOTTOM_LEFT: [
      -window.innerWidth / 2 + width / 2 + margin,
      -window.innerHeight / 2 + height / 2 + margin,
    ],
    BOTTOM: [0, -window.innerHeight / 2 + height / 2 + margin],
  };
};

export function usePip(
  ref: React.RefObject<THREE.Mesh>,
  width: number,
  position: number[],
  callback?: (isActive: boolean) => void
) {
  const [DEF_POS_X, DEF_POS_Y] = position;

  const [styles, set] = useSpring(() => ({
    'position-x': DEF_POS_X,
    'position-y': DEF_POS_Y,
  }));

  const { viewport } = useThree();

  const positions = React.useMemo(() => {
    return getPositions(width);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.width, viewport.height]);

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
          defaultPosition = positions[p.join('_')];
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
