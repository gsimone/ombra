import "react-app-polyfill/ie11";
import * as React from "react";
import { ShaderMaterial } from "three";

import { Canvas, extend } from "@react-three/fiber;
import {
  OrthographicCamera,
  shaderMaterial,
  ScreenQuad,
} from "@react-three/drei";

import { useBasicUniforms } from "../../src/index";

const MyMaterial = shaderMaterial(
  useBasicUniforms.uniforms,
  /*glsl*/ `
  varying vec2 vUv;

  void main()	{
    vUv = uv;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`,
  /*glsl*/ `
  uniform vec3 u_mouse; 
  uniform vec3 u_resolution;
  uniform float u_time;

  varying vec2 vUv;

  void main() {
    gl_FragColor = vec4(vUv, 1., 1.);
  }
`
);

const AnotherMaterial = shaderMaterial(
  useBasicUniforms.uniforms,
  /*glsl*/ `
  varying vec2 vUv;

  void main()	{
    vUv = uv;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`,
  /*glsl*/ `
  uniform vec3 u_mouse; 
  uniform vec4 u_mouse_drag;
  uniform vec3 u_resolution;
  uniform float u_time;

  varying vec2 vUv;

  // https://thebookofshaders.com/07/
  float circle(in vec2 _st, in float _radius){
    vec2 dist = _st - vec2(0.5);
    return 1.-smoothstep(_radius-(_radius*0.01),
                          _radius+(_radius*0.01),
                          dot(dist,dist)*4.0);
  }

  void main() {

    vec2 center = u_mouse.xy / 2.;
    
    vec2 center1 = u_mouse_drag.xy / 2.;
    vec2 center2 = u_mouse_drag.zw / 2.;

    vec3 col0 = vec3(0., 0., 1.) * circle(vUv + center, 1./ u_resolution.y * 5.);

    vec3 col1 = vec3(0., 1., 0.) * circle(vUv + center1, 1./ u_resolution.y * 5.);
    vec3 col2 = vec3(1., 0., 0.) * circle(vUv + center2, 1./ u_resolution.y * 5.) * (1. - u_mouse.z);

    vec4 col = vec4(max(col0, max(col1, col2)), 1.);
    vec4 bg = vec4(vec3(0.), 1.);

    gl_FragColor = bg + col;
  }
`
);

extend({ MyMaterial, AnotherMaterial });

function Scene() {
  const second = React.useRef<ShaderMaterial>(null);
  useBasicUniforms(second, {
    mouse: {
      lerp: 0.5,
    },
  });

  return (
    <>
      <ScreenQuad>
        <anotherMaterial ref={second} />
      </ScreenQuad>
    </>
  );
}

const App = () => {
  return (
    <Canvas>
      <color attach="background" args={[0]} />
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <Scene />
    </Canvas>
  );
};

export default App;
