import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ShaderMaterial } from 'three';

import { Canvas, extend } from 'react-three-fiber';
import { OrbitControls, shaderMaterial } from '@react-three/drei';

import { useBasicUniforms, ScreenQuad } from '../../src/index';

const MyMaterial = shaderMaterial({
  u_time: 0,
  u_resolution: [0, 0],
  u_mouse: [0, 0]
}, /*glsl*/`
varying vec2 vUv;

void main()	{
  vUv = uv;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
`, /*glsl*/`
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 vUv;

float grid(vec2 st, float res){
  vec2 grid = fract(st*res);
  return 1.-(step(res,grid.x) * step(res,grid.y));
}

void main() {
  vec2 st = gl_FragCoord.st/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;

  vec2 grid_uv = (st + vec2(u_time * .1, 0.)) * u_resolution.y; 
  float x = grid(grid_uv, .01);

  vec3 col = max(vec3(x), vec3(u_mouse, 0.));
  
  gl_FragColor = vec4(col, 1.);
}
`)

extend({ MyMaterial })

function Scene() {
  const ref = React.useRef<ShaderMaterial>(null)
  useBasicUniforms(ref)
  
  return (
    <ScreenQuad>
      <myMaterial ref={ref} />
    </ScreenQuad>
  )
}

const App = () => {
  return (
    <Canvas camera={{position: [0, 0, 10]}}>
      <Scene />
      <OrbitControls />
    </Canvas>
  );
};

export default App
