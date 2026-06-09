import type { JsonStore } from '../storage/jsonStore';

export interface DailyBreakStats {
  date: string;
  breakCount: number;
  readingMinutes: number;
  musicMinutes: number;
}

type BreakStatsState = Record<string, DailyBreakStats>;

export class BreakStatsStore {
  constructor(private readonly store: JsonStore<BreakStatsState>) {}

  getToday(now = new Date()): DailyBreakStats {
    const key = formatDateKey(now);
    return this.store.get({})[key] ?? createEmptyStats(key);
  }

  async recordBreak(now = new Date()): Promise<DailyBreakStats> {
    const key = formatDateKey(now);
    const state = this.store.get({});
    const next = state[key] ?? createEmptyStats(key);
    next.breakCount += 1;
    state[key] = next;
    await this.store.update(state);
    return next;
  }
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function createEmptyStats(date: string): DailyBreakStats {
  return {
    date,
    breakCount: 0,
    readingMinutes: 0,
    musicMinutes: 0
  };
}
