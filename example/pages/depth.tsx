import * as React from 'react';
import * as THREE from 'three'
import { ShaderMaterial, Mesh } from 'three';
import { useEffect, useRef } from 'react';
import { Canvas, extend, useFrame } from 'react-three-fiber';
import { Box, OrbitControls, shaderMaterial, Plane, Octahedron } from '@react-three/drei';

import { useBasicUniforms, useFBO, FBOGUI, usePrototypeTexture } from '../../src/index';
import { getRef } from '../../src/utilities';

const MyMaterial = shaderMaterial({
  u_time: 0,
  u_resolution: [0, 0],
  u_mouse: [0, 0],
  depthBuffer: null
}, /*glsl*/`
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vDepth;

  void main()	{
    vUv = uv;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    vPosition = gl_Position.xyz;
    vDepth = gl_Position.z;
  }
`, /*glsl*/`
  precision highp float;

  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_time;

  uniform sampler2D depthBuffer;

  varying vec2 vUv;
  varying float vDepth;

  float grid(vec2 st, float res){
    vec2 grid = fract(st*res);
    return 1.-(step(res,grid.x) * step(res,grid.y));
  }

  #include <packing>

  void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec4 packedDepth = texture(depthBuffer, st);
    float sceneDepth = unpackRGBAToDepth(packedDepth);

    float depth = vDepth / 40.;
    float diff = abs(depth - sceneDepth);

    gl_FragColor = vec4(vec3(1., 0., 0.), diff);
  }
`)

extend({ MyMaterial })

const PositionMaterial = shaderMaterial({}, /* glsl */`
  varying vec2 vUv;
  varying vec3 vPosition;

  void main()	{
    vUv = uv;

    vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.);

    vPosition = pos.xyz;

    gl_Position = pos;
  }
`, /* glsl */`
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    gl_FragColor = vec4(vPosition, 1.);
  }
`)

const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.BasicDepthPacking
})
const normalMaterial = new THREE.MeshNormalMaterial()
const positionMaterial = new PositionMaterial()

function Scene() {
  const ref = React.useRef<ShaderMaterial>()
  const sphereRef = React.useRef<Mesh>(null)

  // @ts-expect-error 
  useBasicUniforms( ref )

  const depthBuffer = useFBO({settings: { 
    format: THREE.RGBAFormat, 
    stencilBuffer: false, 
    depthBuffer: true,
    type: THREE.FloatType
   }})

  const normalBuffer = useFBO({settings:{
    format: THREE.RGBFormat,
    stencilBuffer: false,
    depthBuffer: true
  }})

  const positionBuffer = useFBO({settings:{
    format: THREE.RGBFormat,
    stencilBuffer: false,
    depthBuffer: true
  }})

  const group = useRef()
  useFrame(({ gl, scene, camera }) => {
    const sphere = sphereRef.current!
    
    gl.autoClear = true
    
    scene.overrideMaterial = depthMaterial
    gl.setRenderTarget(depthBuffer)
    sphere.visible = false
    gl.render(scene,camera)
    gl.setRenderTarget(null)
    sphere.visible = true
    
    scene.overrideMaterial = normalMaterial
    gl.setRenderTarget(normalBuffer)
    gl.render(scene,camera)
    gl.setRenderTarget(null)
    scene.overrideMaterial = null

    scene.overrideMaterial = positionMaterial
    gl.setRenderTarget(positionBuffer)
    gl.render(scene,camera)
    gl.setRenderTarget(null)
    scene.overrideMaterial = null

    gl.render(scene, camera)
    gl.autoClear = false

    gl.clearDepth()
    
  }, -1)

  const texture = usePrototypeTexture("blue1")
  useEffect(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.needsUpdate = true
    texture.repeat.set(100, 100)
    texture.minFilter = THREE.LinearMipMapLinearFilter
    texture.magFilter = THREE.LinearMipMapLinearFilter
  }, [texture])

  const yellowTexture = usePrototypeTexture("yellow")
  useEffect(() => {
    yellowTexture.wrapS = yellowTexture.wrapT = THREE.RepeatWrapping
    yellowTexture.needsUpdate = true
    yellowTexture.repeat.set(1, 1)
    yellowTexture.minFilter = THREE.LinearMipMapLinearFilter
    yellowTexture.magFilter = THREE.LinearMipMapLinearFilter
  }, [yellowTexture])

  const orbitControls = useRef<OrbitControls>()

  return (
    <>
      <FBOGUI fbos={[normalBuffer, depthBuffer]} onActive={(isActive) => orbitControls.current!.enabled = !isActive} />
      <OrbitControls ref={orbitControls} />

      <Plane receiveShadow args={[200, 200, 200, 200]} rotation-x={-Math.PI/2} position-y={-1} material-map={texture} />
    
      <group ref={group}>
        <Box receiveShadow castShadow args={[2, 2, 2]}>
          <meshStandardMaterial map={yellowTexture} />
        </Box>

        <Box receiveShadow castShadow position={[0, 1, 4]} args={[3, 3, 3]}>
          <meshStandardMaterial map={yellowTexture} />
        </Box>

        <Box receiveShadow castShadow position={[-4, 1, -10]}>
          <meshStandardMaterial map={yellowTexture} />
        </Box>

        <Box receiveShadow castShadow args={[2, 2]} position={[6, 3, -10]}>
          <meshStandardMaterial map={yellowTexture} />
        </Box>
      </group>

      <Octahedron args={[4, 10]} ref={sphereRef}>
        <myMaterial 
          ref={ref} 
          side={THREE.DoubleSide} 
          transparent 
          depthBuffer={depthBuffer.texture} 
          depthWrite={false}
        />
      </Octahedron>

    </>
  )
}

const App = () => {
  return (
    <Canvas shadowMap camera={{position: [-6, 4, 10], near: 3, far: 40}}>
      <fog attach="fog" args={["#333"]} near={0.0001} far={40} />
      <color attach="background" args={["#333"]} />
      <React.Suspense fallback={null}>
      <Scene />
      </React.Suspense>
      <ambientLight />
      <directionalLight position={[0, 1, 0]} castShadow />
      <directionalLight position={[1, 0, 0]} castShadow />
    </Canvas>
  );
};

export default App
