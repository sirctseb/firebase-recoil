import { describe, it, expect } from '@jest/globals';

import { interpolatePathSpec, UnderspecError, OverspecError } from "./interpolatePathSpec";

describe('interplatePathSpec', () => {
  it('leaves paths with no params alone', () => {
    expect(interpolatePathSpec('/static/path', {})).toBe('/static/path')
  });

  it('replaces parameters with values from the params argument', () => {
    expect(interpolatePathSpec('/before/{hello}/after', { hello: 'world' })).toBe('/before/world/after')
  });

  it('throws an error if values for path segments are not provided', () => {
    expect(() => interpolatePathSpec('/before/{a}/{b}/after', { a: 'a' })).toThrowError(UnderspecError);
  });

  it('throws an error if extra values beyond the path segments are provided', () => {
    expect(() => interpolatePathSpec('/before/{a}/after', { a: 'a', b: 'b' })).toThrowError(OverspecError);
  });
});