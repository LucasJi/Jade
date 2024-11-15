import { OB_COMMENT_REG } from '@/lib/constants';
import { describe, expect, test } from 'vitest';

describe('constants - OB_COMMENT_REG', () => {
  test('When text wrapped with %%, then should return true', () => {
    const text = '%%text%%';
    expect(OB_COMMENT_REG.test(text)).toBe(true);
  });

  test('When text wrapped with %, then should return false', () => {
    const text = '%text%';
    expect(OB_COMMENT_REG.test(text)).toBe(false);
  });

  test('When text wrapped with %% %, then should return false', () => {
    const text = '%%text%';
    expect(OB_COMMENT_REG.test(text)).toBe(false);
  });

  test('When text wrapped with ``, then should return false', () => {
    const text = '`%%t%%`';
    expect(OB_COMMENT_REG.test(text)).toBe(false);
  });
});
