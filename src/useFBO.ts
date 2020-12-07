import * as THREE from 'three';
import { useMemo } from 'react';

type useFBOProps = {
  settings: THREE.WebGLRenderTargetOptions;
  width?: number;
  height?: number;
};

export function useFBO({
  settings,
  width = window.innerWidth * window.devicePixelRatio,
  height = window.innerHeight * window.devicePixelRatio,
}: useFBOProps) {
  return useMemo(() => {
    const target = new THREE.WebGLRenderTarget(width, height, settings);
    return target;
  }, [settings]);
}
