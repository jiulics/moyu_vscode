import { afterEach, describe, expect, it, vi } from 'vitest';

import { BreakTimer } from '../../services/break/breakTimer';

describe('BreakTimer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts and finishes after the requested minutes', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();
    const timer = new BreakTimer(onFinish);

    timer.start(5);
    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(timer.getState().status).toBe('idle');
  });

  it('replaces a running timer when started again', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();
    const timer = new BreakTimer(onFinish);

    timer.start(10);
    timer.start(5);
    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(timer.getState().minutes).toBe(5);
  });

  it('stops a running timer without firing the finish callback', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();
    const timer = new BreakTimer(onFinish);

    timer.start(5);
    timer.stop();
    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(onFinish).not.toHaveBeenCalled();
    expect(timer.getState().status).toBe('idle');
  });
});
