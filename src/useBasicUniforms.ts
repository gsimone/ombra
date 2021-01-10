import * as React from 'react';
import { ShaderMaterial, Vector3, Vector4 } from 'three';
import { useFrame, useThree } from 'react-three-fiber';
import { useEffect } from 'react';

type Opts = {
  mouse?: {
    invertY?: boolean;
    invertX?: boolean;
    lerp?: number;
    drag?: boolean;
  };
};

useBasicUniforms.uniforms = {
  u_time: 0, // time elapsed in the application
  u_mouse: new Vector3(0, 0, 0), // mouse position
  u_mouse_drag: new Vector4(-2, -2, -2, -2),
  u_resolution: new Vector3(
    window.innerWidth,
    window.innerHeight,
    window.devicePixelRatio
  ),
  u_frame: 0, // the frame number
};

export function useBasicUniforms(
  material: React.RefObject<ShaderMaterial>,
  options: Opts = {}
) {
  const resolution = React.useRef([
    window.innerWidth,
    window.innerHeight,
    window.devicePixelRatio,
  ]);

  const handleResize = React.useCallback(() => {
    if (material.current) {
      material.current!.uniforms.u_resolution.value = [
        window.innerWidth,
        window.innerHeight,
        window.devicePixelRatio,
      ];
    }
  }, [material]);

  useEffect(() => {
    if (material.current) {
      material.current!.uniforms.u_resolution.value = resolution.current;
    }
  }, [material]);

  const [pointerDown, setPointerDown] = React.useState(false);

  const [mouseDrag] = React.useState(() => new Vector4(0, 0, 0, 0));

  const state = useThree();

  const shouldInvertX = options.mouse?.invertX ? -1 : 1;
  const shouldInvertY = options.mouse?.invertY ? -1 : 1;

  const handlePointerUp = React.useCallback(() => {
    setPointerDown(false);
  }, [setPointerDown]);

  const handlePointerDown = React.useCallback(() => {
    mouseDrag.x = state.mouse.x * shouldInvertX;
    mouseDrag.y = state.mouse.y * shouldInvertY;

    setPointerDown(true);
  }, [setPointerDown, state, mouseDrag, shouldInvertX, shouldInvertY]);

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handleResize, handlePointerDown, handlePointerUp]);

  const [mouseVector] = React.useState(() => new Vector3(0, 0, 0));

  useFrame(({ clock, mouse }) => {
    const m = material.current!;

    m.uniforms.u_time.value = clock.getElapsedTime();

    // @ts-expect-error
    mouseVector.copy(mouse);
    mouseVector.z = pointerDown ? 1 : 0;
    mouseVector.set(
      mouseVector.x * shouldInvertX,
      mouseVector.y * shouldInvertY,
      mouseVector.z
    );

    if (pointerDown) {
      mouseDrag.z = mouse.x * shouldInvertX;
      mouseDrag.w = mouse.y * shouldInvertY;
      m.uniforms.u_mouse_drag.value.copy(mouseDrag);
    }

    m.uniforms.u_mouse.value.lerp(mouseVector, options.mouse?.lerp || 1);
    m.uniforms.u_resolution.value = resolution.current;
  });
}
