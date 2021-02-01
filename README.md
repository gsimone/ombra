![ombra](https://github.com/gsimone/ombra/blob/main/_logo.png?raw=true)


[![Version](https://img.shields.io/npm/v/ombra?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/ombra)
[![Downloads](https://img.shields.io/npm/dt/ombra.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/ombra)
[![Discord Shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/ZZjjNvJ)

# 🔲 Ombra

Ombra is a collection of components and abstractions to help working with shaders in react-three-fiber.

```
yarn add ombra 
```

### Components

#### ScreenQuad

```jsx
<ScreenQuad>
  <myMaterial />
</ScreenQuad>
```

A triangle that fills the screen, ideal for full-screen fragment shader work (raymarching, postprocessing).

👉 Why a triangle? https://www.cginternals.com/en/blog/2018-01-10-screen-aligned-quads-and-triangles.html


#### useBasicUniforms


```jsx
const material = useRef()
useBasicUniforms(material)

return (
  <ScreenQuad>
    <myMaterial ref={material} />
  </ScreenQuad>
)
```


A hook that adds and updates a set of common uniforms to your shader material:

- `float u_time` the absolute elapsed time
- `vec2 u_resolution` the width and height of the browser window, updated on resize
- `vec2 u_mouse` the normalized mouse position, update every frame (from r3f state)

TODO: Add shadertoy variant

#### FBOGUI [WIP]

A GUI helper for framebuffer objects, currently WIP

#### usePiP 

Hook used to build FBOGUI, see more here:
[See more here](https://twitter.com/ggsimm/status/1335565094000922626)

#### useFBO

```jsx
const myBuffer = useFBO({
  width: 1024,      // Buffer width, defaults to window width * DPI
  height: 1024      // Buffer height, defaults to window width * DPI,
  settings: { ... } // Any valid WebglRenderTarget option https://threejs.org/docs/#api/en/renderers/WebGLRenderTarget
})
```

Creates and returns a memoized WebglRenderTarget.


#### usePrototypeTexture (Suspense)

📦 https://codesandbox.io/s/ombra-prototype-dt02k?file=/src/index.js

```jsx
const texture = usePrototypeTexture(
  color // any valid color, you can check the types to see what's avaialable
)
```

Loads a 512x512 prototype texture, useful for demos. 
From this Unity asset: https://assetstore.unity.com/packages/2d/textures-materials/gridbox-prototype-materials-129127

The textures are served via githack and hosted in this repo https://github.com/gsimone/gridbox-prototype-materials

---

🇮🇹 Ombrawhat? Ombra is `shadow` in Italian.  
