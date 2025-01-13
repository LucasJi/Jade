import { mapPathsToColors } from '@/lib/file';
import { describe, expect, test } from 'vitest';

describe('mapPathsToColors', () => {
  test('When given path then should return paths to colors map', () => {
    const p1 = '1/2/a.md';
    const p2 = '1/2/b.md';
    const p3 = '1/3/c.md';
    const p4 = '2/3/d.md';

    const map = mapPathsToColors([p1, p2, p3, p4]);
    expect(map[p1]).toBe(map[p2]);
    expect(map[p3]).not.toBe(map[p4]);
  });
});
