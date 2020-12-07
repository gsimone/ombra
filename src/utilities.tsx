import { MutableRefObject, RefObject } from 'react';

function assert<T>(value: T | null | undefined): asserts value is T {
  if (value === null || typeof value === 'undefined') {
    throw new Error('Ref assertion failed.');
  }
}

export function getRef<T>(ref: MutableRefObject<T> | RefObject<T>): T {
  assert(ref.current);
  return ref.current;
}
