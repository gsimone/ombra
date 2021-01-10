import * as THREE from 'three';

import React, { forwardRef, useMemo } from 'react';
import { useThree } from 'react-three-fiber';

export function createScreenQuadGeometry() {
  const geometry = new THREE.BufferGeometry();
  var vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
  var uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  return geometry;
}

type ScreenQuadProps = {
  children: JSX.Element;
  scale?: number[];
};

export const ScreenQuad = forwardRef<THREE.Mesh, ScreenQuadProps>(
  function ScreenQuad({ children, scale }, ref) {
    const geometry = useMemo(() => {
      return createScreenQuadGeometry();
    }, []);

    const { viewport } = useThree();
    const localScale = React.useMemo(
      () => [viewport.width * 0.5, viewport.height * 0.5],
      [viewport.width, viewport.height]
    );

    return (
      // @ts-ignore
      <mesh scale={scale || localScale} ref={ref} geometry={geometry}>
        {children}
      </mesh>
    );
  }
);
