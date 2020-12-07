import * as React from 'react';
import { ShaderMaterial } from 'three';
import { useFrame } from 'react-three-fiber';

export function useBasicUniforms(
  material: React.MutableRefObject<ShaderMaterial>
) {
  const resolution = React.useRef([window.innerWidth, window.innerHeight]);
  const handleResize = React.useCallback(() => {
    resolution.current = [window.innerWidth, window.innerHeight];
  }, []);

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useFrame(({ clock, mouse }) => {
    const m = material.current!;

    m.uniforms.u_time.value = clock.getElapsedTime();
    m.uniforms.u_mouse.value = mouse;
    m.uniforms.u_resolution.value = resolution.current;
  });
}
