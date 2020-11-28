import * as THREE from 'three'
import React, { forwardRef, useMemo } from 'react'
import { useAspect } from '@react-three/drei'
import { Mesh } from 'three';

export function createScreenQuadGeometry() {
  const geometry = new THREE.BufferGeometry();
  var vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
  var uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  return geometry;
}

type ScreenQuadProps = {
  children: JSX.Element  
}

export const ScreenQuad = forwardRef<Mesh, ScreenQuadProps>(function ScreenQuad({children}, ref) {

  const geometry = useMemo(() => {
    return createScreenQuadGeometry()
  }, [])

  const scale = useAspect('cover', window.innerWidth, window.innerHeight)
  
  return (
    // @ts-expect-error scale type isn't checked correctly
    <mesh scale={scale} ref={ref} geometry={geometry}>
      {children}
    </mesh>
  )

})
