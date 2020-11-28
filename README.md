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


🇮🇹 Ombrawhat? Ombra is `shadow` in Italian.  
