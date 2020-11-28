# ▓ Ombra

Ombra is a collection of components and abstractions to help working with shaders in react-three-fiber.

### Components

#### ScreenQuad

A triangle that fills the screen, ideal for full-screen fragment shader work (raymarching, postprocessing).

👉 Why a triangle? https://www.cginternals.com/en/blog/2018-01-10-screen-aligned-quads-and-triangles.html


#### useBasicUniforms

A hook that adds and updates a set of common uniforms to your shader material:

- `float u_time` the absolute elapsed time
- `vec2 u_resolution` the width and height of the browser window, updated on resize
- `vec2 u_mouse` the normalized mouse position, update every frame (from r3f state)

TODO: Add shadertoy variant
