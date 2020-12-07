import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as THREE from 'three'
import { ShaderMaterial, Mesh } from 'three';

import { Canvas, extend, useFrame, useThree } from 'react-three-fiber';
import { PerspectiveCamera, shaderMaterial, TransformControls } from '@react-three/drei';

import { useBasicUniforms, ScreenQuad } from '../../src/index';
import { useWheel } from 'react-use-gesture';

const MyMaterial = shaderMaterial({
  u_time: 0,
  u_resolution: [0, 0],
  u_mouse: [0, 0],
  u_camera: [0, 0, 0],
  pos: [0, 0, 0]
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
uniform vec3 u_camera;

uniform vec3 pos;

varying vec2 vUv;

// https://gist.github.com/yiwenl/3f804e80d0930e34a0b33359259b556c
mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  
  return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
              oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
              oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
              0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

float sdSphere(vec3 p, float radius) {
  return length(p) - radius;
}

float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); }

float qinticInOut(float t) {
  return t < 0.5
    ? +16.0 * pow(t, 5.0)
    : -0.5 * pow(2.0 * t - 2.0, 5.0) + 1.0;
}

float scene(vec3 p) {

  float t = u_time * 0.1;
  vec3 p1 = rotate(p, vec3(0.,1.,0.), 4. * 6.2831853 * sin(t));
  
  vec3 p2 = p1 + vec3(.5, .5, 0.) * qinticInOut(abs(sin(t * 3.)));
  vec3 p3 = p1 + vec3(-.5, -.5, 0.) * qinticInOut(abs(sin(t * 3.)));
  vec3 p4 = p1 + vec3(-.5, .5, 0.) * qinticInOut(abs(sin(t * 3.)));
  vec3 p5 = p1 + vec3(.5, -.5, 0.) * qinticInOut(abs(sin(t * 3.)));

  // union between the outer spheres
  float smaller = opSmoothUnion(
    sdSphere(p3, .25),
    sdSphere(p2, .25),
    .4
  );

  float smallerYet = opSmoothUnion(
    sdSphere(p4, .25),
    smaller,
    .4
  );

  float anotherUnion = opSmoothUnion(
    sdSphere(p5, .25),
    smallerYet,
    .4
  );

  float centerSphere = opSmoothUnion(
    sdSphere(p - pos, .25),
    anotherUnion,
    .3
  );

  return centerSphere;
}

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

vec3 getColorAmount(vec3 p) {
  float amount = clamp((1.5 - length(p))/2., 0., 1.);
  vec3 color = pal( amount * 4., vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.10,0.20) );

  return color * amount;
}
void main() {
  float x = u_resolution.x / u_resolution.y;
  vec2 uv = vUv * vec2(x, 1.) + vec2((1. - x) / 2., 0.);

  vec3 camPos = vec3(0., 0., 5.);
  vec2 p = uv - vec2(0.5);
  vec3 ray = normalize(vec3(p, -1.));
  vec3 rayPos = camPos;
  float curDist = 0.;
  // from camera to point
  float rayLength = 0.;
  vec3 color = vec3(0.);
  for (int i = 0; i <= 64; i++) {
      curDist = scene(rayPos);
      rayLength += 0.3 * curDist;
      rayPos = camPos + ray * rayLength;
      // if hitting the object
      if (abs(curDist) < 0.01) {
          break;
      }
      color += 0.05 * getColorAmount(rayPos);
  }
  gl_FragColor = vec4(color, 1.);
}

`)

extend({ MyMaterial })

const t = new THREE.Vector3()

function Scene() {
  const material = React.useRef<ShaderMaterial>(null)
  const mesh = React.useRef<Mesh>(null)
  const transformControls = React.useRef<Mesh>(null)

  useBasicUniforms(material, { camera: true })

  useFrame(() => {
    mesh.current.getWorldPosition(t);
    material.current.uniforms.pos.value = t;
  })

  const { camera } = useThree()
  const bind = useWheel(({ delta, direction }) => {
    console.log(direction[1])
    camera.position.set(0, 0, camera.position.z + (delta[1]/1000 * direction[1] * -1))
  })

  return (
    <group {...bind()}>
      <ScreenQuad>
        <myMaterial ref={material} />
      </ScreenQuad>
      <TransformControls ref={transformControls}>
        <mesh ref={mesh}></mesh>
      </TransformControls>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
    </group>
  )
}

const App = () => {
  return (
    <Canvas >
      <Scene />
    </Canvas>
  );
};

export default App
