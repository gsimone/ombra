import * as THREE from 'three';
import * as React from 'react';
import { render as renderDOM, unmountComponentAtNode } from 'react-dom';
import {
  createPortal,
  useFrame,
  useResource,
  useThree,
} from 'react-three-fiber';
import { useCamera, OrthographicCamera } from '@react-three/drei';
import { animated as a } from '@react-spring/three';
import { useEffect } from 'react';
import create from 'zustand';
import produce from 'immer';

import { usePip, getPositions } from './usePiP';

type Store = {
  tooltip: {
    x: number;
    y: number;
    active: boolean;
    data?: Record<string, any>;
  };
  setTooltipPosition: (x: number, y: number) => void;
  setTooltipActive: (isActive: boolean) => void;
  setData: (data: Record<string, any>) => void;
};

const useStore = create<Store>(set => ({
  tooltip: {
    x: 0,
    y: 0,
    active: false,
    data: undefined,
  },
  setTooltipPosition: (x, y) =>
    set(
      produce(state => {
        state.tooltip.x = x;
        state.tooltip.y = y;
      })
    ),
  setTooltipActive: isActive =>
    set(
      produce(state => {
        state.tooltip.active = isActive;
      })
    ),
  setData: data =>
    set(
      produce(state => {
        state.tooltip.data = data;
      })
    ),
}));

// @todo make these dynamic
type PlaneProps = {
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  width: number;
  position: number[];
  fbo: THREE.WebGLRenderTarget;
  camera: React.MutableRefObject<THREE.OrthographicCamera>;
};

function Plane({ setActive, width, position, fbo, camera }: PlaneProps) {
  const ref = React.useRef<THREE.Mesh>(null);
  const [bind, props] = usePip(ref, width, position, setActive);

  const setTooltipPosition = useStore(store => store.setTooltipPosition);
  const setTooltipActive = useStore(store => store.setTooltipActive);
  const setTooltipData = useStore(store => store.setData);

  const { gl } = useThree();

  const logPixel = React.useCallback(
    function logPixel(e) {
      const pixelBuffer = new Uint8Array(4);
      const x = e.uv.x * fbo.height;
      const y = e.uv.y * fbo.height;
      gl.readRenderTargetPixels(fbo, x, y, 1, 1, pixelBuffer);

      setTooltipPosition(e.clientX, e.clientY);
      setTooltipData(pixelBuffer);
    },
    [setTooltipPosition, fbo, gl, setTooltipData]
  );

  const size = [width, 300 / (window.innerWidth / window.innerHeight)];

  return (
    <>
      <group>
        <a.mesh
          ref={ref}
          raycast={useCamera(camera)}
          {...bind()}
          onPointerOver={() => setTooltipActive(true)}
          onPointerMove={logPixel}
          onPointerOut={() => setTooltipActive(false)}
          {...props}
        >
          {/* @ts-ignore */}
          <planeBufferGeometry args={size} />
          <meshBasicMaterial map={fbo.texture} />
        </a.mesh>
      </group>
    </>
  );
}

export function Tooltip() {
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [el] = React.useState<HTMLDivElement>(() =>
    document.createElement('div')
  );
  const { gl } = useThree();
  const target = gl.domElement.parentNode;

  const active = useStore(store => store.tooltip.active);

  useEffect(() => {
    if (target) {
      target.appendChild(el);

      renderDOM(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 200,
            marginTop: '2rem',
            marginLeft: '2rem',
            padding: '.5rem',
            borderRadius: '4px',
            backgroundColor: 'white',
            pointerEvents: 'none',
            display: 'none',
            fontFamily: 'Monaco, monospace',
            fontSize: 12,
          }}
        >
          Tooltip
        </div>,
        el
      );
    }

    // subscribe to position
    const unsubscribe = useStore.subscribe(
      ([active, x, y]: any) => {
        if (tooltipRef.current) {
          tooltipRef.current.style.transform = `translateX(${x}px) translateY(${y}px)`;
          tooltipRef.current.style.display = active ? 'block' : 'none';
        }
      },
      state => [state.tooltip.active, state.tooltip.x, state.tooltip.y] as any
    );

    return () => {
      if (target) target.removeChild(el);
      unmountComponentAtNode(el);
      unsubscribe();
    };
  }, [el, target]);

  useFrame(() => {
    if (active && tooltipRef.current) {
      const d = useStore.getState().tooltip.data;
      tooltipRef.current.innerHTML = JSON.stringify(d, null, '  ');
    }
  });

  return null;
}

export function FBOGUI({
  fbos,
  onActive,
  renderPriority = 1000,
}: {
  onActive?: (isActive: boolean) => void;
  fbos: THREE.WebGLRenderTarget[];
  renderPriority?: number;
}) {
  const [fboScene] = React.useState(() => new THREE.Scene());
  const camera = useResource<THREE.OrthographicCamera>();

  const [active, setActive] = React.useState(false);

  useFrame(({ gl }) => {
    gl.render(fboScene, camera.current);
  }, renderPriority);

  useEffect(() => {
    if (typeof onActive === 'function') {
      onActive(active);
    }
  }, [onActive, active]);

  const { viewport } = useThree();

  const POSITIONS = React.useMemo(() => {
    return getPositions(300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.width, viewport.height]);

  return (
    <>
      {createPortal(
        <>
          <Tooltip />
          {/* @ts-expect-error types are fixed in next version */}
          <OrthographicCamera ref={camera} near={0.0001} far={1} />
          {camera && (
            <group position={[0, 0, -0.1]}>
              {fbos.length > 0 &&
                fbos.map((fbo: THREE.WebGLRenderTarget, i) => (
                  <Plane
                    setActive={setActive}
                    position={POSITIONS[Object.keys(POSITIONS)[i]]}
                    key={i}
                    width={300}
                    camera={camera}
                    fbo={fbo}
                  />
                ))}
            </group>
          )}
        </>,
        fboScene
      )}
    </>
  );
}
