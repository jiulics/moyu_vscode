export type BreakTimerStatus = 'idle' | 'running';

export interface BreakTimerState {
  status: BreakTimerStatus;
  minutes: number;
  startedAt?: number;
  endsAt?: number;
}

export class BreakTimer {
  private timeout: ReturnType<typeof setTimeout> | undefined;
  private state: BreakTimerState = { status: 'idle', minutes: 0 };

  constructor(private readonly onFinish: (minutes: number) => void) {}

  start(minutes: number): void {
    const normalizedMinutes = Math.max(1, Math.trunc(minutes));
    this.stop();

    const startedAt = Date.now();
    this.state = {
      status: 'running',
      minutes: normalizedMinutes,
      startedAt,
      endsAt: startedAt + normalizedMinutes * 60 * 1000
    };

    this.timeout = setTimeout(() => {
      this.timeout = undefined;
      this.state = { status: 'idle', minutes: normalizedMinutes };
      this.onFinish(normalizedMinutes);
    }, normalizedMinutes * 60 * 1000);
  }

  stop(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    this.state = { status: 'idle', minutes: this.state.minutes };
  }

  reset(): void {
    this.stop();
    this.state = { status: 'idle', minutes: 0 };
  }

  getState(): BreakTimerState {
    return { ...this.state };
  }

  dispose(): void {
    this.stop();
  }
}
