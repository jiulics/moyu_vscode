import type * as vscode from 'vscode';

import type { JsonStore } from './jsonStore';

export class MementoJsonStore<T> implements JsonStore<T> {
  constructor(
    private readonly memento: vscode.Memento,
    private readonly key: string
  ) {}

  get(defaultValue: T): T {
    return this.memento.get<T>(this.key, defaultValue);
  }

  async update(value: T): Promise<void> {
    await this.memento.update(this.key, value);
  }
}
