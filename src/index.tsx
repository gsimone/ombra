import { HTMLAttributes, ReactChild, Ref, useEffect, useCallback } from 'react';
import { useFrame } from 'react-three-fiber';
import { ShaderMaterial } from 'three';
import { useRef } from 'react';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  /** custom content, defaults to 'the snozzberries taste like snozzberries' */
  children?: ReactChild;
}

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
export function useBasicUniforms(material: Ref<ShaderMaterial>) {
  
  const resolution = useRef([window.innerWidth, window.innerHeight])
  const handleResize = useCallback(() => {
    resolution.current = [window.innerWidth, window.innerHeight]
  }, [])
  
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  useFrame(({ clock, mouse }) => {
    // @ts-ignore
    if (material && material.current) {
      // @ts-ignore
      const m = material.current
      
      m.uniforms.u_time.value = clock.getElapsedTime()
      m.uniforms.u_mouse.value = mouse
      m.uniforms.u_resolution.value = resolution.current
    }
  })
  
}

export * from './ScreenQuad'
