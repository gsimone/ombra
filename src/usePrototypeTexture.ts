import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

const getUrl = (color: Color) =>
  `https://rawcdn.githack.com/gsimone/gridbox-prototype-materials/9bca2cea43ca4f488af79c26c81a77523c503b4c/prototype_512x512_${color}.png`;

type Color =
  | 'blue1'
  | 'blue2'
  | 'blue3'
  | 'brown'
  | 'cyan'
  | 'green1'
  | 'green2'
  | 'grey1'
  | 'grey2'
  | 'grey3'
  | 'grey4'
  | 'orange'
  | 'purple'
  | 'red'
  | 'white'
  | 'yellow';

export function usePrototypeTexture(color: Color) {
  return useTexture(getUrl(color)) as THREE.Texture;
}
