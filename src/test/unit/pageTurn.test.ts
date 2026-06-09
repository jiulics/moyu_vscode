import { describe, expect, it } from 'vitest';

import {
  calculatePageProgress,
  getNextPageIndex,
  getPageIndexAfterChapterChange,
  getPreviousPageIndex
} from '../../webview/reader/pageTurn';

describe('pageTurn', () => {
  it('moves forward without exceeding the last page', () => {
    expect(getNextPageIndex(0, 3)).toBe(1);
    expect(getNextPageIndex(2, 3)).toBe(2);
  });

  it('moves backward without going below zero', () => {
    expect(getPreviousPageIndex(2)).toBe(1);
    expect(getPreviousPageIndex(0)).toBe(0);
  });

  it('calculates progress for app-style pages', () => {
    expect(calculatePageProgress(0, 4)).toBe(0);
    expect(calculatePageProgress(1, 4)).toBeCloseTo(33.333, 2);
    expect(calculatePageProgress(3, 4)).toBe(100);
  });

  it('resets the page when switching chapters', () => {
    expect(getPageIndexAfterChapterChange(0, 1, 5)).toBe(0);
    expect(getPageIndexAfterChapterChange(1, 1, 5)).toBe(5);
  });
});
